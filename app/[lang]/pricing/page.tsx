import { PricingSection } from '@/components/ui/pricing-section';
import { checkoutAction } from '@/lib/payments/actions';
import { getStripePrices, getStripeProducts } from '@/lib/payments/stripe';

// Prices are fresh for one hour max
export const revalidate = 3600;

export default async function PricingPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params; // ✅ Await the params
  const [prices, products] = await Promise.all([getStripePrices(), getStripeProducts()]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <PricingSection
        prices={prices}
        products={products}
        checkoutAction={checkoutAction}
        lang={lang} // ✅ Use the awaited lang
      />
    </main>
  );
}