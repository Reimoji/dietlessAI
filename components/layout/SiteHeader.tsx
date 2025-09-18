'use client';

import { signOut } from '@/app/[lang]/(login)/actions';
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
import { BookOpen, EggFried, LogOut, MessageSquare, Settings, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Suspense, use, useState } from 'react';

function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { userPromise } = useUser();
  const user = use(userPromise);
  const router = useRouter();
  const pathname = usePathname();

  // detect current lang
  const lang = pathname?.startsWith('/et') ? 'et' : 'en';

  const navItems = [
    { href: `/${lang}/dashboard/chat`, icon: MessageSquare, label: 'Chat with DietlessAI' },
    { href: `/${lang}/dashboard`, icon: Users, label: 'User Settings' },
    { href: `/${lang}/dashboard/general`, icon: Settings, label: 'General' },
    { href: `/${lang}/blog`, icon: BookOpen, label: 'Blog' },
  ];

  async function handleSignOut() {
    await signOut();
    router.refresh();
    router.push(`/${lang}`);
  }

  // smooth-scroll Pricing if we're on home
  const scrollToPricing = (e: React.MouseEvent) => {
    if (pathname === `/${lang}`) {
      e.preventDefault();
      document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!user) {
    return (
      <>
        <Link
          href={`/${lang}/blog`}
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Blog
        </Link>

        {pathname === `/${lang}` ? (
          <a
            href="#pricing"
            onClick={scrollToPricing}
            className="text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer"
          >
            Pricing
          </a>
        ) : (
          <Link
            href={`/${lang}/pricing`}
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Pricing
          </Link>
        )}

        <Button
          asChild
          className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm px-4 py-2 rounded-full"
        >
          <Link href={`/${lang}/sign-up`}>Sign Up</Link>
        </Button>
      </>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <AnimatedMenuIcon isOpen={isMenuOpen} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="py-4 flex flex-col items-center gap-2">
            <Avatar className="size-16">
              <AvatarImage alt={user.name || ''} />
              <AvatarFallback>
                {user.email.split(' ').map((n) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{user.name || user.email}</span>
          </div>
          <DropdownMenuSeparator />
          {navItems.map((item) => (
            <DropdownMenuItem key={item.href} className="cursor-pointer" asChild>
              <Link href={item.href} className="flex items-center w-full">
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <form action={handleSignOut} className="w-full">
            <button type="submit" className="flex w-full">
              <DropdownMenuItem className="w-full flex-1 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </button>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();
  const lang = pathname?.startsWith('/et') ? 'et' : 'en';

  return (
    <header className="border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href={`/${lang}`} className="flex items-center">
          <div className="transition-all duration-300 hover:scale-110 hover:rotate-12">
            <EggFried className="h-6 w-6 text-primary" />
          </div>
          <span className="ml-2 text-xl font-semibold text-foreground">dietlessAI</span>
        </Link>
        <div className="flex items-center space-x-4">
          <Suspense fallback={<div className="h-9" />}><UserMenu /></Suspense>
        </div>
      </div>
    </header>
  );
}
