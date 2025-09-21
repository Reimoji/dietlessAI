"use client";

import { useState, use } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/app/[lang]/(login)/actions";
import { useUser } from "@/lib/auth";
import { useLangHref } from "@/lib/useLangHref";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AnimatedMenuIcon } from "@/components/ui/animated-menu-icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react";
import LangToggle from "@/components/layout/LangToggle";


export default function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { userPromise } = useUser();
  const user = use(userPromise);
  const router = useRouter();
  const pathname = usePathname();
  const href = useLangHref();

  // detect current lang
  const currentLang = pathname?.startsWith("/et") ? "et" : "en";

  const navItems = [
    { href: href("/dashboard/chat"), icon: MessageSquare, label: "Chat with DietlessAI" },
    { href: href("/dashboard"), icon: Users, label: "User Settings" },
    { href: href("/dashboard/general"), icon: Settings, label: "General" },
  ];

  async function handleSignOut() {
    await signOut();
    router.refresh();
    router.push("/");
  }

  const scrollToPricing = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      const pricingSection = document.getElementById("pricing");
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const SHOW_BLOG = false;

  if (!user) {
    return (
      <>
        {SHOW_BLOG && (
          <Link
            href={href("/blog")}
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Blog
          </Link>
        )}

        {pathname === "/" ? (
          <a
            href="#pricing"
            onClick={scrollToPricing}
            className="text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer"
          >
            Pricing
          </a>
        ) : (
          <Link
            href={href("/pricing")}
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Pricing
          </Link>
        )}

        {/* Always show language toggle */}
        <LangToggle current={currentLang as "en" | "et"} />

        <Button
          asChild
          className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm px-4 py-2 rounded-full"
        >
          <Link href={href("/sign-up")}>Sign Up</Link>
        </Button>
      </>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Always show language toggle */}
      <LangToggle current={currentLang as "en" | "et"} />

      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <AnimatedMenuIcon isOpen={isMenuOpen} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="py-4 flex flex-col items-center gap-2">
            <Avatar className="size-16">
              <AvatarImage alt={user.name || ""} />
              <AvatarFallback>
                {user.email
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{user.name || user.email}</span>
          </div>
          <DropdownMenuSeparator />
          {navItems.map((item) => (
            <DropdownMenuItem key={item.href} asChild>
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
