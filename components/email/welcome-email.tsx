import * as React from 'react';
import { BaseEmailLayout } from './base-layout';

interface WelcomeEmailProps {
  name: string;
}

export const WelcomeEmail: React.FC<Readonly<WelcomeEmailProps>> = ({
  name
}) => (
  <BaseEmailLayout previewText={`Welcome to dietlessAI, ${name}!`}>
    <h2>Welcome to dietlessAI, {name}!</h2>
    <p>Thank you for joining dietlessAI. We're excited to help you on your nutrition journey!</p>
    
    <p>Here's how to get started:</p>
    <ul style={{ paddingLeft: '20px' }}>
      <li>Complete your profile with your nutrition goals</li>
      <li>Track your first meal</li>
      <li>Explore personalized recommendations</li>
    </ul>
    
    <a href="https://dietless.ai/dashboard" className="button">
      Go to Dashboard
    </a>
    
    <p>If you have any questions, our support team is ready to help!</p>
  </BaseEmailLayout>
);

