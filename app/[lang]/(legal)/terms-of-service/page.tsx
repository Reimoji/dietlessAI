import { Metadata } from 'next';
import { Lang, t } from "@/lib/i18n";

const SUPPORTED_LANGS = ['en', 'et'] as const;

export const metadata: Metadata = {
  title: 'Terms of Service - dietlessAI',
  description: 'Terms of Service for dietlessAI',
};

export default async function TermsOfServicePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const typedLang = (SUPPORTED_LANGS.includes(lang as Lang) ? lang : 'en') as Lang;

  return (
    <div className='container mx-auto px-4 py-8 max-w-4xl'>
      <h1 className='text-3xl font-bold mb-6'>{t(typedLang, "terms.title")}</h1>

      <p className='text-sm text-muted-foreground mb-6'>
        {t(typedLang, "terms.last_updated")}{' '}
        {new Date().toLocaleDateString(typedLang === 'et' ? 'et-EE' : 'en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        })}
      </p>

      <div className='space-y-6'>
        <section>
          <h2 className='text-xl font-semibold mb-2'>{t(typedLang, "terms.introduction.title")}</h2>
          <p>{t(typedLang, "terms.introduction.content")}</p>
        </section>

        <section>
          <h2 className='text-xl font-semibold mb-2'>{t(typedLang, "terms.services.title")}</h2>
          <p>{t(typedLang, "terms.services.content")}</p>
        </section>

        <section>
          <h2 className='text-xl font-semibold mb-2'>{t(typedLang, "terms.eligibility.title")}</h2>
          <p>{t(typedLang, "terms.eligibility.content")}</p>
        </section>

        <section>
          <h2 className='text-xl font-semibold mb-2'>{t(typedLang, "terms.account.title")}</h2>
          <p>{t(typedLang, "terms.account.content")}</p>
        </section>

        <section>
          <h2 className='text-xl font-semibold mb-2'>{t(typedLang, "terms.cancellation.title")}</h2>
          <p>{t(typedLang, "terms.cancellation.content")}</p>
        </section>

        <section>
          <h2 className='text-xl font-semibold mb-2'>{t(typedLang, "terms.restrictions.title")}</h2>
          <p>{t(typedLang, "terms.restrictions.content")}</p>
        </section>

        <section>
          <h2 className='text-xl font-semibold mb-2'>{t(typedLang, "terms.health_disclaimer.title")}</h2>
          <p>{t(typedLang, "terms.health_disclaimer.content")}</p>
        </section>

        <section>
          <h2 className='text-xl font-semibold mb-2'>{t(typedLang, "terms.liability.title")}</h2>
          <p>{t(typedLang, "terms.liability.content")}</p>
        </section>

        <section>
          <h2 className='text-xl font-semibold mb-2'>{t(typedLang, "terms.modifications.title")}</h2>
          <p>{t(typedLang, "terms.modifications.content")}</p>
        </section>

        <section>
          <h2 className='text-xl font-semibold mb-2'>{t(typedLang, "terms.law.title")}</h2>
          <p>{t(typedLang, "terms.law.content")}</p>
        </section>

        <section>
          <h2 className='text-xl font-semibold mb-2'>{t(typedLang, "terms.contact.title")}</h2>
          <p>{t(typedLang, "terms.contact.content")} 📧 <a href='mailto:dietlessai@dietless.ai'>dietlessai@dietless.ai</a> </p>
        </section>
      </div>
    </div>
  );
}
