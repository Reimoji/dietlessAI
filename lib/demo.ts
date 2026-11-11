/**
 * Demo mode lets the app run as a showcase without Stripe, Resend or Klaviyo.
 *
 * Enabled when DEMO_MODE=true, or automatically when STRIPE_SECRET_KEY is missing.
 * In demo mode:
 *  - pricing is served from static plans instead of Stripe
 *  - "checkout" instantly grants a trial instead of charging a card
 *  - new sign-ups get a trial straight away so the chat is usable
 *  - emails are logged instead of sent
 */
export const isDemoMode =
  process.env.DEMO_MODE === 'true' || !process.env.STRIPE_SECRET_KEY;

export const DEMO_TRIAL_DAYS = 30;

export const demoProducts = [
  {
    id: 'prod_demo_monthly',
    name: 'DietlessAI – Monthly',
    description: 'Monthly subscription plan',
    defaultPriceId: 'price_demo_monthly',
  },
  {
    id: 'prod_demo_yearly',
    name: 'DietlessAI – Yearly',
    description: 'Annual subscription plan',
    defaultPriceId: 'price_demo_yearly',
  },
];

export const demoPrices = [
  {
    id: 'price_demo_monthly',
    productId: 'prod_demo_monthly',
    unitAmount: 500,
    currency: 'eur',
    interval: 'month' as const,
    trialPeriodDays: 2,
  },
  {
    id: 'price_demo_yearly',
    productId: 'prod_demo_yearly',
    unitAmount: 5000,
    currency: 'eur',
    interval: 'year' as const,
    trialPeriodDays: 2,
  },
];

export function demoTrialFields(planName = 'DietlessAI – Monthly') {
  return {
    planName,
    subscriptionStatus: 'trialing',
    trialEndsAt: new Date(Date.now() + DEMO_TRIAL_DAYS * 24 * 60 * 60 * 1000),
  };
}
