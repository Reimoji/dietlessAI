'use client';

import NewsletterForm from '@/components/newsletter-form';
import { EggFried } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Lang, t } from "@/lib/i18n";

const SUPPORTED_LANGS = ['en', 'et'] as const;

export default function Footer() {
  const pathname = usePathname();
  const langFromPath = pathname?.split('/')[1] as Lang | undefined;
  const lang = SUPPORTED_LANGS.includes(langFromPath as Lang) ? langFromPath! : 'en';
  const typedLang = lang as Lang; // Add this line

  return (
<section className="py-16 bg-card border-t">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Newsletter */}
    <div className="mb-16 p-8 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl border border-primary/10 relative overflow-hidden group">
      <div className="max-w-3xl mx-auto text-center relative z-10">
        <h3 className="text-2xl font-bold mb-4 group-hover:scale-105 transition-transform duration-300">
          {t(typedLang, "footer.newsletter.title")}
        </h3>
        <p className="text-muted-foreground mb-6">
          {t(typedLang, "footer.newsletter.description")}
        </p>
        <NewsletterForm />
      </div>
    </div>

    {/* Footer Content */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
      {/* Column 1 */}
      <div className="space-y-4">
        <div className="flex items-center">
          <EggFried className="h-6 w-6 text-primary" />
          <span className="ml-2 text-xl font-bold">{t(typedLang, "footer.brand.name")}</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {t(typedLang, "footer.brand.description")}
        </p>
      </div>

      {/* Column 2 */}
      <div className="flex flex-col items-end justify-end h-full">
        <div className="flex space-x-6">
          <Link
            href={`/${lang}/privacy-policy`}
            className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200"
          >
            {t(typedLang, "footer.links.privacy")}
          </Link>
          <Link
            href={`/${lang}/terms-of-service`}
            className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200"
          >
            {t(typedLang, "footer.links.terms")}
          </Link>
          <Link
            href={`/${lang}/cookie-policy`}
            className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200"
          >
            {t(typedLang, "footer.links.cookies")}
          </Link>
        </div>
      </div>
    </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {t(typedLang, "footer.copyright_text")}
          </p>
        </div>
      </div>
    </section>
  );
}
