import en from "@/locales/en.json";
import et from "@/locales/et.json";

const translations = { en, et };
export type Lang = keyof typeof translations;

/**
 * Lookup translation by dot-notation key.
 * Example: t("en", "home.hero.title")
 */
export function t(lang: Lang, key: string): string {
  const parts = key.split(".");
  let result: any = translations[lang];

  for (const part of parts) {
    if (result && typeof result === "object" && part in result) {
      result = result[part];
    } else {
      // ✅ return key if missing, so it fails gracefully
      return key;
    }
  }

  return typeof result === "string" ? result : key;
}
