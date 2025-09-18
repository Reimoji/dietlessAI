'use client';

import { EggFried } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { usePathname } from 'next/navigation';

const SUPPORTED_LANGS = ['en', 'et'] as const;
type Lang = (typeof SUPPORTED_LANGS)[number];

const translations: Record<Lang, { title: string; description: string; back: string }> = {
  en: {
    title: 'Page Not Found',
    description:
      'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.',
    back: 'Back to Home',
  },
  et: {
    title: 'Lehte ei leitud',
    description:
      'Otsitud leht on eemaldatud, ümber nimetatud või ajutiselt kättesaamatu.',
    back: 'Tagasi avalehele',
  },
};

export default function NotFound() {
  const pathname = usePathname();

  // Get the first path segment → check if it's a supported lang
  const rawLang = pathname?.split('/')[1];
  const lang: Lang = SUPPORTED_LANGS.includes(rawLang as Lang) ? (rawLang as Lang) : 'en';

  const t = translations[lang];

  return (
    <div className="flex items-center justify-center min-h-[100dvh]">
      <Suspense fallback={<div>Loading...</div>}>
        <div className="max-w-md space-y-8 p-4 text-center">
          <div className="flex justify-center">
            <EggFried className="size-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight">{t.title}</h1>
          <p className="text-base text-foreground">{t.description}</p>
          <Link
            href={`/${lang}`}
            className="max-w-48 mx-auto flex justify-center py-2 px-4 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:primary"
          >
            {t.back}
          </Link>
        </div>
      </Suspense>
    </div>
  );
}
