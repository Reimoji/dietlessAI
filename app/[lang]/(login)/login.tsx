"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActionState } from "@/lib/auth/middleware";
import { EggFried, Loader2 } from "lucide-react";
import { useSearchParams, usePathname } from "next/navigation";
import { useActionState } from "react";
import { signIn, signUp } from "./actions";
import { Lang, t } from "@/lib/i18n";

const SUPPORTED_LANGS = ["en", "et"] as const;

export function Login({ mode = "signin" }: { mode?: "signin" | "signup" }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const redirect = searchParams.get("redirect");
  const priceId = searchParams.get("priceId");
  const inviteId = searchParams.get("inviteId");

  // Derive current lang from path (`/en/...`)
  const langFromPath = pathname?.split("/")[1] as Lang | undefined;
  const typedLang = (SUPPORTED_LANGS.includes(langFromPath as Lang)
    ? langFromPath
    : "en") as Lang;

  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    mode === "signin" ? signIn : signUp,
    { error: "" }
  );

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href={`/${typedLang}`} aria-label={t(typedLang, "login.aria_home")}>
            <EggFried className="h-12 w-12 text-primary transition-all duration-300 hover:scale-110 hover:rotate-12 cursor-pointer" />
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
          {mode === "signin"
            ? t(typedLang, "login.signin_title")
            : t(typedLang, "login.signup_title")}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <form className="space-y-6" action={formAction}>
          <input type="hidden" name="redirect" value={redirect || ""} />
          <input type="hidden" name="priceId" value={priceId || ""} />
          <input type="hidden" name="inviteId" value={inviteId || ""} />
          <input type="hidden" name="lang" value={typedLang} />

          {/* Email */}
          <div>
            <Label htmlFor="email" className="block text-sm font-medium text-foreground">
              {t(typedLang, "login.email")}
            </Label>
            <div className="mt-1">
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={state.email}
                required
                maxLength={50}
                className="appearance-none rounded-full relative block w-full px-3 py-2 border border-border placeholder-muted-foreground text-foreground focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder={t(typedLang, "login.email_placeholder")}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password" className="block text-sm font-medium text-foreground">
              {t(typedLang, "login.password")}
            </Label>
            <div className="mt-1">
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                defaultValue={state.password}
                required
                minLength={8}
                maxLength={100}
                className="appearance-none rounded-full relative block w-full px-3 py-2 border border-border placeholder-muted-foreground text-foreground focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder={t(typedLang, "login.password_placeholder")}
              />
            </div>
          </div>

          {/* Forgot password */}
          <div className="flex items-center justify-between mt-2">
            <div className="text-sm">
              <Link
                href={`/${typedLang}/forgot-password`}
                className="font-medium text-primary hover:text-primary/90"
              >
                {t(typedLang, "login.forgot_password")}
              </Link>
            </div>
          </div>

          {state?.error && <div className="text-red-500 text-sm">{state.error}</div>}

          <div>
            <Button
              type="submit"
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              disabled={pending}
            >
              {pending ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  {t(typedLang, "login.loading")}
                </>
              ) : mode === "signin" ? (
                t(typedLang, "login.signin")
              ) : (
                t(typedLang, "login.signup")
              )}
            </Button>
          </div>
        </form>

        {/* Switch form */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">
                {mode === "signin"
                  ? t(typedLang, "login.new_here")
                  : t(typedLang, "login.already_have")}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <Link
              href={`/${typedLang}${mode === "signin" ? "/sign-up" : "/sign-in"}${
                redirect ? `?redirect=${redirect}` : ""
              }${priceId ? `&priceId=${priceId}` : ""}`}
              className="w-full flex justify-center py-2 px-4 border border-border rounded-full shadow-sm text-sm font-medium text-foreground bg-card hover:bg-card/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {mode === "signin"
                ? t(typedLang, "login.create_account")
                : t(typedLang, "login.signin_existing")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
