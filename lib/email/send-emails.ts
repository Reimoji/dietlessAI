import React from 'react';
import { sendEmail } from './resend';

// Welcome email
export async function sendWelcomeEmail(to: string, lang: string = 'en') {
  const componentName = lang === 'et' ? 'welcome-email-et' : 'welcome-email';
  const { WelcomeEmail } = require(`@/components/email/${componentName}`);
  
  const subject = lang === 'et' ? 'Tere tulemast dietlessAI-sse' : 'Welcome to dietlessAI';

  return sendEmail({
    to,
    subject,
    react: React.createElement(WelcomeEmail, {}),
  });
}

// Password reset email
export async function sendPasswordResetEmail(
  to: string,
  resetLink: string,
  expirationMinutes = 30,
  lang: string = 'en',
) {
  const componentName = lang === 'et' ? 'reset-password-email-et' : 'reset-password-email';
  const { ResetPasswordEmail } = require(`@/components/email/${componentName}`);
  
  const subject = lang === 'et'
    ? 'Lähtesta oma dietlessAI parool'
    : 'Reset Your dietlessAI Password';

  return sendEmail({
    to,
    subject,
    react: React.createElement(ResetPasswordEmail, {
      resetLink,
      expirationMinutes,
    }),
  });
}

// Password changed confirmation
export async function sendPasswordChangedEmail(
  to: string, 
  supportEmail?: string,
  lang: string = 'en',
) {
  const componentName = lang === 'et' ? 'password-changed-email-et' : 'password-changed-email';
  const { PasswordChangedEmail } = require(`@/components/email/${componentName}`);
  
  const subject = lang === 'et'
    ? 'Sinu dietlessAI parool on muudetud'
    : 'Your dietlessAI Password Has Been Changed';

  return sendEmail({
    to,
    subject,
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
  pricingLink: string,
  lang: string = 'en',
) {
  const componentName = lang === 'et' ? 'trial-email-et' : 'trial-email';
  const { TrialEmail } = require(`@/components/email/${componentName}`);
  
  const subject = lang === 'et' 
    ? `Sinu ${trialDays}-päevane dietlessAI prooviversioon on alanud`
    : `Your ${trialDays}-day dietlessAI Trial Has Started`;

  return sendEmail({
    to,
    subject,
    react: React.createElement(TrialEmail, {
      name,
      trialDays,
      startDate,
      endDate,
      billingStartDate,
      amount,
      dashboardLink,
      pricingLink,
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
  dashboardLink: string,
  lang: string = 'en',
) {
  const componentName = lang === 'et' ? 'subscription-activated-email-et' : 'subscription-activated-email';
  const { SubscriptionActivatedEmail } = require(`@/components/email/${componentName}`);
  
  const subject = lang === 'et' 
    ? 'Sinu dietlessAI tellimus on aktiivne'
    : 'Your dietlessAI Subscription is Active';

  return sendEmail({
    to,
    subject,
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
  feedbackLink?: string,
  lang: string = 'en',
) {
  const componentName = lang === 'et' ? 'subscription-cancelled-email-et' : 'subscription-cancelled-email';
  const { SubscriptionCancelledEmail } = require(`@/components/email/${componentName}`);
  
  const subject = lang === 'et'
    ? 'Sinu dietlessAI tellimus on tühistatud'
    : 'Your dietlessAI Subscription Has Been Cancelled';

  return sendEmail({
    to,
    subject,
    react: React.createElement(SubscriptionCancelledEmail, {
      name,
      planName,
      accessEndDate,
      reactivateLink,
      feedbackLink,
    }),
  });
}