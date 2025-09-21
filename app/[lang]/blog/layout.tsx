'use client';

import Footer from '@/components/layout/Footer';
import SiteHeader from '@/components/layout/SiteHeader';

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className='flex flex-col min-h-screen bg-background'>
      {/* Header — same look as homepage */}

      <main className='flex-1'>{children}</main>
      <Footer />
    </section>
  );
}
