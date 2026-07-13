export interface BudgetFeeTier {
  min: number;
  max: number;
  rate: number;
  label: string;
}

export const BUDGET_FEE_TIERS: BudgetFeeTier[] = [
  { min: 0, max: 500, rate: 0.1, label: '$0 – $500' },
  { min: 501, max: 2000, rate: 0.08, label: '$501 – $2,000' },
  { min: 2001, max: 5000, rate: 0.06, label: '$2,001 – $5,000' },
  { min: 5001, max: Number.POSITIVE_INFINITY, rate: 0.05, label: '$5,001+' },
];

const roundMoney = (value: number) => Math.round(value * 100) / 100;

const resolveTier = (budget: number): BudgetFeeTier => {
  const safeBudget = Math.max(budget, 0);
  return (
    BUDGET_FEE_TIERS.find((tier) => safeBudget >= tier.min && safeBudget <= tier.max) ||
    BUDGET_FEE_TIERS[BUDGET_FEE_TIERS.length - 1]
  );
};

export const calculatePlatformFee = (paymentAmount: number, jobBudget: number) => {
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
