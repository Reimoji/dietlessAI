import { NextRequest, NextResponse } from 'next/server';
import {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendTrialEmail,
  sendSubscriptionActivatedEmail,
  sendSubscriptionCancelledEmail,
} from '@/lib/email/send-emails';
import { sendEmail } from '@/lib/email/resend';
import React from 'react';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const template = searchParams.get('template') || 'welcome';
  const email = searchParams.get('email') || 'test@example.com';
  
  try {
    let result;
    
    // Sample data for testing
    const name = 'Test User';
    const today = new Date().toLocaleDateString();
    const futureDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString();
    const billingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString();
    
    switch (template) {
      case 'welcome':
        // Force direct import of WelcomeEmail to ensure we're using the right component
        const { WelcomeEmail } = require('@/components/email/welcome-email');
        
        result = await sendEmail({
          to: email,
          subject: 'Welcome to dietlessAI',
          react: React.createElement(WelcomeEmail, { name }),
        });
        break;
      case 'reset-password':
        result = await sendPasswordResetEmail(
          email,
          name,
          'https://dietless.ai/reset-password?token=test123',
          24
        );
        break;
      case 'password-changed':
        result = await sendPasswordChangedEmail(
          email,
          name,
          'dietlessai@dietless.ai'
        );
        break;
      case 'trial':
        result = await sendTrialEmail(
          email,
          name,
          14,
          today,
          futureDate,
          futureDate,
          '$9.99/month',
          'https://dietless.ai/dashboard',
          'https://dietless.ai/pricing'
        );
        break;
      case 'subscription-activated':
        result = await sendSubscriptionActivatedEmail(
          email,
          name,
          'Premium',
          'Monthly',
          '$9.99/month',
          billingDate,
          'https://dietless.ai/dashboard'
        );
        break;
      case 'subscription-cancelled':
        result = await sendSubscriptionCancelledEmail(
          email,
          name,
          'Premium',
          futureDate,
          'https://dietless.ai/reactivate',
          'https://dietless.ai/feedback'
        );
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid template name' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: true,
      message: `Test email (${template}) sent to ${email}`,
      result,
    });
  } catch (error: any) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send test email',
        details: error.message 
      },
      { status: 500 }
    );
  }
}








