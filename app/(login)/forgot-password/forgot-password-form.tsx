'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useState } from 'react';
import { useFormState } from 'react-dom';
import { forgotPassword } from '../actions';

export function ForgotPasswordForm() {
  // Provide a proper initial state that matches all possible return types
  const initialState = { success: '', error: '' };
  const [state, formAction] = useFormState(forgotPassword, initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    await formAction(formData);
    setIsSubmitting(false);
  };

  return (
    <form action={handleSubmit} className='space-y-6'>
      <div>
        <Label htmlFor='email'>Email address</Label>
        <div className='mt-1'>
          <Input
            id='email'
            name='email'
            type='email'
            autoComplete='email'
            required
            className='block w-full'
          />
        </div>
      </div>

      {state.error && (
        <Alert variant='destructive'>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {state.success && (
        <Alert>
          <AlertDescription>{state.success}</AlertDescription>
        </Alert>
      )}

      <div className='flex items-center justify-between'>
        <Link href='/sign-in' className='text-sm font-medium text-primary hover:text-primary/90'>
          Back to sign in
        </Link>

        <Button type='submit' disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Send reset link'}
        </Button>
      </div>
    </form>
  );
}
