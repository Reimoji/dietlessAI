'use client';

import { signOut } from '@/app/(login)/actions';
import { AnimatedMenuIcon } from '@/components/ui/animated-menu-icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUser } from '@/lib/auth';
import { EggFried, LogOut, MessageSquare, Settings, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Suspense, use, useState } from 'react';

function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { userPromise } = useUser();
  const user = use(userPromise);
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard/chat', icon: MessageSquare, label: 'Chat' },
    { href: '/dashboard', icon: Users, label: 'User Settings' },
    { href: '/dashboard/general', icon: Settings, label: 'General' },
  ];

  async function handleSignOut() {
    await signOut();
    router.refresh();
    router.push('/');
  }

  // Custom scroll handler for pricing section
  const scrollToPricing = (e: React.MouseEvent) => {
    if (pathname === '/') {
      e.preventDefault();
      const pricingSection = document.getElementById('pricing');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  if (!user) {
    return (
      <>
        {pathname === '/' ? (
          <a
            href="#pricing"
            onClick={scrollToPricing}
            className='text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer'
          >
            Pricing
          </a>
        ) : (
          <Link
            href="/pricing"
            className='text-sm font-medium text-muted-foreground hover:text-foreground'
          >
            Pricing
          </Link>
        )}
        <Button
          asChild
          className='bg-primary hover:bg-primary/90 text-primary-foreground text-sm px-4 py-2 rounded-full'
        >
          <Link href='/sign-up'>Sign Up</Link>
        </Button>
      </>
    );
  }

  return (
    <div className='flex items-center gap-2'>
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' size='icon'>
            <AnimatedMenuIcon isOpen={isMenuOpen} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-56'>
          <div className='py-4 flex flex-col items-center gap-2'>
            <Avatar className='size-16'>
              <AvatarImage alt={user.name || ''} />
              <AvatarFallback>
                {user.email
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <span className='text-sm font-medium'>{user.name || user.email}</span>
          </div>
          <DropdownMenuSeparator />
          {navItems.map((item) => (
            <DropdownMenuItem key={item.href} className='cursor-pointer' asChild>
              <Link href={item.href} className='flex items-center w-full'>
                <item.icon className='mr-2 h-4 w-4' />
                <span>{item.label}</span>
              </Link>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <form action={handleSignOut} className='w-full'>
            <button type='submit' className='flex w-full'>
              <DropdownMenuItem className='w-full flex-1 cursor-pointer'>
                <LogOut className='mr-2 h-4 w-4' />
                <span>Sign out</span>
              </DropdownMenuItem>
            </button>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function Header() {
  return (
    <header className='border-b border-border'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center'>
        <Link href='/' className='flex items-center'>
          <div className='transition-all duration-300 hover:scale-110 hover:rotate-12'>
            <EggFried className='h-6 w-6 text-primary' />
          </div>
          <span className='ml-2 text-xl font-semibold text-foreground'>dietlessAI</span>
        </Link>
        <div className='flex items-center space-x-4'>
          <Suspense fallback={<div className='h-9' />}>
            <UserMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className='flex flex-col h-screen bg-background'>
      <Header />
      {children}
    </section>
  );
}
