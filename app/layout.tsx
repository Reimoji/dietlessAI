import NavigationProgressWrapper from '@/components/ui/navigation-progress';
import { UserProvider } from '@/lib/auth';
import { getUser } from '@/lib/db/queries';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';
import Script from 'next/script';

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
      <head>
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-G89X3MDJEG"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-G89X3MDJEG');
          `}
        </Script>
      </head>
      <body className='min-h-[100dvh] bg-gray-50'>
        <NavigationProgressWrapper />
        <UserProvider userPromise={userPromise}>{children}</UserProvider>
        <Toaster
          position='bottom-center'
          closeButton
          theme='system'
          richColors
          duration={5000}
          visibleToasts={3}
        />
        
        {/* Klaviyo Tracking Script */}
        <Script
          async
          type='text/javascript'
          src='https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=WsXtj9'
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}



