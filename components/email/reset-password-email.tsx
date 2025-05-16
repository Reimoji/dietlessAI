import * as React from 'react';
import { BaseEmailLayout } from './base-layout';

interface ResetPasswordEmailProps {
  name: string;
  resetLink: string;
  expirationHours: number;
}

export const ResetPasswordEmail: React.FC<Readonly<ResetPasswordEmailProps>> = ({
  name,
  resetLink,
  expirationHours,
}) => (
  <BaseEmailLayout previewText="Reset your dietlessAI password">
    <h2>Reset Your Password</h2>
    <p>Hello {name},</p>
    <p>We received a request to reset your password for your dietlessAI account.</p>
    <p>Click the button below to reset your password:</p>
    
    <a href={resetLink} className="button">
      Reset Password
    </a>
    
    <p>This link will expire in {expirationHours} hours.</p>
    
    <p>If you didn't request a password reset, you can safely ignore this email. Your account is secure.</p>
    
    <p>For security reasons, this link can only be used once.</p>
  </BaseEmailLayout>
);