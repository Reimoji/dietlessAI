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

    <p>Here's how to get started:</p>
    <ul style={{ paddingLeft: '20px' }}>
      <li>Complete your profile with your nutrition goals</li>
      <li>Track your first meal</li>
      <li>Explore personalized recommendations</li>
    </ul>

    <p>
      Please note that to access the full power of dietlessAI, including our interactive chat
      feature, you will need to subscribe to one of our plans. Subscribing unlocks personalized,
      real-time advice and support to help you stay on track.
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
