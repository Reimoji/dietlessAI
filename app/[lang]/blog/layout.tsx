'use client';

import { EggFried } from 'lucide-react';
import Link from 'next/link';

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className='flex flex-col min-h-screen bg-background'>
      {/* Header — same look as homepage */}
      <header className='border-b border-border'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center'>
          <Link href='/' className='flex items-center'>
            <div className='transition-all duration-300 hover:scale-110 hover:rotate-12'>
              <EggFried className='h-6 w-6 text-primary' />
            </div>
            <span className='ml-2 text-xl font-semibold text-foreground'>dietlessAI</span>
          </Link>
          {/* keep right side empty for now; we can wire your UserMenu later */}
        </div>
      </header>

      <main className='flex-1'>{children}</main>
    </section>
  );
}
