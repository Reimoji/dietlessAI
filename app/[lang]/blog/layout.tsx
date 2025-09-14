'use client';

import SiteHeader from '@/components/layout/SiteHeader';

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className='flex flex-col min-h-screen bg-background'>
      {/* Header — same look as homepage */}
      <SiteHeader />

      <main className='flex-1'>{children}</main>
    </section>
  );
}
