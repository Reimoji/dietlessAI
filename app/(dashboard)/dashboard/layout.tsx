'use client';

import { Button } from '@/components/ui/button';
import { MessageSquare, Settings, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard/chat', icon: MessageSquare, label: 'Chat with DietlessAI' },
    { href: '/dashboard', icon: Users, label: 'User Settings' },
    { href: '/dashboard/general', icon: Settings, label: 'General' },
  ];

  return (
    <div className='flex h-[calc(100dvh-69px)] max-w-7xl mx-auto w-full overflow-hidden'>
      {/* Sidebar - hidden on mobile, visible on desktop */}
      <aside className='hidden lg:block w-64 bg-gray-50 border-r border-gray-200'>
        <nav className='p-4'>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} passHref>
              <Button
                variant={pathname === item.href ? 'secondary' : 'ghost'}
                className={`shadow-none my-1 w-full justify-start cursor-pointer ${
                  pathname === item.href ? 'bg-gray-100' : ''
                }`}
              >
                <item.icon className='mr-2 h-4 w-4' />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className='flex-1 overflow-hidden'>{children}</main>
    </div>
  );
}

