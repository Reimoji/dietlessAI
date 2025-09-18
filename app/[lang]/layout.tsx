import { ReactNode, Suspense } from "react";
import Link from "next/link";
import { EggFried } from "lucide-react";
import UserMenu from "./UserMenu";

const SUPPORTED_LANGS = ["en", "et"] as const;
type Lang = (typeof SUPPORTED_LANGS)[number];

function Header({ lang }: { lang: Lang }) {
  return (
    <header className="border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* ✅ Home link now respects current lang */}
        <Link href={`/${lang}`} className="flex items-center">
          <div className="transition-all duration-300 hover:scale-110 hover:rotate-12">
            <EggFried className="h-6 w-6 text-primary" />
          </div>
          <span className="ml-2 text-xl font-semibold text-foreground">
            dietlessAI
          </span>
        </Link>
        <div className="flex items-center space-x-4">
          <Suspense fallback={<div className="h-9" />}>
            <UserMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

export default async function LangLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>; // ✅ Now a Promise
}) {
  const { lang: rawLang } = await params; // ✅ Await the params
  const lang = SUPPORTED_LANGS.includes(rawLang as Lang)
    ? (rawLang as Lang)
    : "en";

  return (
    <html
      lang={lang}
      className="bg-white dark:bg-gray-950 text-black dark:text-white"
    >
      <body className="min-h-[100dvh] bg-gray-50">
        <section className="flex flex-col h-screen bg-background">
          <Header lang={lang} />
          {children}
        </section>
      </body>
    </html>
  );
}