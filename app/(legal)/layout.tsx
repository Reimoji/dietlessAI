import Link from 'next/link';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Simple Header */}
      <header className="border-b py-4">
        <div className="container mx-auto px-4">
          <Link href="/" className="text-xl font-semibold">
            dietlessAI
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow py-6">
        {children}
      </main>

      {/* Simple Footer */}
      <footer className="border-t py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <Link href="/terms-of-service" className="hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="/privacy-policy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/cookie-policy" className="hover:text-foreground">
              Cookie Policy
            </Link>
          </div>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} dietlessAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}