import NavigationProgressWrapper from '@/components/ui/navigation-progress';
import { UserProvider } from '@/lib/auth';
import { getUser } from '@/lib/db/queries';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'dietlessAI',
  description: 'Personalized Nutrition Coaching That Evolves with Your Lifestyle',
  icons: {
    icon: 'favicon.ico',
  },
};

export const viewport: Viewport = {
  maximumScale: 1,
};

const manrope = Manrope({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const userPromise = getUser();

  return (
    <html
      lang='en'
      className={`bg-white dark:bg-gray-950 text-black dark:text-white ${manrope.className}`}
    >
      <body className='min-h-[100dvh] bg-gray-50'>
        <NavigationProgressWrapper />
        <UserProvider userPromise={userPromise}>{children}</UserProvider>
        <Toaster
          position='bottom-center'
          closeButton
          theme='system'
          richColors
          duration={5000} // Default duration for regular toasts
          visibleToasts={3} // Show up to 3 toasts at once
        />
      </body>
    </html>
  );
}
