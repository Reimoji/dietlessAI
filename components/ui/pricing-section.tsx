'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2, Check } from 'lucide-react';
import { useFormStatus } from 'react-dom';

// Submit button component
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-white hover:bg-gray-100 text-black border border-gray-200 rounded-full flex items-center justify-center"
    >
      {pending ? (
        <>
          <Loader2 className="animate-spin mr-2 h-4 w-4" />
          Loading...
        </>
      ) : (
        <>
          Get Started
          <ArrowRight className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
}

// Pricing card component
function PricingCard({
  name,
  price,
  interval,
  trialDays,
  features,
  priceId,
  checkoutAction,
}: {
  name: string;
  price: number;
  interval: string;
  trialDays: number;
  features: string[];
  priceId?: string;
  checkoutAction: any;
}) {
  return (
    <div className="pt-6 bg-card p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-medium text-foreground mb-2">{name}</h2>
      <p className="text-sm text-muted-foreground mb-4">
        with {trialDays} day free trial
      </p>
      <p className="text-4xl font-medium text-foreground mb-6">
        ${price / 100}{' '}
        <span className="text-xl font-normal text-muted-foreground">
          per user / {interval}
        </span>
      </p>
      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-foreground">{feature}</span>
          </li>
        ))}
      </ul>
      <form action={checkoutAction}>
        <input type="hidden" name="priceId" value={priceId} />
        <SubmitButton />
      </form>
    </div>
  );
}

// Main pricing section component
export function PricingSection({
  prices,
  products,
  checkoutAction,
}: {
  prices: any[];
  products: any[];
  checkoutAction: any;
}) {
  const basePlan = products.find((product) => product.name === 'Base');
  const plusPlan = products.find((product) => product.name === 'Plus');

  const basePrice = prices.find((price) => price.productId === basePlan?.id);
  const plusPrice = prices.find((price) => price.productId === plusPlan?.id);

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-16 text-foreground">
          Choose Your Plan
        </h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <PricingCard
            name={basePlan?.name || 'Base'}
            price={basePrice?.unitAmount || 800}
            interval={basePrice?.interval || 'month'}
            trialDays={basePrice?.trialPeriodDays || 7}
            features={[
              'Unlimited Usage',
              'Unlimited Workspace Members',
              'Email Support',
            ]}
            priceId={basePrice?.id}
            checkoutAction={checkoutAction}
          />
          <PricingCard
            name={plusPlan?.name || 'Plus'}
            price={plusPrice?.unitAmount || 1200}
            interval={plusPrice?.interval || 'month'}
            trialDays={plusPrice?.trialPeriodDays || 7}
            features={[
              'Everything in Base, and:',
              'Early Access to New Features',
              '24/7 Support + Slack Access',
            ]}
            priceId={plusPrice?.id}
            checkoutAction={checkoutAction}
          />
        </div>
      </div>
    </section>
  );
}
