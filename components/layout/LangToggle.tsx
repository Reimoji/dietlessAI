"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const SUPPORTED_LANGS = ["en", "et"] as const;

const LABELS: Record<(typeof SUPPORTED_LANGS)[number], string> = {
  en: "ENG",
  et: "EST",
};

export default function LangToggle({ current }: { current: "en" | "et" }) {
  const pathname = usePathname();
  const other = current === "en" ? "et" : "en";

  const target = pathname.replace(`/${current}`, `/${other}`);

  const handleLanguageSwitch = () => {
    // Set language preference cookie for 1 year
    document.cookie = `preferred-lang=${other}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
  };

  return (
    <Link
      href={target}
      onClick={handleLanguageSwitch}
      className="px-3 py-1 border rounded-full text-sm hover:bg-accent"
    >
      {LABELS[other]}
    </Link>
  );
}