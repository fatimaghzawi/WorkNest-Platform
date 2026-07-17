"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePlatformFee = exports.BUDGET_FEE_TIERS = void 0;
exports.BUDGET_FEE_TIERS = [
    { min: 0, max: 500, rate: 0.1, label: '$0 – $500' },
    { min: 501, max: 2000, rate: 0.08, label: '$501 – $2,000' },
    { min: 2001, max: 5000, rate: 0.06, label: '$2,001 – $5,000' },
    { min: 5001, max: Number.POSITIVE_INFINITY, rate: 0.05, label: '$5,001+' },
];
const roundMoney = (value) => Math.round(value * 100) / 100;
const resolveTier = (budget) => {
    const safeBudget = Math.max(budget, 0);
    return (exports.BUDGET_FEE_TIERS.find((tier) => safeBudget >= tier.min && safeBudget <= tier.max) ||
        exports.BUDGET_FEE_TIERS[exports.BUDGET_FEE_TIERS.length - 1]);
};
const calculatePlatformFee = (paymentAmount, jobBudget) => {
    const amount = Math.max(paymentAmount, 0);
    const tier = resolveTier(jobBudget || amount);
    const platformFee = roundMoney(amount * tier.rate);
    const freelancerPayout = roundMoney(Math.max(amount - platformFee, 0));
    return {
        platformFee,
        freelancerPayout,
        feeRate: tier.rate,
        budgetRangeLabel: tier.label,
    };
};
exports.calculatePlatformFee = calculatePlatformFee;
