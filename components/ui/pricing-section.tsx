'use client';

import { Button } from '@/components/ui/button';
import { Loader2, Check } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { useState } from 'react';

// Submit button component
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-primary hover:bg-primary/90 hover:cursor-pointer text-primary-foreground rounded-md flex items-center justify-center py-3"
    >
      {pending ? (
        <>
          <Loader2 className="animate-spin mr-2 h-4 w-4" />
          Loading...
        </>
      ) : (
        'SUBSCRIBE NOW'
      )}
    </Button>
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
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annually'>('monthly');

  const basePlan = products.find((product) => product.name === 'Base');
  const plusPlan = products.find((product) => product.name === 'Plus');

  // Get the appropriate plan based on billing interval
  const currentPlan = billingInterval === 'monthly' ? basePlan : plusPlan;
  const currentPrice = prices.find((price) => price.productId === currentPlan?.id);

  const interval = currentPrice?.interval || 'month';

  // Features based on the selected plan
  const baseFeatures = [
    'AI-powered meal recommendations',
    'Basic nutritional insights',
    'Weekly meal plans',
    '24/7 AI chat support'
  ];

  const plusFeatures = [
    'Advanced AI-powered meal recommendations',
    'Detailed nutritional insights and analytics',
    'Customizable weekly meal plans',
    'Priority 24/7 AI chat support',
    'Exclusive recipes and content'
  ];

  const features = billingInterval === 'monthly' ? baseFeatures : plusFeatures;

  return (
    <section className="py-24 bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-primary font-medium mb-4">Healthy Eating, Hassle-Free Plans</p>
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Unlock Your Healthiest Self with One<br />Simple Subscription
          </h2>
        </div>

        <div className="bg-card rounded-xl shadow-md overflow-hidden max-w-5xl mx-auto">
          {/* Billing toggle */}
          <div className="flex justify-center p-4 bg-background border-b border-border">
            <div className="inline-flex rounded-full bg-muted p-1">
              <button
                onClick={() => setBillingInterval('monthly')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${billingInterval === 'monthly' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingInterval('annually')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${billingInterval === 'annually' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
              >
                Annually
              </button>
            </div>
          </div>

          <div className="p-8 md:flex">
            {/* Left side - Plan details */}
            <div className="md:w-1/2 md:pr-8 flex flex-col justify-center">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  {billingInterval === 'monthly' ? 'The Essential Plan' : 'The Premium Plan'}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {billingInterval === 'monthly'
                    ? 'Get started with personalized nutrition advice.'
                    : 'Unlock advanced features and premium support.'}
                </p>

                <ul className="space-y-4">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right side - Pricing and subscribe */}
            <div className="md:w-1/2 md:border-l md:border-border md:pl-8 pt-6 md:pt-0 flex flex-col justify-center">
              <div className="flex flex-col items-center justify-center space-y-6">
                <div className="flex flex-col items-center">
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-foreground">
                      {currentPrice?.unitAmount ? `${(currentPrice.unitAmount / 100).toFixed(2)} €` : '8.00 €'}
                    </span>
                    <span className="text-muted-foreground ml-2">/{interval}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 text-center">
                    Billed {billingInterval === 'monthly' ? 'monthly' : 'annually'}. Switch to {billingInterval === 'monthly' ? 'annual' : 'monthly'} for savings.
                  </p>
                </div>

                <form action={checkoutAction} className="w-full">
                  <input type="hidden" name="priceId" value={currentPrice?.id} />
                  <SubmitButton />
                  <p className="text-xs text-center text-muted-foreground mt-4">
                    Cancel anytime. No hidden fees.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
