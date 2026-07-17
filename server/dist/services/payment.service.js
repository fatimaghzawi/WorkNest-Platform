"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AppError = require('../utils/AppError');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');
const env = require('../config/env');
const { stripe, isConfigured: isStripeConfigured } = require('../config/stripe');
const paymentRepository = require('../repositories/payment.repository');
const projectRepository = require('../repositories/project.repository');
const jobRepository = require('../repositories/job.repository');
const notificationTriggers = require('./notificationTriggers');
const { calculatePlatformFee } = require('../config/platformFee');
const { clientPath } = require('../utils/appUrls');
const getId = (value) => {
    if (!value)
        return '';
    if (typeof value === 'string')
        return value;
    if (value._id)
        return value._id.toString();
    return value.toString();
};
const formatCardBrand = (brand) => {
    if (!brand)
        return undefined;
    return brand.charAt(0).toUpperCase() + brand.slice(1);
};
const toClientPayment = (doc, projectTitle) => {
    if (!doc)
        return null;
    return {
        id: doc._id.toString(),
        _id: doc._id.toString(),
        projectId: getId(doc.projectId),
        jobId: getId(doc.jobId),
        proposalId: getId(doc.proposalId),
        clientId: getId(doc.clientId),
        freelancerId: getId(doc.freelancerId),
        amount: doc.amount,
        currency: doc.currency || 'USD',
        status: doc.status,
        platformFee: doc.platformFee ?? undefined,
        freelancerPayout: doc.freelancerPayout ?? undefined,
        feeRate: doc.feeRate ?? undefined,
        budgetRangeLabel: doc.budgetRangeLabel || undefined,
        cardBrand: doc.cardBrand || undefined,
        cardLast4: doc.cardLast4 || undefined,
        cardholderName: doc.cardholderName || undefined,
        projectTitle: projectTitle || undefined,
        paymentDate: doc.paymentDate ? new Date(doc.paymentDate).toISOString() : undefined,
        depositedAt: doc.depositedAt ? new Date(doc.depositedAt).toISOString() : undefined,
        releasedAt: doc.releasedAt ? new Date(doc.releasedAt).toISOString() : undefined,
        refundedAt: doc.refundedAt ? new Date(doc.refundedAt).toISOString() : undefined,
        createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : undefined,
    };
};
const assertPaymentAccess = (payment, userId, userRole) => {
    const isClient = getId(payment.clientId) === userId;
    const isFreelancer = getId(payment.freelancerId) === userId;
    if (userRole === 'admin' || isClient || isFreelancer)
        return { isClient, isFreelancer };
    throw new AppError('You do not have access to this payment', 403);
};
const createPendingEscrow = async ({ projectId, jobId, proposalId, clientId, freelancerId, amount, }) => {
    const existing = await paymentRepository.findByProjectId(projectId);
    if (existing)
        return toClientPayment(existing);
    const created = await paymentRepository.create({
        projectId,
        jobId,
        proposalId,
        clientId,
        freelancerId,
        amount,
        currency: 'USD',
        status: 'pending',
    });
    return toClientPayment(created.toObject ? created.toObject() : created);
};
const markEscrowDeposited = async (projectId, cardMeta = {}) => {
    const payment = await paymentRepository.findByProjectId(projectId);
    if (!payment) {
        throw new AppError('No escrow payment found for this project', 404);
    }
    if (payment.status !== 'pending') {
        const project = await projectRepository.findById(projectId);
        return toClientPayment(payment, project?.title);
    }
    const now = new Date();
    const updated = await paymentRepository.updateByProjectId(projectId, {
        status: 'held',
        cardBrand: cardMeta.cardBrand || undefined,
        cardLast4: cardMeta.cardLast4 || undefined,
        cardholderName: cardMeta.cardholderName || undefined,
        stripePaymentIntentId: cardMeta.stripePaymentIntentId || undefined,
        stripeCheckoutSessionId: cardMeta.stripeCheckoutSessionId || undefined,
        paymentDate: now,
        depositedAt: now,
    });
    const project = await projectRepository.findById(projectId);
    await notificationTriggers.paymentDeposited(updated, project);
    return toClientPayment(updated, project?.title);
};
const createCheckoutSession = async (projectId, clientId, returnPath = '/client/payments') => {
    if (!isStripeConfigured || !stripe) {
        throw new AppError('Stripe payment gateway is not configured', 503);
    }
    const payment = await paymentRepository.findByProjectId(projectId);
    if (!payment) {
        throw new AppError('No escrow payment found for this project', 404);
    }
    if (getId(payment.clientId) !== clientId) {
        throw new AppError('Only the client can fund project escrow', 403);
    }
    if (payment.status !== 'pending') {
        throw new AppError('Escrow for this project has already been funded or released', 400);
    }
    const project = await projectRepository.findById(projectId);
    if (project?.status === 'cancelled') {
        throw new AppError('Cannot fund escrow for a cancelled project', 400);
    }
    const projectTitle = project?.title || 'Project escrow';
    const safeReturnPath = returnPath.startsWith('/') ? returnPath : '/client/payments';
    const separator = safeReturnPath.includes('?') ? '&' : '?';
    const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: (payment.currency || 'USD').toLowerCase(),
                    product_data: {
                        name: `Escrow deposit: ${projectTitle}`,
                        description: 'Funds are held in escrow until you accept project delivery.',
                    },
                    unit_amount: Math.round(payment.amount * 100),
                },
                quantity: 1,
            },
        ],
        metadata: {
            projectId,
            paymentId: getId(payment._id),
            clientId,
        },
        success_url: `${clientPath(safeReturnPath)}${separator}checkout=success&projectId=${projectId}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${clientPath(safeReturnPath)}${separator}checkout=cancelled&projectId=${projectId}`,
    });
    if (!session.url) {
        throw new AppError('Failed to create Stripe checkout session', 500);
    }
    await paymentRepository.updateByProjectId(projectId, {
        stripeCheckoutSessionId: session.id,
    });
    return {
        url: session.url,
        sessionId: session.id,
    };
};
const extractCardMetaFromSession = async (session) => {
    const cardMeta = {
        stripeCheckoutSessionId: session.id,
    };
    if (!session.payment_intent || !stripe)
        return cardMeta;
    const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent.id;
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
        expand: ['payment_method'],
    });
    cardMeta.stripePaymentIntentId = paymentIntent.id;
    const paymentMethod = paymentIntent.payment_method;
    if (paymentMethod && typeof paymentMethod === 'object' && paymentMethod.card) {
        cardMeta.cardBrand = formatCardBrand(paymentMethod.card.brand);
        cardMeta.cardLast4 = paymentMethod.card.last4;
        cardMeta.cardholderName = paymentMethod.billing_details?.name || undefined;
    }
    return cardMeta;
};
const applyCompletedCheckoutSession = async (session) => {
    if (session.payment_status !== 'paid') {
        return { applied: false };
    }
    const projectId = session.metadata?.projectId;
    if (!projectId) {
        return { applied: false };
    }
    const payment = await paymentRepository.findByProjectId(projectId);
    if (!payment) {
        return { applied: false };
    }
    if (payment.status !== 'pending') {
        return { applied: false };
    }
    if (payment.stripeCheckoutSessionId && payment.stripeCheckoutSessionId !== session.id) {
        throw new AppError('Checkout session does not match the pending escrow payment', 400);
    }
    const cardMeta = await extractCardMetaFromSession(session);
    const updated = await markEscrowDeposited(projectId, cardMeta);
    return { applied: true, payment: updated };
};
const confirmCheckoutSession = async (projectId, clientId, sessionId) => {
    if (!isStripeConfigured || !stripe) {
        throw new AppError('Stripe payment gateway is not configured', 503);
    }
    const payment = await paymentRepository.findByProjectId(projectId);
    if (!payment) {
        throw new AppError('No escrow payment found for this project', 404);
    }
    if (getId(payment.clientId) !== clientId) {
        throw new AppError('Only the client can confirm project escrow payment', 403);
    }
    if (payment.status !== 'pending') {
        const project = await projectRepository.findById(projectId);
        return toClientPayment(payment, project?.title);
    }
    const checkoutSessionId = sessionId || payment.stripeCheckoutSessionId;
    if (!checkoutSessionId) {
        throw new AppError('No Stripe checkout session found for this payment', 400);
    }
    const session = await stripe.checkout.sessions.retrieve(checkoutSessionId);
    if (session.metadata?.projectId !== projectId) {
        throw new AppError('Checkout session does not belong to this project', 400);
    }
    if (session.metadata?.clientId !== clientId) {
        throw new AppError('Checkout session does not belong to this client', 403);
    }
    if (session.payment_status !== 'paid') {
        throw new AppError('Stripe checkout has not been completed yet', 400);
    }
    const cardMeta = await extractCardMetaFromSession(session);
    return markEscrowDeposited(projectId, cardMeta);
};
const handleStripeWebhook = async (rawBody, signature) => {
    if (!isStripeConfigured || !stripe) {
        throw new AppError('Stripe payment gateway is not configured', 503);
    }
    if (!env.stripe.webhookSecret) {
        throw new AppError('Stripe webhook secret is not configured', 503);
    }
    if (!signature) {
        throw new AppError('Missing Stripe signature header', 400);
    }
    let event;
    try {
        event = stripe.webhooks.constructEvent(rawBody, signature, env.stripe.webhookSecret);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Invalid signature';
        throw new AppError(`Webhook signature verification failed: ${message}`, 400);
    }
    if (event.type === 'checkout.session.completed') {
        await applyCompletedCheckoutSession(event.data.object);
    }
    return { received: true };
};
const releaseEscrow = async (projectId) => {
    const payment = await paymentRepository.findByProjectId(projectId);
    if (!payment)
        return null;
    if (payment.status === 'released') {
        return toClientPayment(payment);
    }
    if (payment.status === 'refunded') {
        throw new AppError('Escrow for this project was refunded and cannot be released', 400);
    }
    if (payment.status !== 'held') {
        throw new AppError('Escrow must be funded before funds can be released to the freelancer', 400);
    }
    const now = new Date();
    const job = payment.jobId ? await jobRepository.findById(getId(payment.jobId)) : null;
    const jobBudget = job?.budget || payment.amount;
    const feeBreakdown = calculatePlatformFee(payment.amount, jobBudget);
    const updated = await paymentRepository.updateByProjectId(projectId, {
        status: 'released',
        releasedAt: now,
        paymentDate: now,
        platformFee: feeBreakdown.platformFee,
        freelancerPayout: feeBreakdown.freelancerPayout,
        feeRate: feeBreakdown.feeRate,
        budgetRangeLabel: feeBreakdown.budgetRangeLabel,
    });
    const project = await projectRepository.findById(projectId);
    await notificationTriggers.paymentReleased(updated, project);
    return toClientPayment(updated, project?.title);
};
const refundEscrow = async (projectId) => {
    const payment = await paymentRepository.findByProjectId(projectId);
    if (!payment)
        return null;
    if (payment.status === 'refunded') {
        return toClientPayment(payment);
    }
    if (payment.status === 'released') {
        throw new AppError('Cannot refund escrow that has already been released to the freelancer', 400);
    }
    if (payment.status === 'held') {
        if (payment.stripePaymentIntentId) {
            if (!isStripeConfigured || !stripe) {
                throw new AppError('Stripe payment gateway is not configured for refunds', 503);
            }
            await stripe.refunds.create({
                payment_intent: payment.stripePaymentIntentId,
            });
        }
    }
    else if (payment.status !== 'pending') {
        throw new AppError('Only pending or held escrow payments can be refunded', 400);
    }
    const now = new Date();
    const updated = await paymentRepository.updateByProjectId(projectId, {
        status: 'refunded',
        refundedAt: now,
        paymentDate: now,
    });
    const project = await projectRepository.findById(projectId);
    await notificationTriggers.paymentRefunded(updated, project);
    return toClientPayment(updated, project?.title);
};
const assertEscrowHeldForProject = async (projectId) => {
    const payment = await paymentRepository.findByProjectId(projectId);
    if (!payment)
        return;
    if (payment.status !== 'held') {
        throw new AppError('Project escrow must be funded by the client before work can begin in the workspace', 403);
    }
};
const getPaymentByProject = async (projectId, userId, userRole) => {
    const payment = await paymentRepository.findByProjectId(projectId);
    if (!payment)
        return null;
    assertPaymentAccess(payment, userId, userRole);
    const project = await projectRepository.findById(projectId);
    return toClientPayment(payment, project?.title || project?.jobId?.title);
};
const getWalletSummary = async (userId, userRole) => {
    if (userRole === 'client') {
        const [pendingDeposit, inEscrow, completedPayouts] = await Promise.all([
            paymentRepository.sumForUser(userId, 'client', 'pending'),
            paymentRepository.sumForUser(userId, 'client', 'held'),
            paymentRepository.sumForUser(userId, 'client', 'released'),
        ]);
        return {
            role: 'client',
            pendingDeposit,
            inEscrow,
            completedPayouts,
            availableBalance: 0,
        };
    }
    if (userRole === 'freelancer') {
        const [pendingPayouts, totalEarned] = await Promise.all([
            paymentRepository.sumForUser(userId, 'freelancer', 'held'),
            paymentRepository.sumForUser(userId, 'freelancer', 'released'),
        ]);
        return {
            role: 'freelancer',
            pendingPayouts,
            totalEarned,
            availableBalance: totalEarned,
            inEscrow: pendingPayouts,
        };
    }
    if (userRole === 'admin') {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const [totalProfit, profitThisMonth] = await Promise.all([
            paymentRepository.sumPlatformFees('released'),
            paymentRepository.sumPlatformFees('released', startOfMonth),
        ]);
        return {
            role: 'admin',
            totalProfit,
            profitThisMonth,
            availableBalance: totalProfit,
        };
    }
    throw new AppError('Wallet summary is only available for clients, freelancers, and admins', 403);
};
const listPayments = async (userId, userRole, query = {}) => {
    const { page, limit, skip } = parsePagination(query);
    const status = typeof query.status === 'string' ? query.status : undefined;
    if (userRole === 'admin') {
        const [rows, total] = await Promise.all([
            paymentRepository.findReleasedWithFees({ skip, limit }),
            paymentRepository.countReleasedWithFees(),
        ]);
        const projectIds = rows.map((row) => getId(row.projectId));
        const projects = await Promise.all(projectIds.map((id) => projectRepository.findById(id).catch(() => null)));
        const titleMap = new Map(projects.filter(Boolean).map((project) => [getId(project._id), project.title]));
        return {
            payments: rows.map((row) => toClientPayment(row, titleMap.get(getId(row.projectId)))),
            meta: buildPaginationMeta(total, page, limit),
        };
    }
    const [rows, total] = await Promise.all([
        paymentRepository.findForUser({ userId, role: userRole, status, skip, limit }),
        paymentRepository.countForUser(userId, userRole, status),
    ]);
    const projectIds = rows.map((row) => getId(row.projectId));
    const projects = await Promise.all(projectIds.map((id) => projectRepository.findById(id).catch(() => null)));
    const titleMap = new Map(projects.filter(Boolean).map((project) => [getId(project._id), project.title]));
    return {
        payments: rows.map((row) => toClientPayment(row, titleMap.get(getId(row.projectId)))),
        meta: buildPaginationMeta(total, page, limit),
    };
};
const mapPaymentsByProjectId = async (projectIds) => {
    if (projectIds.length === 0)
        return new Map();
    const payments = await paymentRepository.findByProjectIds(projectIds);
    return new Map(payments.map((payment) => [getId(payment.projectId), toClientPayment(payment)]));
};
module.exports = {
    toClientPayment,
    createPendingEscrow,
    markEscrowDeposited,
    createCheckoutSession,
    confirmCheckoutSession,
    handleStripeWebhook,
    releaseEscrow,
    refundEscrow,
    assertEscrowHeldForProject,
    getPaymentByProject,
    getWalletSummary,
    listPayments,
    mapPaymentsByProjectId,
};
