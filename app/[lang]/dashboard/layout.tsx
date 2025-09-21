'use client';

import { Button } from '@/components/ui/button';
import { MessageSquare, Settings, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Lang, t } from '@/lib/i18n';

const SUPPORTED_LANGS = ['en', 'et'] as const;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Determine the current language from the URL
  const langFromPath = pathname?.split('/')[1] as Lang | undefined;
  const typedLang = (SUPPORTED_LANGS.includes(langFromPath as Lang) ? langFromPath : 'en') as Lang;

  const navItems = [
    { href: `/${typedLang}/dashboard/chat`, icon: MessageSquare, label: t(typedLang, 'dashboard.chat') },
    { href: `/${typedLang}/dashboard`, icon: Users, label: t(typedLang, 'dashboard.user_settings') },
    { href: `/${typedLang}/dashboard/general`, icon: Settings, label: t(typedLang, 'dashboard.general') },
  ];

  return (
    <div className="flex h-[calc(100dvh-69px)] max-w-7xl mx-auto w-full overflow-hidden">
      {/* Sidebar - hidden on mobile, visible on desktop */}
      <aside className="hidden lg:block w-64 bg-gray-50 border-r border-gray-200">
        <nav className="p-4">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} passHref>
              <Button
                variant={pathname === item.href ? 'secondary' : 'ghost'}
                className={`shadow-none my-1 w-full justify-start cursor-pointer ${
                  pathname === item.href ? 'bg-gray-100' : ''
                }`}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
