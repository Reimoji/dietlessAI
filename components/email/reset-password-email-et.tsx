import * as React from 'react';
import { BaseEmailLayout } from './base-layout';

interface ResetPasswordEmailProps {
  name?: string;
  resetLink: string;
  expirationMinutes?: number;
}

export const ResetPasswordEmail: React.FC<Readonly<ResetPasswordEmailProps>> = ({
  name = '',
  resetLink,
  expirationMinutes = 30,
}) => (
  <BaseEmailLayout previewText='Lähtesta oma dietlessAI parool'>
    <h2>Lähtesta oma parool</h2>
    {name && <p>Tere {name},</p>}
    <p>Saime sinu dietlessAI konto jaoks parooli lähtestamise taotluse.</p>
    <p>Klõpsa alloleval nupul, et parool lähtestada:</p>

    <a href={resetLink} className='button'>
      Lähtesta parool
    </a>

    <p>See link aegub {expirationMinutes} minuti jooksul.</p>

    <p>
      Kui sa ei esitanud parooli lähtestamise taotlust, võid selle e-kirja turvaliselt eirata. Sinu
      konto on endiselt kaitstud.
    </p>

    <p>Turvalisuse huvides saab seda linki kasutada ainult üks kord.</p>
  </BaseEmailLayout>
);
