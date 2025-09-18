import { redirect } from "next/navigation";

const SUPPORTED_LANGS = ["en", "et"];

/**
 * Locale-aware redirect.
 * If the current pathname already starts with a supported locale, reuse it.
 * Otherwise fall back to "en".
 */
export function redirectWithLocale(pathname: string | undefined, target: string) {
  let locale = "en";

  if (pathname) {
    const found = SUPPORTED_LANGS.find((lang) =>
      pathname.startsWith(`/${lang}`)
    );
    if (found) {
      locale = found;
    }
  }

  redirect(`/${locale}/${target}`);
}
