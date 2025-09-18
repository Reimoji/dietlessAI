import { Suspense } from 'react';
import { ResetPasswordForm } from './reset-password-form';

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>; // ✅ Now a Promise type
}) {
  const { token } = await searchParams; // ✅ Directly destructure after await
  
  return (
    <div className='flex flex-col items-center justify-center min-h-screen py-12 bg-gray-50 px-4 sm:px-6 lg:px-8'>
      <div className='w-full max-w-md'>
        <div className='text-center'>
          <h2 className='mt-6 text-3xl font-extrabold text-gray-900'>Create new password</h2>
          <p className='mt-2 text-sm text-gray-600'>Enter your new password below</p>
        </div>

        <div className='mt-8'>
          <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordForm token={token || ''} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}