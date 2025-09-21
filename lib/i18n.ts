import en from "@/locales/en.json";
import et from "@/locales/et.json";

const translations = { en, et };
export type Lang = keyof typeof translations;

export function t(lang: Lang, key: string): string {
  const parts = key.split(".");
  let result: any = translations[lang];
  for (const part of parts) {
    result = result?.[part];
    if (!result) break;
  }
  return result || key;
}
