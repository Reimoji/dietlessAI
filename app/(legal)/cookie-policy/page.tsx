import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy - dietlessAI',
  description: 'Cookie Policy for dietlessAI',
};

export default function CookiePolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Cookie Policy</h1>
      
      <p className="text-sm text-muted-foreground mb-6">
        Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </p>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-2">1. What Are Cookies?</h2>
          <p>
            Cookies are small files stored on your device to help websites remember things like login status,
            preferences, and usage patterns. Most websites use them — including ours.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">2. How We Use Cookies</h2>
          <p>
            DietlessAI uses cookies for two main reasons:
            <br />
            - To keep you logged in securely using a session cookie
            <br />
            - To track general site usage and email performance (via Klaviyo)
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">3. Essential Cookies</h2>
          <p>
            We use a cookie to keep you securely logged in. It remembers who you are between visits
            and helps the app work properly. This cookie expires after a short time and doesn’t store any
            personal information you can see.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">4. Analytics & Marketing Cookies</h2>
          <p>
            Klaviyo may use cookies to help us understand how people interact with our site and emails.
            These cookies are used for things like open rates and click tracking.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">5. Managing Cookies</h2>
          <p>
            You can control or block cookies in your browser settings at any time. Just be aware that
            disabling essential cookies may prevent you from logging into the app.
          </p>
        </section>

      </div>
    </div>
  );
}