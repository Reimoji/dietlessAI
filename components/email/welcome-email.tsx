import * as React from 'react';
import { BaseEmailLayout } from './base-layout';

interface WelcomeEmailProps {
  name?: string;
}

export const WelcomeEmail: React.FC<Readonly<WelcomeEmailProps>> = ({ name = '' }) => (
  <BaseEmailLayout previewText='Welcome to dietlessAI!'>
    <h2>Welcome to dietlessAI!</h2>
    {name && <p>Hello {name},</p>}
    <p>Thank you for joining dietlessAI. We're excited to help you on your nutrition journey!</p>

    <p>
      To start chatting with your AI coach, simply activate your free 2-day trial.  
      This unlocks real-time, personalized guidance to help you stay on track.
    </p>

    <a href={`${process.env.BASE_URL}/dashboard`} className='button'>
      Go to Dashboard
    </a>

    <p>If you have any questions or need assistance, feel free to reply to this email.</p>

    <p>
      Best regards,
      <br />
      The dietlessAI Team
    </p>
  </BaseEmailLayout>
);
