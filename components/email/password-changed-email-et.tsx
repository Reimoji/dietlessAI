import * as React from 'react';
import { BaseEmailLayout } from './base-layout';

interface PasswordChangedEmailProps {
  supportEmail?: string;
}

export const PasswordChangedEmail: React.FC<Readonly<PasswordChangedEmailProps>> = ({
  supportEmail = 'dietlessai@dietless.ai',
}) => (
  <BaseEmailLayout previewText='Sinu dietlessAI parool on muudetud'>
    <h2>Parool edukalt muudetud</h2>
    <p>Sinu dietlessAI konto parool on edukalt muudetud.</p>

    <p>Kui muutsid parooli ise, ei ole vaja midagi täiendavalt teha.</p>

    <p>
      Kui sa ei andnud selleks luba, võta viivitamatult ühendust meie klienditoega aadressil{' '}
      <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.
    </p>
  </BaseEmailLayout>
);
