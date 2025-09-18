import Link from "next/link";

const SUPPORTED_LANGS = ["en", "et"] as const;
type Lang = (typeof SUPPORTED_LANGS)[number];

export default async function LegalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>; // ✅ Now a Promise
}) {
  const { lang: rawLang } = await params; // ✅ Await the params
  const lang = SUPPORTED_LANGS.includes(rawLang as Lang)
    ? (rawLang as Lang)
    : "en";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Simple Header */}
      <header className="border-b py-4">
        <div className="container mx-auto px-4">
          <Link href={`/${lang}`} className="text-xl font-semibold">
            dietlessAI
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow py-6">{children}</main>

      {/* Simple Footer */}
      <footer className="border-t py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <Link href={`/${lang}`} className="hover:text-foreground">
              Home
            </Link>
            <Link href={`/${lang}/terms-of-service`} className="hover:text-foreground">
              Terms of Service
            </Link>
            <Link href={`/${lang}/privacy-policy`} className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href={`/${lang}/cookie-policy`} className="hover:text-foreground">
              Cookie Policy
            </Link>
          </div>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} dietlessAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}