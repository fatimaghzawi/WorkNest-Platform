"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Full wipe + realistic WorkNest demo seed.
 * Primary dashboard account (heavy data): freelancer1@worknest.com
 *
 * Usage: npx tsx src/scripts/seedDemoData.ts
 */
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt = require('bcryptjs');
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env'), quiet: true });
const User_1 = __importDefault(require("../models/User"));
const Category_1 = __importDefault(require("../models/Category"));
const Job_1 = __importDefault(require("../models/Job"));
const Proposal_1 = __importDefault(require("../models/Proposal"));
const Project_1 = __importDefault(require("../models/Project"));
const Payment_1 = __importDefault(require("../models/Payment"));
const Task_1 = __importDefault(require("../models/Task"));
const Interview_1 = __importDefault(require("../models/Interview"));
const Notification_1 = __importDefault(require("../models/Notification"));
const platformFee_1 = require("../config/platformFee");
const DEMO_PASSWORD = 'Demo1234!';
const ADMIN_EMAIL = 'admin@worknest.com';
const ADMIN_PASSWORD = 'Admin123!';
const PRIMARY_FREELANCER_EMAIL = 'freelancer1@worknest.com';
const SALT_ROUNDS = 12;
const daysFromNow = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
};
const daysAgo = (days) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
};
const roundMoney = (value) => Math.round(value * 100) / 100;
const feeFor = (amount, budget) => (0, platformFee_1.calculatePlatformFee)(amount, budget);
async function wipeDatabase() {
    const collections = [
        'notifications',
        'interviews',
        'tasks',
        'payments',
        'projects',
        'proposals',
        'jobs',
        'categories',
        'users',
        'workspaceattachments',
        'refreshtokens',
        'logs',
    ];
    for (const name of collections) {
        try {
            await mongoose_1.default.connection.collection(name).deleteMany({});
        }
        catch {
            /* collection may not exist yet */
        }
    }
}
async function createHireBundle(opts) {
    const { job, proposal, kind } = opts;
    const amount = proposal.price;
    const clientId = job.clientId;
    const freelancerId = proposal.freelancerId;
    let projectStatus = 'active';
    let progress = 0;
    let paymentStatus = 'pending';
    if (kind === 'hired_unpaid') {
        projectStatus = 'active';
        progress = 10;
        paymentStatus = 'pending';
    }
    else if (kind === 'active_held') {
        projectStatus = 'active';
        progress = opts.progressHint ?? 50;
        paymentStatus = 'held';
    }
    else if (kind === 'pending_review') {
        projectStatus = 'pending_review';
        progress = 100;
        paymentStatus = 'held';
    }
    else if (kind === 'completed') {
        projectStatus = 'completed';
        progress = 100;
        paymentStatus = 'released';
    }
    else if (kind === 'cancelled_partial') {
        projectStatus = 'cancelled';
        progress = 50;
        paymentStatus = 'released';
    }
    const project = await Project_1.default.create({
        jobId: job._id,
        clientId,
        freelancerId,
        title: job.title,
        status: projectStatus,
        progress,
        githubLink: kind === 'completed' || kind === 'pending_review'
            ? 'https://github.com/worknest-demo/delivery'
            : undefined,
        deliveryNotes: kind === 'pending_review' || kind === 'completed'
            ? 'Deliverables are ready — please review the repo and notes.'
            : undefined,
        reviewNotes: kind === 'completed' ? 'Excellent work. Accepted.' : undefined,
        submittedAt: kind === 'pending_review' || kind === 'completed' ? daysAgo(2) : undefined,
    });
    const paymentDoc = {
        projectId: project._id,
        jobId: job._id,
        proposalId: proposal._id,
        clientId,
        freelancerId,
        amount,
        currency: 'USD',
        status: paymentStatus,
    };
    if (paymentStatus === 'held' || paymentStatus === 'released') {
        Object.assign(paymentDoc, {
            cardBrand: 'visa',
            cardLast4: '4242',
            cardholderName: 'Demo Cardholder',
            stripeCheckoutSessionId: `cs_demo_${String(job._id).slice(-8)}`,
            stripePaymentIntentId: `pi_demo_${String(job._id).slice(-8)}`,
            paymentDate: daysAgo(12),
            depositedAt: daysAgo(12),
        });
    }
    if (paymentStatus === 'released') {
        paymentDoc.releasedAt = daysAgo(1);
        if (kind === 'cancelled_partial') {
            const releasedGross = roundMoney(amount * 0.5);
            const refundAmount = roundMoney(amount - releasedGross);
            const fees = feeFor(releasedGross, job.budget);
            Object.assign(paymentDoc, {
                refundedAmount: refundAmount,
                refundedAt: daysAgo(1),
                cancellationProgress: 50,
                ...fees,
            });
        }
        else {
            Object.assign(paymentDoc, feeFor(amount, job.budget));
        }
    }
    await Payment_1.default.create(paymentDoc);
    const clientCreator = clientId;
    const freelancerCreator = freelancerId;
    if (kind === 'hired_unpaid') {
        await Task_1.default.insertMany([
            {
                jobId: job._id,
                title: 'Kickoff call notes',
                description: 'Capture requirements and success criteria.',
                status: 'todo',
                priority: 'high',
                origin: 'client',
                createdBy: clientCreator,
            },
            {
                jobId: job._id,
                title: 'Project scaffold',
                status: 'todo',
                priority: 'medium',
                origin: 'freelancer',
                createdBy: freelancerCreator,
            },
        ]);
    }
    else if (kind === 'active_held') {
        await Task_1.default.insertMany([
            {
                jobId: job._id,
                title: 'Discovery & architecture',
                status: 'done',
                priority: 'high',
                origin: 'client',
                createdBy: clientCreator,
                submissionNotes: 'Shared architecture doc.',
                submittedAt: daysAgo(9),
            },
            {
                jobId: job._id,
                title: 'Core feature build',
                status: 'in_progress',
                priority: 'high',
                origin: 'freelancer',
                createdBy: freelancerCreator,
            },
            {
                jobId: job._id,
                title: 'QA checklist',
                status: 'todo',
                priority: 'medium',
                origin: 'client',
                createdBy: clientCreator,
                dueDate: daysFromNow(7),
            },
            {
                jobId: job._id,
                title: 'Draft UI review',
                status: 'review',
                priority: 'medium',
                origin: 'freelancer',
                createdBy: freelancerCreator,
                submissionNotes: 'Please review the staging screens.',
                submittedAt: daysAgo(1),
                dueDate: daysFromNow(2),
            },
        ]);
    }
    else if (kind === 'pending_review') {
        await Task_1.default.insertMany([
            {
                jobId: job._id,
                title: 'Implementation',
                status: 'done',
                priority: 'high',
                origin: 'freelancer',
                createdBy: freelancerCreator,
                submissionNotes: 'Shipped to staging.',
                submittedAt: daysAgo(5),
            },
            {
                jobId: job._id,
                title: 'Tests & polish',
                status: 'done',
                priority: 'high',
                origin: 'freelancer',
                createdBy: freelancerCreator,
                submissionNotes: 'Coverage + bugfixes done.',
                submittedAt: daysAgo(3),
            },
            {
                jobId: job._id,
                title: 'Handoff docs',
                status: 'done',
                priority: 'medium',
                origin: 'client',
                createdBy: clientCreator,
                submissionNotes: 'README and runbook attached.',
                submittedAt: daysAgo(2),
            },
        ]);
    }
    else if (kind === 'completed') {
        await Task_1.default.insertMany([
            {
                jobId: job._id,
                title: 'Discovery',
                status: 'done',
                priority: 'medium',
                origin: 'client',
                createdBy: clientCreator,
                submissionNotes: 'Done',
                submittedAt: daysAgo(20),
            },
            {
                jobId: job._id,
                title: 'Build & delivery',
                status: 'done',
                priority: 'high',
                origin: 'freelancer',
                createdBy: freelancerCreator,
                submissionNotes: 'Done',
                submittedAt: daysAgo(6),
            },
            {
                jobId: job._id,
                title: 'Final handoff',
                status: 'done',
                priority: 'low',
                origin: 'freelancer',
                createdBy: freelancerCreator,
                submissionNotes: 'Done',
                submittedAt: daysAgo(3),
            },
        ]);
    }
    else if (kind === 'cancelled_partial') {
        await Task_1.default.insertMany([
            {
                jobId: job._id,
                title: 'Wireframes / first milestone',
                status: 'done',
                priority: 'high',
                origin: 'freelancer',
                createdBy: freelancerCreator,
                submissionNotes: 'Approved drafts.',
                submittedAt: daysAgo(14),
            },
            {
                jobId: job._id,
                title: 'Second milestone build',
                status: 'in_progress',
                priority: 'high',
                origin: 'client',
                createdBy: clientCreator,
                dueDate: daysFromNow(10),
            },
        ]);
    }
    return project;
}
async function seed() {
    const uri = process.env.MONGO_URI;
    if (!uri)
        throw new Error('MONGO_URI is missing from server/.env');
    await mongoose_1.default.connect(uri);
    console.log('Connected to MongoDB');
    await wipeDatabase();
    console.log('Database wiped');
    const demoHash = await bcrypt.hash(DEMO_PASSWORD, SALT_ROUNDS);
    const adminHash = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);
    await User_1.default.create({
        firstName: 'WorkNest',
        lastName: 'Admin',
        email: ADMIN_EMAIL,
        password: adminHash,
        role: 'admin',
        authProvider: 'local',
        emailVerified: true,
        isActive: true,
        skills: [],
    });
    await Category_1.default.insertMany([
        {
            name: 'Web Development',
            slug: 'web-development',
            description: 'Full-stack and frontend applications',
            isActive: true,
        },
        {
            name: 'Mobile Development',
            slug: 'mobile-development',
            description: 'iOS, Android, and cross-platform apps',
            isActive: true,
        },
        {
            name: 'UI/UX Design',
            slug: 'ui-ux-design',
            description: 'Product design, research, and prototypes',
            isActive: true,
        },
        {
            name: 'Content Writing',
            slug: 'content-writing',
            description: 'Marketing copy, blogs, and documentation',
            isActive: true,
        },
        {
            name: 'Data Science',
            slug: 'data-science',
            description: 'Analytics, ML, and reporting pipelines',
            isActive: true,
        },
        {
            name: 'DevOps',
            slug: 'devops',
            description: 'Cloud, CI/CD, and infrastructure',
            isActive: true,
        },
    ]);
    const clients = await User_1.default.insertMany([
        {
            firstName: 'Sarah',
            lastName: 'Chen',
            email: 'client1@worknest.com',
            bio: 'Founder at NovaSaaS. Shipping B2B tools for revenue teams.',
            password: demoHash,
            role: 'client',
            authProvider: 'local',
            emailVerified: true,
            isActive: true,
            skills: [],
        },
        {
            firstName: 'Marcus',
            lastName: 'Whitfield',
            email: 'client2@worknest.com',
            bio: 'Owner of Northbeam Commerce — DTC apparel brand.',
            password: demoHash,
            role: 'client',
            authProvider: 'local',
            emailVerified: true,
            isActive: true,
            skills: [],
        },
        {
            firstName: 'Aisha',
            lastName: 'Patel',
            email: 'client3@worknest.com',
            bio: 'Director at Pulse Agency. Need reliable long-term freelancers.',
            password: demoHash,
            role: 'client',
            authProvider: 'local',
            emailVerified: true,
            isActive: true,
            skills: [],
        },
        {
            firstName: 'James',
            lastName: 'Okafor',
            email: 'client4@worknest.com',
            bio: 'Ops lead at BrightPath nonprofit.',
            password: demoHash,
            role: 'client',
            authProvider: 'local',
            emailVerified: true,
            isActive: true,
            skills: [],
        },
        {
            firstName: 'Elena',
            lastName: 'Rossi',
            email: 'client5@worknest.com',
            bio: 'Product manager at Ledgerly Fintech.',
            password: demoHash,
            role: 'client',
            authProvider: 'local',
            emailVerified: true,
            isActive: true,
            skills: [],
        },
        {
            firstName: 'Noah',
            lastName: 'Kim',
            email: 'client6@worknest.com',
            bio: 'Co-founder of CareLink Health.',
            password: demoHash,
            role: 'client',
            authProvider: 'local',
            emailVerified: true,
            isActive: true,
            skills: [],
        },
        {
            firstName: 'Priya',
            lastName: 'Singh',
            email: 'client7@worknest.com',
            bio: 'Content lead at StudyNest EdTech.',
            password: demoHash,
            role: 'client',
            authProvider: 'local',
            emailVerified: true,
            isActive: true,
            skills: [],
        },
        {
            firstName: 'Daniel',
            lastName: 'Brooks',
            email: 'client8@worknest.com',
            bio: 'CEO of RouteForge logistics.',
            password: demoHash,
            role: 'client',
            authProvider: 'local',
            emailVerified: true,
            isActive: true,
            skills: [],
        },
        {
            firstName: 'Sofia',
            lastName: 'Almeida',
            email: 'client9@worknest.com',
            bio: 'Operator at WanderList travel.',
            password: demoHash,
            role: 'client',
            authProvider: 'local',
            emailVerified: true,
            isActive: true,
            skills: [],
        },
        {
            firstName: 'Liam',
            lastName: 'Nguyen',
            email: 'client10@worknest.com',
            bio: 'Building a multi-vendor marketplace.',
            password: demoHash,
            role: 'client',
            authProvider: 'local',
            emailVerified: true,
            isActive: true,
            skills: [],
        },
    ]);
    const freelancers = await User_1.default.insertMany([
        {
            firstName: 'Alex',
            lastName: 'Rivera',
            email: PRIMARY_FREELANCER_EMAIL,
            skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Next.js'],
            bio: 'Full-stack engineer (6 yrs). Strong on SaaS dashboards, APIs, and clean UX handoff.',
            portfolioLink: 'https://portfolio.example.com/alex-rivera',
            password: demoHash,
            role: 'freelancer',
            authProvider: 'local',
            emailVerified: true,
            isActive: true,
        },
        {
            firstName: 'Maya',
            lastName: 'Thompson',
            email: 'freelancer2@worknest.com',
            skills: ['Figma', 'UI Design', 'Prototyping', 'Design Systems'],
            bio: 'Product designer specializing in SaaS workflows.',
            portfolioLink: 'https://portfolio.example.com/maya',
            password: demoHash,
            role: 'freelancer',
            authProvider: 'local',
            emailVerified: true,
            isActive: true,
        },
        {
            firstName: 'Chris',
            lastName: 'Park',
            email: 'freelancer3@worknest.com',
            skills: ['React Native', 'Swift', 'Firebase'],
            bio: 'Mobile specialist for consumer and B2B apps.',
            portfolioLink: 'https://portfolio.example.com/chris',
            password: demoHash,
            role: 'freelancer',
            authProvider: 'local',
            emailVerified: true,
            isActive: true,
        },
        {
            firstName: 'Nina',
            lastName: 'Volkov',
            email: 'freelancer4@worknest.com',
            skills: ['Python', 'Pandas', 'SQL', 'ML'],
            bio: 'Data scientist who ships practical reporting pipelines.',
            portfolioLink: 'https://portfolio.example.com/nina',
            password: demoHash,
            role: 'freelancer',
            authProvider: 'local',
            emailVerified: true,
            isActive: true,
        },
        {
            firstName: 'Omar',
            lastName: 'Hassan',
            email: 'freelancer5@worknest.com',
            skills: ['AWS', 'Docker', 'Kubernetes', 'GitHub Actions'],
            bio: 'DevOps engineer focused on reliable deploys.',
            portfolioLink: 'https://portfolio.example.com/omar',
            password: demoHash,
            role: 'freelancer',
            authProvider: 'local',
            emailVerified: true,
            isActive: true,
        },
        {
            firstName: 'Grace',
            lastName: 'Lee',
            email: 'freelancer6@worknest.com',
            skills: ['Copywriting', 'SEO', 'Content Strategy'],
            bio: 'B2B content writer and SEO strategist.',
            portfolioLink: 'https://portfolio.example.com/grace',
            password: demoHash,
            role: 'freelancer',
            authProvider: 'local',
            emailVerified: true,
            isActive: true,
        },
        {
            firstName: 'Ethan',
            lastName: 'Brooks',
            email: 'freelancer7@worknest.com',
            skills: ['Vue', 'Laravel', 'MySQL'],
            bio: 'Backend-leaning fullstack developer.',
            portfolioLink: 'https://portfolio.example.com/ethan',
            password: demoHash,
            role: 'freelancer',
            authProvider: 'local',
            emailVerified: true,
            isActive: true,
        },
        {
            firstName: 'Zara',
            lastName: 'Ahmed',
            email: 'freelancer8@worknest.com',
            skills: ['Next.js', 'Tailwind', 'GraphQL'],
            bio: 'Frontend engineer for design-heavy products.',
            portfolioLink: 'https://portfolio.example.com/zara',
            password: demoHash,
            role: 'freelancer',
            authProvider: 'local',
            emailVerified: true,
            isActive: true,
        },
        {
            firstName: 'Ben',
            lastName: 'Carter',
            email: 'freelancer9@worknest.com',
            skills: ['Flutter', 'Dart', 'Firebase'],
            bio: 'Cross-platform mobile apps with polished UX.',
            portfolioLink: 'https://portfolio.example.com/ben',
            password: demoHash,
            role: 'freelancer',
            authProvider: 'local',
            emailVerified: true,
            isActive: true,
        },
        {
            firstName: 'Iris',
            lastName: 'Zhang',
            email: 'freelancer10@worknest.com',
            skills: ['UX Research', 'Wireframing', 'Figma'],
            bio: 'UX researcher and design partner for early products.',
            portfolioLink: 'https://portfolio.example.com/iris',
            password: demoHash,
            role: 'freelancer',
            authProvider: 'local',
            emailVerified: true,
            isActive: true,
        },
    ]);
    const primary = freelancers[0];
    const C = clients;
    // ---------- Open marketplace jobs (browse feed) ----------
    const openJobs = await Job_1.default.insertMany([
        {
            clientId: C[0]._id,
            title: 'Analytics dashboard for SaaS billing metrics',
            description: 'We need a React + TypeScript dashboard that visualizes MRR, churn, and cohort retention. Must integrate with our existing Nest API and support CSV export. Looking for clean charts, responsive layout, and sensible loading states.',
            category: 'web-development',
            budget: 2800,
            skills: ['React', 'TypeScript', 'Node.js'],
            deadline: daysFromNow(40),
            status: 'open',
        },
        {
            clientId: C[1]._id,
            title: 'Redesign mobile checkout funnel',
            description: 'Improve conversion on our Shopify-like checkout. Produce Figma flows for cart → shipping → payment → confirmation with accessibility notes and a short prototype.',
            category: 'ui-ux-design',
            budget: 1600,
            skills: ['Figma', 'UI Design', 'Prototyping'],
            deadline: daysFromNow(28),
            status: 'open',
        },
        {
            clientId: C[7]._id,
            title: 'Live fleet map for logistics ops',
            description: 'Build a map-centric React UI for vehicle locations, route history, and driver status. WebSocket-friendly architecture preferred.',
            category: 'web-development',
            budget: 3200,
            skills: ['React', 'TypeScript', 'WebSockets'],
            deadline: daysFromNow(45),
            status: 'open',
        },
        {
            clientId: C[2]._id,
            title: 'Agency client portal MVP',
            description: 'Create a client portal: login, project status, invoice list, and file downloads. Next.js + Tailwind preferred.',
            category: 'web-development',
            budget: 3500,
            skills: ['Next.js', 'Tailwind', 'Node.js'],
            deadline: daysFromNow(50),
            status: 'open',
        },
        {
            clientId: C[8]._id,
            title: 'Travel itinerary planner (Flutter)',
            description: 'Cross-platform itinerary planner with offline drafts, shared trips, and map pins. Firebase backend is fine for MVP.',
            category: 'mobile-development',
            budget: 4100,
            skills: ['Flutter', 'Firebase', 'Dart'],
            deadline: daysFromNow(55),
            status: 'open',
        },
    ]);
    // Primary proposals on open jobs (pending) + competitors
    const primaryPendingProps = [];
    for (const [i, job] of openJobs.slice(0, 3).entries()) {
        const mine = await Proposal_1.default.create({
            jobId: job._id,
            freelancerId: primary._id,
            coverLetter: `Hi — I'm Alex Rivera. I've shipped similar ${job.category.replace(/-/g, ' ')} work and can deliver "${job.title}" with weekly demos, clean TypeScript, and clear documentation. Happy to start with a short discovery call.`,
            price: roundMoney(job.budget * (0.88 + i * 0.03)),
            timeline: `${3 + i} weeks`,
            status: 'pending',
        });
        primaryPendingProps.push(mine);
        await Proposal_1.default.create({
            jobId: job._id,
            freelancerId: freelancers[i + 1]._id,
            coverLetter: `Interested in "${job.title}". I can start this week and keep communication tight.`,
            price: roundMoney(job.budget * 0.92),
            timeline: `${4 + i} weeks`,
            status: i === 1 ? 'rejected' : 'pending',
        });
    }
    // ---------- Primary freelancer HIRED jobs (dashboard meat) ----------
    const hireSpecs = [
        {
            clientIdx: 3,
            title: 'Donor reporting automation pipeline',
            description: 'Automate weekly donor CSV transforms into stakeholder-ready dashboards. Python + SQL preferred with documented jobs and alerts.',
            category: 'data-science',
            budget: 1800,
            skills: ['Python', 'SQL', 'Pandas'],
            deadlineDays: 35,
            price: 1650,
            kind: 'active_held',
            competitors: [3, 6],
            interview: 'completed',
        },
        {
            clientIdx: 4,
            title: 'CI/CD for Ledgerly Nest API',
            description: 'Stand up GitHub Actions, Docker images, staging/prod deploy pipelines, rollback docs, and basic monitoring hooks.',
            category: 'devops',
            budget: 2400,
            skills: ['Docker', 'GitHub Actions', 'AWS'],
            deadlineDays: 30,
            price: 2250,
            kind: 'pending_review',
            competitors: [4, 7],
            interview: 'confirmed',
        },
        {
            clientIdx: 5,
            title: 'Patient onboarding landing refresh',
            description: 'Rebuild health landing sections in React with stronger accessibility and A/B-ready content blocks.',
            category: 'web-development',
            budget: 2200,
            skills: ['React', 'TypeScript', 'Accessibility'],
            deadlineDays: 25,
            price: 2100,
            kind: 'completed',
            competitors: [5, 8],
        },
        {
            clientIdx: 6,
            title: 'Teacher portal MVP (paused)',
            description: 'Prototype assignments and grading flows. Project later cancelled after funding change — partial work already shipped.',
            category: 'web-development',
            budget: 3000,
            skills: ['React', 'Node.js', 'TypeScript'],
            deadlineDays: 40,
            price: 2800,
            kind: 'cancelled_partial',
            competitors: [6, 1],
        },
        {
            clientIdx: 9,
            title: 'Marketplace admin console (phase 1)',
            description: 'Admin console for sellers, orders, and disputes. Escrow not funded yet — waiting on deposit before workspace unlock.',
            category: 'web-development',
            budget: 5200,
            skills: ['Next.js', 'Node.js', 'TypeScript'],
            deadlineDays: 60,
            price: 4800,
            kind: 'hired_unpaid',
            competitors: [7, 0],
        },
        {
            clientIdx: 0,
            title: 'Customer success CRM widgets',
            description: 'Embeddable React widgets for CS health scores, renewal risk, and notes. Design tokens provided.',
            category: 'web-development',
            budget: 1900,
            skills: ['React', 'TypeScript', 'CSS'],
            deadlineDays: 32,
            price: 1750,
            kind: 'completed',
            competitors: [8, 2],
        },
        {
            clientIdx: 1,
            title: 'Storefront performance pass',
            description: 'Audit and fix LCP/CLS on product listing and PDP. Ship measurable improvements with before/after notes.',
            category: 'web-development',
            budget: 1400,
            skills: ['React', 'Performance', 'TypeScript'],
            deadlineDays: 21,
            price: 1300,
            kind: 'active_held',
            competitors: [7, 5],
        },
    ];
    const notifications = [];
    for (const spec of hireSpecs) {
        const client = C[spec.clientIdx];
        const jobStatus = spec.kind === 'completed' || spec.kind === 'cancelled_partial' ? 'closed' : 'in_progress';
        const job = await Job_1.default.create({
            clientId: client._id,
            title: spec.title,
            description: spec.description,
            category: spec.category,
            budget: spec.budget,
            skills: spec.skills,
            deadline: daysFromNow(spec.deadlineDays),
            status: jobStatus,
        });
        const winner = await Proposal_1.default.create({
            jobId: job._id,
            freelancerId: primary._id,
            coverLetter: `Thanks ${client.firstName} — I've done similar work and can own "${spec.title}" end-to-end with clear milestones and async updates.`,
            price: spec.price,
            timeline: '3–5 weeks',
            status: 'accepted',
        });
        for (const flIdx of spec.competitors || []) {
            // skip duplicate if competitor somehow is primary index 0 for hired_unpaid competitors including 0 — use freelancers[flIdx] but avoid primary
            const freelancer = freelancers[flIdx === 0 ? 2 : flIdx];
            if (String(freelancer._id) === String(primary._id))
                continue;
            await Proposal_1.default.create({
                jobId: job._id,
                freelancerId: freelancer._id,
                coverLetter: `I'd love to help with "${spec.title}". Happy to discuss scope.`,
                price: roundMoney(spec.budget * 0.9),
                timeline: '4 weeks',
                status: 'rejected',
            });
        }
        const project = await createHireBundle({ job, proposal: winner, kind: spec.kind });
        if (spec.interview) {
            await Interview_1.default.create({
                jobId: job._id,
                proposalId: winner._id,
                clientId: client._id,
                freelancerId: primary._id,
                scheduledDate: spec.interview === 'completed' ? daysAgo(8) : daysFromNow(2),
                duration: 30,
                meetingLink: `https://meet.example.com/worknest-${String(job._id).slice(-6)}`,
                notes: 'Discuss scope, timeline, and technical approach.',
                status: spec.interview === 'completed' ? 'completed' : spec.interview,
            });
        }
        notifications.push({
            recipientId: primary._id,
            type: 'proposal.accepted',
            title: 'Proposal accepted',
            message: `Your proposal for "${job.title}" was accepted.`,
            relatedJobId: job._id,
            relatedProposalId: winner._id,
            relatedProjectId: project._id,
            isRead: spec.kind === 'completed',
        });
        if (spec.kind === 'completed') {
            notifications.push({
                recipientId: primary._id,
                type: 'payment.released',
                title: 'Payout released',
                message: `Escrow for "${job.title}" was released to your wallet.`,
                relatedJobId: job._id,
                relatedProjectId: project._id,
                isRead: false,
            });
        }
        if (spec.kind === 'pending_review') {
            notifications.push({
                recipientId: primary._id,
                type: 'project.submitted_for_review',
                title: 'Delivery submitted',
                message: `"${job.title}" is waiting for client review.`,
                relatedJobId: job._id,
                relatedProjectId: project._id,
                isRead: false,
            });
        }
        if (spec.kind === 'cancelled_partial') {
            notifications.push({
                recipientId: primary._id,
                type: 'project.cancelled',
                title: 'Project cancelled',
                message: `"${job.title}" was cancelled. Partial payout was released for completed progress.`,
                relatedJobId: job._id,
                relatedProjectId: project._id,
                isRead: false,
            });
        }
    }
    // Rejected proposals for primary (realistic "not selected")
    const rejectJob = await Job_1.default.create({
        clientId: C[2]._id,
        title: 'Brand illustration pack',
        description: 'Illustrations for campaign landing — not Alex’s core stack; proposal declined.',
        category: 'ui-ux-design',
        budget: 900,
        skills: ['Illustration', 'Figma'],
        deadline: daysFromNow(20),
        status: 'open',
    });
    const rejectedMine = await Proposal_1.default.create({
        jobId: rejectJob._id,
        freelancerId: primary._id,
        coverLetter: 'I can partner with a designer or coordinate the engineering handoff.',
        price: 850,
        timeline: '2 weeks',
        status: 'rejected',
    });
    await Proposal_1.default.create({
        jobId: rejectJob._id,
        freelancerId: freelancers[1]._id,
        coverLetter: 'Happy to take on the illustration pack end-to-end.',
        price: 880,
        timeline: '2 weeks',
        status: 'pending',
    });
    notifications.push({
        recipientId: primary._id,
        type: 'proposal.rejected',
        title: 'Proposal not selected',
        message: `Your proposal for "${rejectJob.title}" was not selected.`,
        relatedJobId: rejectJob._id,
        relatedProposalId: rejectedMine._id,
        isRead: true,
    });
    // Interview on an open pending proposal
    await Interview_1.default.create({
        jobId: openJobs[0]._id,
        proposalId: primaryPendingProps[0]._id,
        clientId: openJobs[0].clientId,
        freelancerId: primary._id,
        scheduledDate: daysFromNow(1),
        duration: 45,
        meetingLink: 'https://meet.example.com/worknest-analytics',
        meetingPassword: 'nest-demo',
        notes: 'Walk through dashboard chart requirements.',
        status: 'scheduled',
    });
    notifications.push({
        recipientId: primary._id,
        type: 'interview.scheduled',
        title: 'Interview scheduled',
        message: `Interview scheduled for "${openJobs[0].title}".`,
        relatedJobId: openJobs[0]._id,
        relatedProposalId: primaryPendingProps[0]._id,
        isRead: false,
    });
    // A couple of other freelancers' hired jobs so client/admin dashboards aren't empty of others
    {
        const otherJob = await Job_1.default.create({
            clientId: C[8]._id,
            title: 'Trip planner mobile UX',
            description: 'Design and implement trip planner flows with offline drafts.',
            category: 'mobile-development',
            budget: 3600,
            skills: ['Flutter', 'UX Research'],
            deadline: daysFromNow(48),
            status: 'in_progress',
        });
        const otherProp = await Proposal_1.default.create({
            jobId: otherJob._id,
            freelancerId: freelancers[8]._id,
            coverLetter: 'Ben here — strong Flutter + travel UX background.',
            price: 3400,
            timeline: '5 weeks',
            status: 'accepted',
        });
        await Proposal_1.default.create({
            jobId: otherJob._id,
            freelancerId: freelancers[9]._id,
            coverLetter: 'Can support research + wireframes.',
            price: 3300,
            timeline: '5 weeks',
            status: 'rejected',
        });
        await createHireBundle({ job: otherJob, proposal: otherProp, kind: 'active_held' });
    }
    {
        const otherJob = await Job_1.default.create({
            clientId: C[5]._id,
            title: 'Healthcare SEO content package',
            description: 'Rewrite onboarding landing copy and meta for SEO.',
            category: 'content-writing',
            budget: 700,
            skills: ['Copywriting', 'SEO'],
            deadline: daysFromNow(18),
            status: 'closed',
        });
        const otherProp = await Proposal_1.default.create({
            jobId: otherJob._id,
            freelancerId: freelancers[5]._id,
            coverLetter: 'Grace — B2B/health content specialist.',
            price: 650,
            timeline: '2 weeks',
            status: 'accepted',
        });
        await createHireBundle({ job: otherJob, proposal: otherProp, kind: 'completed' });
    }
    // Client-facing notifications for a few open proposals
    for (const p of primaryPendingProps) {
        const job = openJobs.find((j) => String(j._id) === String(p.jobId)) || openJobs[0];
        notifications.push({
            recipientId: job.clientId,
            type: 'proposal.submitted',
            title: 'New proposal',
            message: `Alex Rivera submitted a proposal for "${job.title}".`,
            relatedJobId: job._id,
            relatedProposalId: p._id,
            isRead: false,
        });
    }
    await Notification_1.default.insertMany(notifications);
    const counts = {
        categories: await Category_1.default.countDocuments(),
        clients: await User_1.default.countDocuments({ role: 'client' }),
        freelancers: await User_1.default.countDocuments({ role: 'freelancer' }),
        admins: await User_1.default.countDocuments({ role: 'admin' }),
        jobs: await Job_1.default.countDocuments(),
        proposals: await Proposal_1.default.countDocuments(),
        projects: await Project_1.default.countDocuments(),
        payments: await Payment_1.default.countDocuments(),
        tasks: await Task_1.default.countDocuments(),
        interviews: await Interview_1.default.countDocuments(),
        notifications: await Notification_1.default.countDocuments(),
        primaryProposals: await Proposal_1.default.countDocuments({ freelancerId: primary._id }),
        primaryProjects: await Project_1.default.countDocuments({ freelancerId: primary._id }),
    };
    console.log('\nSeed complete:');
    console.log(JSON.stringify(counts, null, 2));
    console.log('\n--- Login ---');
    console.log(`Admin:      ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    console.log(`PRIMARY FL: ${PRIMARY_FREELANCER_EMAIL} / ${DEMO_PASSWORD}  ← use this for dashboards`);
    console.log(`Clients:    client1@worknest.com … client10@worknest.com / ${DEMO_PASSWORD}`);
    console.log(`Others FL:  freelancer2@worknest.com … freelancer10@worknest.com / ${DEMO_PASSWORD}`);
    await mongoose_1.default.disconnect();
}
seed().catch(async (err) => {
    console.error(err);
    try {
        await mongoose_1.default.disconnect();
    }
    catch {
        /* ignore */
    }
    process.exit(1);
});
