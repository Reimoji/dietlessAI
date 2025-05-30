import { addSubscriberToList, createOrUpdateProfile, trackEvent } from './klaviyo-api';

/**
 * Track a subscription event in Klaviyo
 */
export async function trackSubscriptionEvent(
  eventName: string,
  email: string,
  subscriptionData: {
    planName?: string;
    planId?: string;
    status?: string;
    amount?: number;
    currency?: string;
    interval?: string;
    startDate?: string;
    endDate?: string;
    cancelReason?: string;
    [key: string]: any;
  }
) {
  try {
    // First, create or update the profile
    const profileProperties: Record<string, any> = {
      subscription_status: subscriptionData.status,
    };
    
    if (subscriptionData.planName) {
      profileProperties.subscription_plan = subscriptionData.planName;
    }
    
    if (subscriptionData.interval) {
      profileProperties.subscription_interval = subscriptionData.interval;
    }
    
    // Create or update the profile
    await createOrUpdateProfile(email, profileProperties);
    
    // Add to customers list if configured
    if (process.env.KLAVIYO_CUSTOMERS_LIST_ID) {
      await addSubscriberToList(
        email, 
        process.env.KLAVIYO_CUSTOMERS_LIST_ID,
        profileProperties
      );
    }
    
    // Track the specific event
    return await trackEvent(eventName, email, subscriptionData);
  } catch (error) {
    console.error('Error tracking subscription event in Klaviyo:', error);
    return { success: false, error: 'Failed to track subscription event' };
  }
}

/**
 * Handle subscription created event
 */
export async function handleSubscriptionCreated(
  email: string,
  subscription: any,
  product: any
) {
  return trackSubscriptionEvent(
    'Subscription Created',
    email,
    {
      planName: product?.name || 'Unknown Plan',
      planId: subscription.items.data[0]?.price.id,
      status: subscription.status,
      amount: subscription.items.data[0]?.price.unit_amount / 100,
      currency: subscription.items.data[0]?.price.currency,
      interval: subscription.items.data[0]?.price.recurring?.interval,
      startDate: new Date(subscription.current_period_start * 1000).toISOString(),
      endDate: new Date(subscription.current_period_end * 1000).toISOString(),
      trial_end: subscription.trial_end 
        ? new Date(subscription.trial_end * 1000).toISOString() 
        : null,
      is_trial: !!subscription.trial_end,
    }
  );
}

/**
 * Handle subscription updated event
 */
export async function handleSubscriptionUpdated(
  email: string,
  subscription: any,
  product: any
) {
  return trackSubscriptionEvent(
    'Subscription Updated',
    email,
    {
      planName: product?.name || 'Unknown Plan',
      planId: subscription.items.data[0]?.price.id,
      status: subscription.status,
      amount: subscription.items.data[0]?.price.unit_amount / 100,
      currency: subscription.items.data[0]?.price.currency,
      interval: subscription.items.data[0]?.price.recurring?.interval,
      startDate: new Date(subscription.current_period_start * 1000).toISOString(),
      endDate: new Date(subscription.current_period_end * 1000).toISOString(),
    }
  );
}

/**
 * Handle subscription cancelled event
 */
export async function handleSubscriptionCancelled(
  email: string,
  subscription: any,
  product: any,
  cancelReason?: string
) {
  return trackSubscriptionEvent(
    'Subscription Cancelled',
    email,
    {
      planName: product?.name || 'Unknown Plan',
      planId: subscription.items.data[0]?.price.id,
      status: subscription.status,
      cancelReason: cancelReason || 'Unknown',
      cancelDate: new Date().toISOString(),
    }
  );
}
