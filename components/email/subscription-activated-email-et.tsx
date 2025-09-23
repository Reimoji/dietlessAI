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
  billingPeriod,
  amount,
  nextBillingDate,
  dashboardLink,
}) => (
  <BaseEmailLayout previewText='Sinu dietlessAI tellimus on aktiivne'>
    <h2>Tellimus aktiveeritud</h2>
    <p>Tere {name},</p>
    <p>Täname, et liitusid dietlessAI-ga!</p>

    <div style={{ background: '#F8F9FA', padding: '15px', borderRadius: '5px', margin: '20px 0' }}>
      <h3 style={{ margin: '0 0 10px 0' }}>Tellimuse andmed</h3>
      <p style={{ margin: '5px 0' }}>
        <strong>Arveldusperiood:</strong> {billingPeriod}
      </p>
      <p style={{ margin: '5px 0' }}>
        <strong>Summa:</strong> {amount}
      </p>
      <p style={{ margin: '5px 0' }}>
        <strong>Järgmine arvelduskuupäev:</strong> {nextBillingDate}
      </p>
    </div>

    <p>Sul on nüüd täielik ligipääs meie AI'ga.</p>

    <a href={dashboardLink} className='button'>
      Ava töölauavaade
    </a>

    <p>Kui sul on oma tellimuse kohta küsimusi, võta ühendust meie klienditoega.</p>
  </BaseEmailLayout>
);
