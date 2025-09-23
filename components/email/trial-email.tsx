import * as React from 'react';
import { BaseEmailLayout } from './base-layout';

interface TrialEmailProps {
  name: string;
  trialDays: number;
  startDate: string;
  endDate: string;
  billingStartDate: string;
  amount: string;
  dashboardLink: string;
  pricingLink: string;
}

export const TrialEmail: React.FC<Readonly<TrialEmailProps>> = ({
  name,
  trialDays,
  startDate,
  endDate,
  billingStartDate,
  amount,
  dashboardLink,
  pricingLink,
}) => (
  <BaseEmailLayout previewText={`Your ${trialDays}-day dietlessAI trial has started!`}>
    <h2>Your Trial Has Started!</h2>
    <p>Hello {name},</p>
    <p>Welcome to your {trialDays}-day trial of dietlessAI!</p>

    <div style={{ background: '#F8F9FA', padding: '15px', borderRadius: '5px', margin: '20px 0' }}>
      <h3 style={{ margin: '0 0 10px 0' }}>Trial Details</h3>
      <p style={{ margin: '5px 0' }}>
        <strong>Start Date:</strong> {startDate}
      </p>
      <p style={{ margin: '5px 0' }}>
        <strong>End Date:</strong> {endDate}
      </p>
      <p style={{ margin: '5px 0' }}>
        <strong>Billing Start Date:</strong> {billingStartDate}
      </p>
      <p style={{ margin: '5px 0' }}>
        <strong>Subscription Amount:</strong> {amount}
      </p>
    </div>

    <p>During your trial, you get full access to our AI chat coach:</p>
    <ul style={{ paddingLeft: '20px' }}>
      <li>Ask questions anytime, anywhere</li>
      <li>Get instant, personalized nutrition advice</li>
      <li>Stay motivated with real-time support</li>
    </ul>

    <p>
      <strong>Important:</strong> Your trial will automatically convert to a paid subscription on{' '}
      {billingStartDate} unless cancelled before that date.
    </p>

    <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0' }}>
      <a href={dashboardLink} className='button'>
        Go to Dashboard
      </a>
    </div>

    <p>We're excited to help you on your nutrition journey!</p>
  </BaseEmailLayout>
);
