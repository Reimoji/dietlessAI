import * as React from 'react';
import { BaseEmailLayout } from './email/base-layout';

interface EmailTemplateProps {
  firstName: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({ firstName }) => (
  <BaseEmailLayout previewText={`Welcome, ${firstName}!`}>
    <h2>Welcome, {firstName}!</h2>
    <p>Thank you for signing up. We're excited to have you on board!</p>
    <p>Get started by exploring our features and setting up your profile.</p>
    <a href='https://dietless.ai/dashboard' className='button'>
      Go to Dashboard
    </a>
  </BaseEmailLayout>
);
