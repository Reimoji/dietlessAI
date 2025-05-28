'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useState } from 'react';
import { useActionState } from 'react';
import { resetPassword } from '../actions';

export function ResetPasswordForm({ token }: { token: string }) {
  // Provide a proper initial state that matches all possible return types
  const initialState = { error: '', success: '', expired: false };
  const [state, formAction] = useActionState(resetPassword, initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    formData.append('token', token);
    await formAction(formData);
    setIsSubmitting(false);
  };

  // Check if token is expired based on the response
  const isTokenExpired = state.expired === true;

  return (
    <form action={handleSubmit} className='space-y-6'>
      {!token && (
        <Alert variant='destructive'>
          <AlertDescription>
            Invalid reset link. Please request a new password reset.
          </AlertDescription>
        </Alert>
      )}

      {isTokenExpired ? (
        <div className='space-y-4'>
          <Alert variant='destructive'>
            <AlertDescription>
              {state.error || 'This password reset link has expired.'}
            </AlertDescription>
          </Alert>

          <div className='text-center'>
            <p className='mb-4'>Would you like to request a new password reset link?</p>
            <Link
              href='/forgot-password'
              className='inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90'
            >
              Request New Link
            </Link>
          </div>
        </div>
      ) : (
        <>
          {token && (
            <>
              <div>
                <Label htmlFor='password'>New Password</Label>
                <div className='mt-1'>
                  <Input
                    id='password'
                    name='password'
                    type='password'
                    autoComplete='new-password'
                    required
                    minLength={8}
                    className='block w-full'
                    disabled={!token || isTokenExpired}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor='confirmPassword'>Confirm Password</Label>
                <div className='mt-1'>
                  <Input
                    id='confirmPassword'
                    name='confirmPassword'
                    type='password'
                    autoComplete='new-password'
                    required
                    minLength={8}
                    className='block w-full'
                    disabled={!token || isTokenExpired}
                  />
                </div>
              </div>
            </>
          )}

          {state.error && !isTokenExpired && (
            <Alert variant='destructive'>
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          {state.success && (
            <Alert>
              <AlertDescription>
                {state.success}{' '}
                <Link href='/sign-in' className='font-medium text-primary hover:text-primary/90'>
                  Sign in
                </Link>
              </AlertDescription>
            </Alert>
          )}

          <Button
            type='submit'
            className='w-full'
            disabled={isSubmitting || !token || isTokenExpired}
          >
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </Button>
        </>
      )}

      <div className='text-center'>
        <Link href='/sign-in' className='text-sm font-medium text-primary hover:text-primary/90'>
          Back to sign in
        </Link>
      </div>
    </form>
  );
}


