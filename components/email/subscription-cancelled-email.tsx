import * as React from 'react';
import { BaseEmailLayout } from './base-layout';

interface SubscriptionCancelledEmailProps {
  name: string;
  planName: string;
  accessEndDate: string;
  reactivateLink: string;
  feedbackLink?: string;
}

export const SubscriptionCancelledEmail: React.FC<Readonly<SubscriptionCancelledEmailProps>> = ({
  name,
  planName,
  accessEndDate,
  reactivateLink,
  feedbackLink,
}) => (
  <BaseEmailLayout previewText='Your dietlessAI subscription has been cancelled'>
    <h2>Subscription Cancelled</h2>
    <p>Hello {name},</p>
    <p>We're sorry to see you go. Your dietlessAI {planName} subscription has been cancelled.</p>

    <p>You will continue to have access to premium features until {accessEndDate}.</p>

    <p>
      If you've changed your mind, you can reactivate your subscription at any time before your
      access ends:
    </p>

    <a href={reactivateLink} className='button'>
      Reactivate Subscription
    </a>


    <p>We'd love to hear about your experience with dietlessAI and how we could improve, kindly reply to this same e-mail.</p>


    <p>Thank you for being a dietlessAI customer. We hope to welcome you back soon!</p>
  </BaseEmailLayout>
);
