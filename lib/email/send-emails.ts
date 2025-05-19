import { sendEmail } from './resend';
import React from 'react';
import { WelcomeEmail } from '@/components/email/welcome-email';
import { ResetPasswordEmail } from '@/components/email/reset-password-email';
import { PasswordChangedEmail } from '@/components/email/password-changed-email';
import { TrialEmail } from '@/components/email/trial-email';
import { SubscriptionActivatedEmail } from '@/components/email/subscription-activated-email';
import { SubscriptionCancelledEmail } from '@/components/email/subscription-cancelled-email';

// Welcome email
export async function sendWelcomeEmail(to: string) {
  // Import directly here to ensure we're using the correct component
  const { WelcomeEmail } = require('@/components/email/welcome-email');
  
  return sendEmail({
    to,
    subject: 'Welcome to dietlessAI',
    react: React.createElement(WelcomeEmail, {}),
  });
}

// Password reset email
export async function sendPasswordResetEmail(to: string, resetLink: string) {
  return sendEmail({
    to,
    subject: 'Reset Your dietlessAI Password',
    react: React.createElement(ResetPasswordEmail, { 
      resetLink,
      expirationHours: 24 
    }),
  });
}

// Password changed confirmation
export async function sendPasswordChangedEmail(to: string, supportEmail?: string) {
  return sendEmail({
    to,
    subject: 'Your dietlessAI Password Has Been Changed',
    react: React.createElement(PasswordChangedEmail, { supportEmail }),
  });
}

// Combined trial email (start and end information)
export async function sendTrialEmail(
  to: string, 
  name: string, 
  trialDays: number,
  startDate: string,
  endDate: string,
  billingStartDate: string,
  amount: string,
  dashboardLink: string,
  pricingLink: string
) {
  return sendEmail({
    to,
    subject: `Your ${trialDays}-day dietlessAI Trial Has Started`,
    react: React.createElement(TrialEmail, { 
      name, 
      trialDays,
      startDate,
      endDate,
      billingStartDate,
      amount,
      dashboardLink,
      pricingLink
    }),
  });
}

// Subscription activated email
export async function sendSubscriptionActivatedEmail(
  to: string,
  name: string,
  planName: string,
  billingPeriod: string,
  amount: string,
  nextBillingDate: string,
  dashboardLink: string
) {
  return sendEmail({
    to,
    subject: 'Your dietlessAI Subscription is Active',
    react: React.createElement(SubscriptionActivatedEmail, {
      name,
      planName,
      billingPeriod,
      amount,
      nextBillingDate,
      dashboardLink,
    }),
  });
}

// Subscription cancelled email
export async function sendSubscriptionCancelledEmail(
  to: string,
  name: string,
  planName: string,
  accessEndDate: string,
  reactivateLink: string,
  feedbackLink?: string
) {
  return sendEmail({
    to,
    subject: 'Your dietlessAI Subscription Has Been Cancelled',
    react: React.createElement(SubscriptionCancelledEmail, {
      name,
      planName,
      accessEndDate,
      reactivateLink,
      feedbackLink,
    }),
  });
}











