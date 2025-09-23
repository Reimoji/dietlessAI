import * as React from 'react';
import { BaseEmailLayout } from './base-layout';

interface PasswordChangedEmailProps {
  supportEmail?: string;
}

export const PasswordChangedEmail: React.FC<Readonly<PasswordChangedEmailProps>> = ({
  supportEmail = 'dietlessai@dietless.ai',
}) => (
  <BaseEmailLayout previewText='Your dietlessAI password has been changed'>
    <h2>Password Changed Successfully</h2>
    <p>Your password for dietlessAI has been successfully changed.</p>

    <p>If you made this change, no further action is required.</p>

    <p>
      If you did not authorize this change, please contact our support team immediately at{' '}
      <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.
    </p>

  </BaseEmailLayout>
);
