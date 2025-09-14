import { addSubscriberToList } from '@/lib/klaviyo/klaviyo-api';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for the request body
const subscribeSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();

    // Validate the request body
    const result = subscribeSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 },
      );
    }

    const { email, name } = result.data;

    // Check if the newsletter list ID is configured
    if (!process.env.KLAVIYO_NEWSLETTER_LIST_ID) {
      console.error('KLAVIYO_NEWSLETTER_LIST_ID is not set');
      return NextResponse.json(
        { success: false, error: 'Newsletter service is not configured' },
        { status: 500 },
      );
    }

    // Add the subscriber to the Klaviyo list
    const response = await addSubscriberToList(
      email,
      process.env.KLAVIYO_NEWSLETTER_LIST_ID,
      name ? { first_name: name } : {},
    );

    if (!response.success) {
      return NextResponse.json({ success: false, error: response.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in newsletter subscription:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 },
    );
  }
}
