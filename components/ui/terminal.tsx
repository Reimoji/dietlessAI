'use client';

import { Lang, t } from '@/lib/i18n';
import { EggFried, SendHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';

const SUPPORTED_LANGS = ['en', 'et'] as const;

export function Terminal({ lang }: { lang: string }) {
  const typedLang = (SUPPORTED_LANGS.includes(lang as Lang) ? lang : 'en') as Lang;

  const [chatStep, setChatStep] = useState(0);

  const chatSteps = [
    { sender: 'user', text: t(typedLang, 'terminal.step1') },
    { sender: 'ai', text: t(typedLang, 'terminal.step2') },
    { sender: 'user', text: t(typedLang, 'terminal.step3') },
    { sender: 'ai', text: t(typedLang, 'terminal.step4') },
    { sender: 'ai', text: t(typedLang, 'terminal.step5') },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setChatStep((prev) => (prev < chatSteps.length - 1 ? prev + 1 : prev));
    }, 1100);
    return () => clearTimeout(timer);
  }, [chatStep, chatSteps.length]);

  const typing = chatStep < chatSteps.length - 1 && chatSteps[chatStep + 1].sender === 'ai';

  return (
    <div className='w-full overflow-hidden rounded-3xl border border-border bg-card text-card-foreground shadow-2xl shadow-primary/10 text-sm'>
      {/* Window header */}
      <div className='flex items-center gap-3 border-b border-border px-5 py-4'>
        <div className='flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground'>
          <EggFried className='h-5 w-5' />
        </div>
        <div className='leading-tight'>
          <p className='font-semibold'>dietlessAI</p>
          <p className='text-xs text-emerald-600 inline-flex items-center gap-1'>
            <span className='h-1.5 w-1.5 rounded-full bg-emerald-500' />
            {t(typedLang, 'terminal.title')}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className='space-y-3 px-5 py-5 min-h-[340px]'>
        {chatSteps.map((step, index) => (
          <div
            key={index}
            className={`flex ${step.sender === 'user' ? 'justify-end' : 'justify-start'} transition-all duration-500 ${
              index > chatStep ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
            }`}
          >
            <p
              className={`max-w-[85%] px-4 py-2.5 leading-relaxed ${
                step.sender === 'user'
                  ? 'rounded-2xl rounded-br-md bg-primary text-primary-foreground'
                  : 'rounded-2xl rounded-bl-md bg-muted text-foreground'
              }`}
            >
              {step.text}
            </p>
          </div>
        ))}
        {typing && (
          <div className='flex gap-1 px-1' aria-hidden>
            {[0, 150, 300].map((delay) => (
              <span
                key={delay}
                className='h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce'
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Fake input */}
      <div className='border-t border-border px-4 py-3'>
        <div className='flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-muted-foreground'>
          <span className='flex-1 truncate'>{t(typedLang, 'terminal.placeholder')}</span>
          <span className='flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground'>
            <SendHorizontal className='h-3.5 w-3.5' />
          </span>
        </div>
      </div>
    </div>
  );
}
