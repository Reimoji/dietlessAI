'use client';

import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useFormStatus } from 'react-dom';

// Declare fbq for TypeScript
declare global {
  interface Window {
    fbq: any;
  }
}

// Submit button component
function SubmitButton() {
  const { pending } = useFormStatus();

  const handleSubmit = (e: React.FormEvent) => {
    // Track the checkout initiation before form submission
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'InitiateCheckout');
    }
    // Form will continue to submit normally after this
  };

  return (
    <Button
      type='submit'
      disabled={pending}
      onClick={handleSubmit}
      className='w-full bg-primary hover:bg-primary/90 hover:cursor-pointer text-primary-foreground rounded-md flex items-center justify-center py-3'
    >
      {pending ? (
        <>
          <Loader2 className='animate-spin mr-2 h-4 w-4' />
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

  // Find monthly and yearly products
  const monthlyPlan = products.find((product) => product.name === 'DietlessAI – Monthly');
  const yearlyPlan = products.find((product) => product.name === 'DietlessAI – Yearly');

  // Get the appropriate plan based on billing interval
  const currentPlan = billingInterval === 'monthly' ? monthlyPlan : yearlyPlan;
  
  // Find the price for the current plan
  const currentPrice = prices.find((price) => price.productId === currentPlan?.id);

  // Set fixed prices based on billing interval
  const displayPrice = billingInterval === 'monthly' ? '9.90 €' : '89.90 €';
  const interval = billingInterval === 'monthly' ? 'month' : 'year';
  
  // Calculate savings for yearly plan (approximately 24% savings)
  const monthlyCost = billingInterval === 'monthly' ? 9.90 : (89.90 / 12).toFixed(2);
  const savings = billingInterval === 'annually' ? 'Save 24% compared to monthly' : '';

  // Features are the same for both plans
  const features = [
    'AI-powered meal recommendations',
    'Personalized nutritional insights',
    'Weekly meal plans',
    '24/7 AI chat support',
    'Recipe database access',
  ];

  return (
    <section id='pricing' className='py-20 relative overflow-hidden'>
      {/* Gradient background for Pricing section - without the blue blob at top */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          backgroundImage: `
            /* Yellow blob - left center */
            radial-gradient(circle at 25% 50%, rgba(236, 232, 98, 0.9) 0%, rgba(236, 232, 98, 0) 25%),
            
            /* Pink blob - right center */
            radial-gradient(circle at 75% 50%, rgba(236, 98, 171, 0.8) 0%, rgba(236, 98, 171, 0) 25%)
          `,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          opacity: 0.8,
          filter: 'blur(60px)',
        }}
      />
      <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
        <div className='text-center mb-12'>
          <p className='text-primary font-medium mb-4'>Healthy Eating, Hassle-Free Plans</p>
          <h2 className='text-4xl font-bold text-foreground mb-6'>
            Start your chat with DietlessAI using a
            <br />
            2 day free trial
          </h2>
        </div>

        <div className='bg-card rounded-xl shadow-md overflow-hidden max-w-5xl mx-auto'>
          {/* Billing toggle */}
          <div className='flex justify-center p-4 bg-background border-b border-border'>
            <div className='inline-flex rounded-full bg-muted p-1'>
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

          <div className='p-8 md:flex'>
            {/* Left side - Plan details */}
            <div className='md:w-1/2 md:pr-8 flex flex-col justify-center'>
              <div>
                <h3 className='text-2xl font-bold text-foreground mb-4'>
                  {billingInterval === 'monthly' ? 'Monthly Plan' : 'Annual Plan'}
                </h3>
                <p className='text-muted-foreground mb-6'>
                  {billingInterval === 'monthly'
                    ? 'Get started with personalized nutrition advice.'
                    : 'Get the best value with our annual subscription.'}
                </p>

                <ul className='space-y-4'>
                  {features.map((feature, index) => (
                    <li key={index} className='flex items-start'>
                      <Check className='h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0' />
                      <span className='text-foreground'>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right side - Pricing and subscribe */}
            <div className='md:w-1/2 md:border-l md:border-border md:pl-8 pt-6 md:pt-0 flex flex-col justify-center'>
              <div className='flex flex-col items-center justify-center space-y-6'>
                <div className='flex flex-col items-center'>
                  {/* First row: 0€ for 2 days */}
                  <div className='flex items-baseline justify-center mb-2'>
                    <span className='text-5xl text-foreground tracking-tight mt-4'>
                      <strong>FREE</strong> for 2 days
                    </span>
                  </div>
                  
                  {/* Second row: Monthly price afterwards */}
                  <div className='flex items-baseline justify-center'>
                    <span className='text-md font-medium text-foreground mt-5'>
                      {displayPrice}
                    </span>
                    <span className='text-muted-foreground ml-2 text-md'>/{interval} afterwards</span>
                  </div>
                  
                  {/* Additional pricing info - can be removed if not needed */}
                  {billingInterval === 'annually' && (
                    <p className='text-sm text-primary font-medium mt-2'>
                      {savings}
                    </p>
                  )}
                </div>

                <form action={checkoutAction} className='w-full'>
                  <input type='hidden' name='priceId' value={currentPrice?.id} />
                  <SubmitButton />
                  <p className='text-xs text-center text-muted-foreground mt-4'>
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