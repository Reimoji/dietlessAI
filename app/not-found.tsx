'use client';

import { EggFried } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

export default function NotFound() {
  return (
    <div className='flex items-center justify-center min-h-[100dvh]'>
      <Suspense fallback={<div>Loading...</div>}>
        <NotFoundContent />
      </Suspense>
    </div>
  );
}

export function NotFoundContent() {
  return (
    <div className='max-w-md space-y-8 p-4 text-center'>
      <div className='flex justify-center'>
        <EggFried className='size-12 text-primary' />
      </div>
      <h1 className='text-4xl font-bold text-foreground tracking-tight'>Page Not Found</h1>
      <p className='text-basetext-foreground'>
        The page you are looking for might have been removed, had its name changed, or is
        temporarily unavailable.
      </p>
      <Link
        href='/'
        className='max-w-48 mx-auto flex justify-center py-2 px-4 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:primary'
      >
        Back to Home
      </Link>
    </div>
  );
}
