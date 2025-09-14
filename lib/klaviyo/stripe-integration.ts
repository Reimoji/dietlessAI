import { addSubscriberToList, createOrUpdateProfile, trackEvent } from './klaviyo-api';

// ---------- helpers ----------
const unixToISO = (v: unknown): string | null =>
  typeof v === 'number' ? new Date(v * 1000).toISOString() : null;

const centsTo = (v: unknown): number | null => (typeof v === 'number' ? v / 100 : null);

const orNull = <T>(v: T | undefined | null): T | null => (v == null ? null : v);

// Stripe's newer API may not type these fields on Subscription, so we use `any` access safely.
const getPeriod = (sub: any) => ({
  startISO: unixToISO(sub?.current_period_start),
  endISO: unixToISO(sub?.current_period_end),
  trialEndISO: unixToISO(sub?.trial_end),
  endedAtISO: unixToISO(sub?.ended_at),
});

const getPriceBits = (sub: any) => {
  const item = sub?.items?.data?.[0];
  const price = item?.price;
  return {
    planId: orNull(price?.id),
    amount: centsTo(price?.unit_amount),
    currency: orNull(price?.currency),
    interval: orNull(price?.recurring?.interval),
  };
};

/**
 * Track a subscription event in Klaviyo
 */
export async function trackSubscriptionEvent(
  eventName: string,
  email: string,
  subscriptionData: {
    planName?: string | null;
    planId?: string | null;
    status?: string | null;
    amount?: number | null;
    currency?: string | null;
    interval?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    trial_end?: string | null;
    is_trial?: boolean | null;
    cancelReason?: string | null;
    cancelDate?: string | null;
    [key: string]: any;
  },
) {
  try {
    // Build profile props (only include keys that have values)
    const profileProperties: Record<string, any> = {};
    if (subscriptionData.status) profileProperties.subscription_status = subscriptionData.status;
    if (subscriptionData.planName) profileProperties.subscription_plan = subscriptionData.planName;
    if (subscriptionData.interval)
      profileProperties.subscription_interval = subscriptionData.interval;

    // Create or update the profile
    await createOrUpdateProfile(email, profileProperties);

    // Add to customers list if configured
    if (process.env.KLAVIYO_CUSTOMERS_LIST_ID) {
      await addSubscriberToList(email, process.env.KLAVIYO_CUSTOMERS_LIST_ID, profileProperties);
    }

    // Track the specific event (safe payload — nulls are fine)
    return await trackEvent(eventName, email, subscriptionData);
  } catch (error) {
    console.error('Error tracking subscription event in Klaviyo:', error);
    return { success: false, error: 'Failed to track subscription event' };
  }
}

/**
 * Handle subscription created event
 */
export async function handleSubscriptionCreated(email: string, subscription: any, product: any) {
  const { startISO, endISO, trialEndISO } = getPeriod(subscription);
  const { planId, amount, currency, interval } = getPriceBits(subscription);

  return trackSubscriptionEvent('Subscription Created', email, {
    planName: product?.name ?? 'Unknown Plan',
    planId,
    status: subscription?.status ?? null,
    amount,
    currency,
    interval,
    startDate: startISO,
    endDate: endISO,
    trial_end: trialEndISO,
    is_trial: !!trialEndISO,
  });
}

/**
 * Handle subscription updated event
 */
export async function handleSubscriptionUpdated(email: string, subscription: any, product: any) {
  const { startISO, endISO } = getPeriod(subscription);
  const { planId, amount, currency, interval } = getPriceBits(subscription);

  return trackSubscriptionEvent('Subscription Updated', email, {
    planName: product?.name ?? 'Unknown Plan',
    planId,
    status: subscription?.status ?? null,
    amount,
    currency,
    interval,
    startDate: startISO, // may be null on some updates — OK
    endDate: endISO, // may be null on some updates — OK
  });
}

/**
 * Handle subscription cancelled event
 */
export async function handleSubscriptionCancelled(
  email: string,
  subscription: any,
  product: any,
  cancelReason?: string,
) {
  const { endedAtISO } = getPeriod(subscription);
  const { planId } = getPriceBits(subscription);

  return trackSubscriptionEvent('Subscription Cancelled', email, {
    planName: product?.name ?? 'Unknown Plan',
    planId,
    status: subscription?.status ?? 'canceled',
    cancelReason: cancelReason ?? 'Unknown',
    cancelDate: endedAtISO ?? new Date().toISOString(), // prefer Stripe’s ended_at; fallback to now
  });
}
