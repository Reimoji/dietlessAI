'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { Lang, t } from '@/lib/i18n';

const SUPPORTED_LANGS = ['en', 'et'] as const;

export function SubmitButton({ lang }: { lang: string }) {
  const { pending } = useFormStatus();
  const typedLang = (SUPPORTED_LANGS.includes(lang as Lang) ? lang : 'en') as Lang;

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-white hover:bg-gray-100 text-black border border-gray-200 rounded-full flex items-center justify-center"
    >
      {pending ? (
        <>
          <Loader2 className="animate-spin mr-2 h-4 w-4" />
          {t(typedLang, 'submit.loading')}
        </>
      ) : (
        <>
          {t(typedLang, 'submit.get_started')}
          <ArrowRight className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
}
