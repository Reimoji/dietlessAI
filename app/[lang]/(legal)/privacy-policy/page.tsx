import { Metadata } from 'next';
import { Lang, t } from "@/lib/i18n";

const SUPPORTED_LANGS = ['en', 'et'] as const;

export const metadata: Metadata = {
  title: 'Privacy Policy - dietlessAI',
  description: 'Privacy Policy for dietlessAI',
};

export default async function PrivacyPolicyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const typedLang = (SUPPORTED_LANGS.includes(lang as Lang) ? lang : 'en') as Lang;

  return (
    <div className='container mx-auto px-4 py-8 max-w-4xl'>
      <h1 className='text-3xl font-bold mb-6'>{t(typedLang, "privacy_policy.title")}</h1>

      <p className='text-sm text-muted-foreground mb-6'>
        {t(typedLang, "privacy_policy.last_updated")}{' '}
        {new Date().toLocaleDateString(typedLang === 'et' ? 'et-EE' : 'en-US', { 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        })}
      </p>

      <div className='space-y-6'>
        <section>
          <h2 className='text-xl font-semibold mb-2'>{t(typedLang, "privacy_policy.introduction.title")}</h2>
          <p>{t(typedLang, "privacy_policy.introduction.content")}</p>
        </section>

        <section>
          <h2 className='text-xl font-semibold mb-2'>{t(typedLang, "privacy_policy.what_we_collect.title")}</h2>
          <p>{t(typedLang, "privacy_policy.what_we_collect.content")}</p>
        </section>

        <section>
          <h2 className='text-xl font-semibold mb-2'>{t(typedLang, "privacy_policy.how_we_use.title")}</h2>
          <p>{t(typedLang, "privacy_policy.how_we_use.content")}</p>
        </section>

        <section>
          <h2 className='text-xl font-semibold mb-2'>{t(typedLang, "privacy_policy.cookies.title")}</h2>
          <p>{t(typedLang, "privacy_policy.cookies.content")}</p>
        </section>

        <section>
          <h2 className='text-xl font-semibold mb-2'>{t(typedLang, "privacy_policy.third_party.title")}</h2>
          <p>{t(typedLang, "privacy_policy.third_party.content")}</p>
        </section>

        <section>
          <h2 className='text-xl font-semibold mb-2'>{t(typedLang, "privacy_policy.data_security.title")}</h2>
          <p>{t(typedLang, "privacy_policy.data_security.content")}</p>
        </section>

        <section>
          <h2 className='text-xl font-semibold mb-2'>{t(typedLang, "privacy_policy.your_rights.title")}</h2>
          <p>{t(typedLang, "privacy_policy.your_rights.content")}</p>
        </section>

        <section>
          <h2 className='text-xl font-semibold mb-2'>{t(typedLang, "privacy_policy.ai_content.title")}</h2>
          <p>{t(typedLang, "privacy_policy.ai_content.content")}</p>
        </section>

        <section>
          <h2 className='text-xl font-semibold mb-2'>{t(typedLang, "privacy_policy.changes.title")}</h2>
          <p>{t(typedLang, "privacy_policy.changes.content")}</p>
        </section>

        <section>
          <h2 className='text-xl font-semibold mb-2'>{t(typedLang, "privacy_policy.contact.title")}</h2>
          <p>{t(typedLang, "privacy_policy.contact.content")} 📧 <a href='mailto:dietlessai@dietless.ai'>dietlessai@dietless.ai</a> </p>
        </section>
      </div>
    </div>
  );
}
