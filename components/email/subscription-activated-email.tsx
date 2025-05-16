import * as React from 'react';
import { BaseEmailLayout } from './base-layout';

interface SubscriptionActivatedEmailProps {
  name: string;
  planName: string;
  billingPeriod: string;
  amount: string;
  nextBillingDate: string;
  dashboardLink: string;
}

export const SubscriptionActivatedEmail: React.FC<Readonly<SubscriptionActivatedEmailProps>> = ({
  name,
  planName,
  billingPeriod,
  amount,
  nextBillingDate,
  dashboardLink,
}) => (
  <BaseEmailLayout previewText="Your dietlessAI subscription is active">
    <h2>Subscription Activated</h2>
    <p>Hello {name},</p>
    <p>Thank you for subscribing to dietlessAI {planName}!</p>
    
    <div style={{ background: '#F8F9FA', padding: '15px', borderRadius: '5px', margin: '20px 0' }}>
      <h3 style={{ margin: '0 0 10px 0' }}>Subscription Details</h3>
      <p style={{ margin: '5px 0' }}><strong>Plan:</strong> {planName}</p>
      <p style={{ margin: '5px 0' }}><strong>Billing Period:</strong> {billingPeriod}</p>
      <p style={{ margin: '5px 0' }}><strong>Amount:</strong> {amount}</p>
      <p style={{ margin: '5px 0' }}><strong>Next Billing Date:</strong> {nextBillingDate}</p>
    </div>
    
    <p>You now have full access to all features:</p>
    <ul style={{ paddingLeft: '20px' }}>
      <li>Personalized meal plans tailored to your goals</li>
      <li>AI coaching conversations</li>
      <li>Recipe database with thousands of options</li>
    </ul>
    
    <a href={dashboardLink} className="button">
      Go to Dashboard
    </a>
    
    <p>If you have any questions about your subscription, please contact our support team.</p>
  </BaseEmailLayout>
);