import { Metadata } from 'next';
import { Lang, t } from "@/lib/i18n";

const SUPPORTED_LANGS = ['en', 'et'] as const;

export const metadata: Metadata = {
  title: 'Cookie Policy - dietlessAI',
  description: 'Cookie Policy for dietlessAI',
};

export default async function CookiePolicyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const typedLang = (SUPPORTED_LANGS.includes(lang as Lang) ? lang : 'en') as Lang;

  return (
    <div className='container mx-auto px-4 py-8 max-w-4xl'>
      <h1 className='text-3xl font-bold mb-6'>{t(typedLang, "cookie_policy.title")}</h1>

      <p className='text-sm text-muted-foreground mb-6'>
        {t(typedLang, "cookie_policy.last_updated")}{' '}
        {new Date().toLocaleDateString(typedLang === 'et' ? 'et-EE' : 'en-US', { 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        })}
      </p>

      <div className='space-y-6'>
        <section>
          <h2 className='text-xl font-semibold mb-2'>{t(typedLang, "cookie_policy.what_are_cookies.title")}</h2>
          <p>
            {t(typedLang, "cookie_policy.what_are_cookies.content")}
          </p>
        </section>

        <section>
          <h2 className='text-xl font-semibold mb-2'>{t(typedLang, "cookie_policy.how_we_use.title")}</h2>
          <p>
            {t(typedLang, "cookie_policy.how_we_use.content")}
          </p>
        </section>

        <section>
          <h2 className='text-xl font-semibold mb-2'>{t(typedLang, "cookie_policy.essential_cookies.title")}</h2>
          <p>
            {t(typedLang, "cookie_policy.essential_cookies.content")}
          </p>
        </section>

        <section>
          <h2 className='text-xl font-semibold mb-2'>{t(typedLang, "cookie_policy.analytics_marketing.title")}</h2>
          <p>
            {t(typedLang, "cookie_policy.analytics_marketing.content")}
          </p>
        </section>

        <section>
          <h2 className='text-xl font-semibold mb-2'>{t(typedLang, "cookie_policy.managing_cookies.title")}</h2>
          <p>
            {t(typedLang, "cookie_policy.managing_cookies.content")}
          </p>
        </section>
      </div>
    </div>
  );
}