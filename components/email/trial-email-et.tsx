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
  <BaseEmailLayout previewText={`Sinu ${trialDays}-päevane dietlessAI prooviperiood on alanud!`}>
    <h2>Sinu prooviperiood on alanud!</h2>
    <p>Tere {name},</p>
    <p>Tere tulemast dietlessAI {trialDays}-päevasele prooviperioodile!</p>

    <div style={{ background: '#F8F9FA', padding: '15px', borderRadius: '5px', margin: '20px 0' }}>
      <h3 style={{ margin: '0 0 10px 0' }}>Prooviperioodi detailid</h3>
      <p style={{ margin: '5px 0' }}>
        <strong>Alguskuupäev:</strong> {startDate}
      </p>
      <p style={{ margin: '5px 0' }}>
        <strong>Lõppkuupäev:</strong> {endDate}
      </p>
      <p style={{ margin: '5px 0' }}>
        <strong>Tasutellimus algab:</strong> {billingStartDate}
      </p>
      <p style={{ margin: '5px 0' }}>
        <strong>Tellimuse summa:</strong> {amount}
      </p>
    </div>

    <p>Prooviperioodi jooksul on sul täielik ligipääs meie AI vestlus-treenerile:</p>
    <ul style={{ paddingLeft: '20px' }}>
      <li>Küsi küsimusi igal ajal ja igas kohas</li>
      <li>Saa kohest ja personaalset toitumisnõu</li>
      <li>Püsi motiveerituna reaalajas toe abil</li>
    </ul>

    <p>
      <strong>NB:</strong> Sinu prooviperiood muutub automaatselt tasuliseks tellimuseks kuupäeval{' '}
      {billingStartDate}, kui sa seda enne ei tühista.
    </p>

    <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0' }}>
      <a href={dashboardLink} className='button'>
        Mine töölauale
      </a>
    </div>

    <p>Meil on hea meel sind sinu toitumisteekonnal toetada!</p>
  </BaseEmailLayout>
);
