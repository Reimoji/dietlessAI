'use client';

import { updateAccount } from '@/app/[lang]/(login)/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser } from '@/lib/auth';
import { Loader2 } from 'lucide-react';
import { startTransition, use, useActionState } from 'react';
import { usePathname } from 'next/navigation';
import { Lang, t } from '@/lib/i18n';

type ActionState = {
  error?: string;
  success?: string;
};

const SUPPORTED_LANGS = ['en', 'et'] as const;

export default function GeneralPage() {
  const { userPromise } = useUser();
  const user = use(userPromise);
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(updateAccount, {
    error: '',
    success: '',
  });

  const pathname = usePathname();
  const langFromPath = pathname?.split('/')[1] as Lang | undefined;
  const typedLang = (SUPPORTED_LANGS.includes(langFromPath as Lang) ? langFromPath : 'en') as Lang;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(() => {
      formAction(new FormData(event.currentTarget));
    });
  };

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        {t(typedLang, 'general.title')}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>{t(typedLang, 'general.account_info')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="name">{t(typedLang, 'general.name')}</Label>
              <Input
                id="name"
                name="name"
                placeholder={t(typedLang, 'general.name_placeholder')}
                defaultValue={user?.name || ''}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">{t(typedLang, 'general.email')}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={t(typedLang, 'general.email_placeholder')}
                defaultValue={user?.email || ''}
                required
              />
            </div>
            {state.error && <p className="text-red-500 text-sm">{state.error}</p>}
            {state.success && <p className="text-green-500 text-sm">{state.success}</p>}
            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t(typedLang, 'general.saving')}
                </>
              ) : (
                t(typedLang, 'general.save_changes')
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
