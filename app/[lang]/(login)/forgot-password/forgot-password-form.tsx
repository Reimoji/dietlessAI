'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useActionState, useState } from 'react';
import { usePathname } from 'next/navigation';
import { forgotPassword } from '../actions';
import { Lang, t } from '@/lib/i18n';

const SUPPORTED_LANGS = ['en', 'et'] as const;

export function ForgotPasswordForm() {
  const initialState = { success: '', error: '' };
  const [state, formAction] = useActionState(forgotPassword, initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pathname = usePathname();
  const langFromPath = pathname?.split('/')[1] as Lang | undefined;
  const typedLang = (SUPPORTED_LANGS.includes(langFromPath as Lang) ? langFromPath : 'en') as Lang;

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    await formAction(formData);
    setIsSubmitting(false);
  };

  return (
    <form action={handleSubmit} className="space-y-6">
      <input type="hidden" name="lang" value={typedLang} />
      <div>
        <Label htmlFor="email">{t(typedLang, 'forgotform.email_label')}</Label>
        <div className="mt-1">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="block w-full"
            placeholder={t(typedLang, 'forgotform.email_placeholder')}
          />
        </div>
      </div>

      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {state.success && (
        <Alert>
          <AlertDescription>{state.success}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <Link
          href={`/${typedLang}/sign-in`}
          className="text-sm font-medium text-primary hover:text-primary/90"
        >
          {t(typedLang, 'forgotform.back_to_signin')}
        </Link>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? t(typedLang, 'forgotform.sending')
            : t(typedLang, 'forgotform.send_link')}
        </Button>
      </div>
    </form>
  );
}
