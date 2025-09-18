import { Suspense } from 'react';
import { ForgotPasswordForm } from './forgot-password-form';

export default function ForgotPasswordPage() {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen py-12 bg-gray-50 px-4 sm:px-6 lg:px-8'>
      <div className='w-full max-w-md'>
        <div className='text-center'>
          <h2 className='mt-6 text-3xl font-extrabold text-gray-900'>Reset your password</h2>
          <p className='mt-2 text-sm text-gray-600'>
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <div className='mt-8'>
          <Suspense fallback={<div>Loading...</div>}>
            <ForgotPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
