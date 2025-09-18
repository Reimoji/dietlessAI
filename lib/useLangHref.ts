// lib/useLangHref.ts
'use client';

import { usePathname } from 'next/navigation';

/**
 * useLangHref
 * Creates hrefs that automatically include the current language.
 *
 * Example:
 *   const href = useLangHref();
 *   <Link href={href('/pricing')}>Pricing</Link>
 */
export function useLangHref() {
  const pathname = usePathname();
  // take the first segment after `/`
  const lang = pathname?.split('/')[1] || 'en';

  return (path: string) => {
    // ensure path always has leading slash
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `/${lang}${cleanPath}`;
  };
}
