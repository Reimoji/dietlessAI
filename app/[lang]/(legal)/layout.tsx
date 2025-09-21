import Link from "next/link";
import { t } from "@/lib/i18n";

const SUPPORTED_LANGS = ["en", "et"] as const;
type Lang = (typeof SUPPORTED_LANGS)[number];

export default async function LegalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = SUPPORTED_LANGS.includes(rawLang as Lang)
    ? (rawLang as Lang)
    : "en";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main content */}
      <main className="flex-grow py-6">{children}</main>

      {/* Simple Footer */}
      <footer className="border-t py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <Link href={`/${lang}`} className="hover:text-foreground">
              {t(lang, "simplefooter.home")}
            </Link>
            <Link href={`/${lang}/terms-of-service`} className="hover:text-foreground">
              {t(lang, "simplefooter.terms")}
            </Link>
            <Link href={`/${lang}/privacy-policy`} className="hover:text-foreground">
              {t(lang, "simplefooter.privacy")}
            </Link>
            <Link href={`/${lang}/cookie-policy`} className="hover:text-foreground">
              {t(lang, "simplefooter.cookies")}
            </Link>
          </div>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} dietlessAI. {t(lang, "simplefooter.rights")}
          </div>
        </div>
      </footer>
    </div>
  );
}
