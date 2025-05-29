// Check if the API keys are set
if (!process.env.KLAVIYO_API_KEY || !process.env.KLAVIYO_PRIVATE_API_KEY) {
  console.warn('KLAVIYO_API_KEY or KLAVIYO_PRIVATE_API_KEY is not set in environment variables');
}

// Base URLs for Klaviyo API
const KLAVIYO_API_BASE_URL = 'https://a.klaviyo.com/api';

/**
 * Add a subscriber to a Klaviyo list
 */
export async function addSubscriberToList(
  email: string,
  listId: string,
  properties: Record<string, any> = {}
) {
  try {
    if (!process.env.KLAVIYO_PRIVATE_API_KEY) {
      console.error('KLAVIYO_PRIVATE_API_KEY is not set');
      return { success: false, error: 'API key not configured' };
    }

    const response = await fetch(`${KLAVIYO_API_BASE_URL}/lists/${listId}/subscriptions/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Klaviyo-API-Key ${process.env.KLAVIYO_PRIVATE_API_KEY}`,
        revision: '2024-04-15',
      },
      body: JSON.stringify({
        data: {
          type: 'subscription',
          attributes: {
            custom_source: 'Website Newsletter Form',
            profiles: {
              data: [
                {
                  type: 'profile',
                  attributes: {
                    email,
                    ...properties,
                  },
                },
              ],
            },
          },
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Failed to add subscriber to Klaviyo:', data);
      return { success: false, error: data.errors?.[0]?.detail || 'Failed to subscribe' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error adding subscriber to Klaviyo:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Create or update a profile in Klaviyo
 */
export async function createOrUpdateProfile(
  email: string,
  properties: Record<string, any> = {}
) {
  try {
    if (!process.env.KLAVIYO_PRIVATE_API_KEY) {
      console.error('KLAVIYO_PRIVATE_API_KEY is not set');
      return { success: false, error: 'API key not configured' };
    }

    const response = await fetch(`${KLAVIYO_API_BASE_URL}/profiles/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Klaviyo-API-Key ${process.env.KLAVIYO_PRIVATE_API_KEY}`,
        revision: '2023-02-22',
      },
      body: JSON.stringify({
        data: {
          type: 'profile',
          attributes: {
            email,
            ...properties,
          },
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Failed to create/update profile in Klaviyo:', data);
      return { success: false, error: data.errors?.[0]?.detail || 'Failed to update profile' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error creating/updating profile in Klaviyo:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Track an event in Klaviyo
 */
export async function trackEvent(
  event: string,
  email: string,
  properties: Record<string, any> = {}
) {
  try {
    if (!process.env.KLAVIYO_PRIVATE_API_KEY) {
      console.error('KLAVIYO_PRIVATE_API_KEY is not set');
      return { success: false, error: 'API key not configured' };
    }

    const response = await fetch(`${KLAVIYO_API_BASE_URL}/events/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Klaviyo-API-Key ${process.env.KLAVIYO_PRIVATE_API_KEY}`,
        revision: '2023-02-22',
      },
      body: JSON.stringify({
        data: {
          type: 'event',
          attributes: {
            profile: {
              email,
            },
            metric: {
              name: event,
            },
            properties,
          },
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Failed to track event in Klaviyo:', data);
      return { success: false, error: data.errors?.[0]?.detail || 'Failed to track event' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error tracking event in Klaviyo:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}