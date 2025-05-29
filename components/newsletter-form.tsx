'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight } from 'lucide-react';
import { FormEvent, useState } from 'react';

export default function NewsletterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const emailInput = form.querySelector('input[type="email"]') as HTMLInputElement;
    const email = emailInput.value;
    
    if (!email) return;
    
    setIsSubmitting(true);
    setStatus('submitting');
    
    try {
      const response = await fetch('/api/klaviyo/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        emailInput.value = '';
        setStatus('success');
        setTimeout(() => {
          setStatus('idle');
          setIsSubmitting(false);
        }, 2000);
      } else {
        setStatus('error');
        setTimeout(() => {
          setStatus('idle');
          setIsSubmitting(false);
        }, 2000);
      }
    } catch (error) {
      setStatus('error');
      setTimeout(() => {
        setStatus('idle');
        setIsSubmitting(false);
      }, 2000);
    }
  }

  return (
    <div className='flex flex-col sm:flex-row gap-3 max-w-md mx-auto'>
      <form 
        className='flex flex-col sm:flex-row gap-3 w-full'
        onSubmit={handleSubmit}
      >
        <Input
          type='email'
          placeholder='Enter your email'
          className='flex-1 rounded-3xl px-4 py-4 h-auto border-primary/20 focus-visible:ring-primary group-hover:shadow-lg group-hover:shadow-primary/10 transition-all duration-300 bg-white'
          required
        />
        <Button
          type='submit'
          disabled={isSubmitting}
          className='bg-primary hover:bg-primary/80 text-primary-foreground rounded-3xl px-5 py-2 h-auto group-hover:shadow-lg group-hover:shadow-primary/20 transition-all duration-300 relative overflow-hidden cursor-pointer'
          style={{ minHeight: '44px' }}
        >
          <span className='relative z-10 flex items-center'>
            {status === 'submitting' && 'Subscribing...'}
            {status === 'success' && 'Subscribed! ✓'}
            {status === 'error' && 'Failed! Try again'}
            {status === 'idle' && (
              <>
                Subscribe
                <ArrowRight className='ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300' />
              </>
            )}
          </span>
          <span className='absolute inset-0 bg-primary/90 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left'></span>
        </Button>
      </form>
    </div>
  );
}