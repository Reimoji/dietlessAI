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
  <BaseEmailLayout previewText='Sinu dietlessAI tellimus on tühistatud'>
    <h2>Tellimus tühistatud</h2>
    <p>Tere {name},</p>
    <p>Kahju, et lahkud. Sinu dietlessAI {planName} tellimus on tühistatud.</p>

    <p>Sul on siiski ligipääs kõikidele premium-funktsioonidele kuni {accessEndDate}.</p>

    <p>
      Kui muudad meelt, saad oma tellimuse enne ligipääsu lõppemist igal ajal uuesti aktiveerida:
    </p>

    <a href={reactivateLink} className='button'>
      Aktiveeri tellimus uuesti
    </a>

    <p>Oleme väga tänulikud, kui jagad oma kogemust dietlessAI-ga ja annad teada, kuidas saaksime paremaks muutuda - vasta sellele e-mailile</p>

    <p>Täname, et oled olnud dietlessAI kasutaja. Loodame sind peagi taas tervitada!</p>
  </BaseEmailLayout>
);
