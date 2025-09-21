'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useActionState, useState } from 'react';
import { usePathname } from 'next/navigation';
import { resetPassword } from '../actions';
import { Lang, t } from '@/lib/i18n';

const SUPPORTED_LANGS = ['en', 'et'] as const;

export function ResetPasswordForm({ token }: { token: string }) {
  // Provide a proper initial state that matches all possible return types
  const initialState = { error: '', success: '', expired: false };
  const [state, formAction] = useActionState(resetPassword, initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pathname = usePathname();
  const langFromPath = pathname?.split('/')[1] as Lang | undefined;
  const typedLang = (SUPPORTED_LANGS.includes(langFromPath as Lang) ? langFromPath : 'en') as Lang;

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    formData.append('token', token);
    await formAction(formData);
    setIsSubmitting(false);
  };

  // Check if token is expired based on the response
  const isTokenExpired = state.expired === true;

  return (
    <form action={handleSubmit} className="space-y-6">
      {!token && (
        <Alert variant="destructive">
          <AlertDescription>
            {t(typedLang, 'resetpassword.invalid_link')}
          </AlertDescription>
        </Alert>
      )}

      {isTokenExpired ? (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              {state.error || t(typedLang, 'resetpassword.expired_link')}
            </AlertDescription>
          </Alert>

          <div className="text-center">
            <p className="mb-4">{t(typedLang, 'resetpassword.request_new_question')}</p>
            <Link
              href={`/${typedLang}/forgot-password`}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {t(typedLang, 'resetpassword.request_new_button')}
            </Link>
          </div>
        </div>
      ) : (
        <>
          {token && (
            <>
              <div>
                <Label htmlFor="password">{t(typedLang, 'resetpassword.new_password')}</Label>
                <div className="mt-1">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    className="block w-full"
                    disabled={!token || isTokenExpired}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword">{t(typedLang, 'resetpassword.confirm_password')}</Label>
                <div className="mt-1">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    className="block w-full"
                    disabled={!token || isTokenExpired}
                  />
                </div>
              </div>
            </>
          )}

          {state.error && !isTokenExpired && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          {state.success && (
            <Alert>
              <AlertDescription>
                {state.success}{' '}
                <Link
                  href={`/${typedLang}/sign-in`}
                  className="font-medium text-primary hover:text-primary/90"
                >
                  {t(typedLang, 'resetpassword.sign_in')}
                </Link>
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !token || isTokenExpired}
          >
            {isSubmitting
              ? t(typedLang, 'resetpassword.resetting')
              : t(typedLang, 'resetpassword.reset_button')}
          </Button>
        </>
      )}

      <div className="text-center">
        <Link
          href={`/${typedLang}/sign-in`}
          className="text-sm font-medium text-primary hover:text-primary/90"
        >
          {t(typedLang, 'resetpassword.back_to_signin')}
        </Link>
      </div>
    </form>
  );
}
