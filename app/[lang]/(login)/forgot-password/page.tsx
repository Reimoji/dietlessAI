import { Suspense } from "react";
import { ForgotPasswordForm } from "./forgot-password-form";
import { Lang, t } from "@/lib/i18n";

const SUPPORTED_LANGS = ["en", "et"] as const;

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  // ✅ await params because it's now a Promise in Next.js 15
  const { lang } = await params;
  const typedLang = (SUPPORTED_LANGS.includes(lang as Lang) ? lang : "en") as Lang;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {t(typedLang, "forgot.title")}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t(typedLang, "forgot.subtitle")}
          </p>
        </div>

        <div className="mt-8">
          <Suspense fallback={<div>{t(typedLang, "forgot.loading")}</div>}>
            <ForgotPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
