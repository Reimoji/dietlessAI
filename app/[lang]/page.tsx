import Footer from '@/components/layout/Footer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { PricingSection } from '@/components/ui/pricing-section';
import { Terminal } from '@/components/ui/terminal';
import { Lang, t } from '@/lib/i18n';
import { checkoutAction } from '@/lib/payments/actions';
import { getStripePrices, getStripeProducts } from '@/lib/payments/stripe';
import {
  Apple,
  ArrowRight,
  Banana,
  Brain,
  Check,
  Cherry,
  Citrus,
  FlaskConical,
  Grape,
  Leaf,
  MessageSquare,
  Quote,
  Sparkles,
  Star,
} from 'lucide-react';
import Image from 'next/image';

// Prices are fresh for one hour max
export const revalidate = 3600;

const FEATURES = [
  { key: 'personalized', icon: Brain },
  { key: 'realtime', icon: MessageSquare },
  { key: 'support', icon: Leaf },
] as const;

const BENEFITS = [
  { key: 'shopping', icon: Citrus },
  { key: 'recipes', icon: Apple },
  { key: 'family', icon: Cherry },
  { key: 'flexible', icon: Banana },
  { key: 'insights', icon: Grape },
] as const;

const TESTIMONIALS = ['mark', 'jamie', 'taylor'] as const;

const FAQS = [
  'how_it_works',
  'what_different',
  'dietary_needs',
  'update_frequency',
  'cancel_subscription',
  'ai_accuracy',
  'reliability',
] as const;

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className='text-sm font-semibold uppercase tracking-[0.14em] text-primary'>{children}</p>
  );
}

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const typedLang = (lang === 'et' ? 'et' : 'en') as Lang;
  const tr = (key: string) => t(typedLang, key);
  const [prices, products] = await Promise.all([getStripePrices(), getStripeProducts()]);

  return (
    <main className='overflow-x-clip w-full bg-background'>
      {/* Hero */}
      <section className='relative isolate'>
        <div
          aria-hidden
          className='absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_15%_0%,color-mix(in_oklch,var(--primary)_18%,transparent),transparent),radial-gradient(45%_45%_at_90%_30%,rgba(236,98,171,0.14),transparent),radial-gradient(40%_40%_at_60%_100%,rgba(236,232,98,0.18),transparent)]'
        />
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28'>
          <div className='grid lg:grid-cols-12 gap-12 lg:gap-8 items-center'>
            <div className='lg:col-span-7 text-center lg:text-left'>
              <span className='inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/70 backdrop-blur px-3 py-1 text-sm font-medium text-primary shadow-sm'>
                <Sparkles className='h-4 w-4' />
                {tr('home.hero.badge')}
              </span>
              <h1 className='mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground text-balance leading-[1.08]'>
                {tr('home.hero.title')}{' '}
                <span className='bg-gradient-to-r from-primary via-[#8b5cf6] to-[#ec62ab] bg-clip-text text-transparent'>
                  dietlessAI
                </span>
              </h1>
              <p className='mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 text-pretty'>
                {tr('home.hero.subtitle')}
              </p>
              <div className='mt-10 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start'>
                <Button
                  asChild
                  size='lg'
                  className='rounded-full h-12 px-7 text-base shadow-lg shadow-primary/25 group'
                >
                  <a href='#pricing'>
                    {tr('home.hero.cta')}
                    <ArrowRight className='ml-1 h-5 w-5 transition-transform group-hover:translate-x-0.5' />
                  </a>
                </Button>
                <Button
                  asChild
                  size='lg'
                  variant='outline'
                  className='rounded-full h-12 px-7 text-base bg-card/70 backdrop-blur'
                >
                  <a href='#how-it-works'>{tr('home.hero.secondary_cta')}</a>
                </Button>
              </div>
              <ul className='mt-8 flex flex-wrap gap-x-6 gap-y-2 justify-center lg:justify-start text-sm text-muted-foreground'>
                {(['trust1', 'trust2', 'trust3'] as const).map((k) => (
                  <li key={k} className='inline-flex items-center gap-1.5'>
                    <Check className='h-4 w-4 text-emerald-600' />
                    {tr(`home.hero.${k}`)}
                  </li>
                ))}
              </ul>
            </div>

            <div className='lg:col-span-5'>
              <div className='relative mx-auto max-w-md'>
                <div
                  aria-hidden
                  className='absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-primary/25 via-[#ec62ab]/15 to-[#ece862]/25 blur-2xl'
                />
                <Terminal lang={typedLang} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className='py-20 sm:py-24'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='max-w-3xl mx-auto text-center'>
            <Eyebrow>{tr('home.features.eyebrow')}</Eyebrow>
            <h2 className='mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-foreground text-balance'>
              {tr('home.features.title')}
            </h2>
          </div>
          <div className='mt-14 grid gap-6 md:grid-cols-3'>
            {FEATURES.map(({ key, icon: Icon }) => (
              <div
                key={key}
                className='group rounded-2xl border border-border bg-card p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10'
              >
                <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground'>
                  <Icon className='h-6 w-6' />
                </div>
                <h3 className='mt-6 text-lg font-semibold text-foreground'>
                  {tr(`home.features.${key}.title`)}
                </h3>
                <p className='mt-2 text-muted-foreground leading-relaxed'>
                  {tr(`home.features.${key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits with app screenshot */}
      <section id='how-it-works' className='py-20 sm:py-24 bg-card border-y border-border scroll-mt-8'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid lg:grid-cols-2 gap-14 items-center'>
            <div className='relative flex justify-center order-last lg:order-first'>
              <div
                aria-hidden
                className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[80%] w-[80%] rounded-full bg-primary/15 blur-3xl'
              />
              <Image
                src='/images/dietlessai_screenshot.png'
                alt='dietlessAI chat on a phone'
                width={340}
                height={680}
                className='relative w-full max-w-[300px] h-auto drop-shadow-2xl'
              />
            </div>
            <div>
              <Eyebrow>{tr('home.benefits.eyebrow')}</Eyebrow>
              <h2 className='mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-foreground text-balance'>
                {tr('home.benefits.title')}
              </h2>
              <ul className='mt-10 space-y-7'>
                {BENEFITS.map(({ key, icon: Icon }) => (
                  <li key={key} className='flex gap-4'>
                    <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary'>
                      <Icon className='h-5 w-5' />
                    </div>
                    <div>
                      <h3 className='font-semibold text-foreground'>
                        {tr(`home.benefits.${key}.title`)}
                      </h3>
                      <p className='mt-1 text-muted-foreground leading-relaxed'>
                        {tr(`home.benefits.${key}.description`)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Story + science */}
      <section className='py-20 sm:py-24'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-5 gap-10 lg:gap-16'>
          <div className='lg:col-span-3'>
            <h2 className='text-3xl sm:text-4xl font-bold tracking-tight text-foreground'>
              {tr('home.story.heading')}
            </h2>
            <div className='mt-6 space-y-5 text-lg text-muted-foreground leading-relaxed'>
              <p>{tr('home.story.paragraph1')}</p>
              <p>{tr('home.story.paragraph2')}</p>
            </div>
          </div>
          <div className='lg:col-span-2'>
            <div className='h-full rounded-3xl bg-gradient-to-br from-primary to-[#7c3aed] p-8 sm:p-10 text-primary-foreground shadow-xl shadow-primary/20 flex flex-col'>
              <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-white/15'>
                <FlaskConical className='h-6 w-6' />
              </div>
              <p className='mt-6 text-sm font-semibold uppercase tracking-[0.14em] text-white/70'>
                {tr('home.science.eyebrow')}
              </p>
              <h3 className='mt-2 text-2xl font-bold'>{tr('home.science.title')}</h3>
              <p className='mt-4 text-white/85 leading-relaxed'>{tr('home.science.description')}</p>
              <div className='mt-auto pt-8'>
                <Button
                  asChild
                  size='lg'
                  className='rounded-full bg-white text-primary hover:bg-white/90 h-11 px-6 group'
                >
                  <a href='#pricing'>
                    {tr('home.science.cta')}
                    <ArrowRight className='ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5' />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className='py-20 sm:py-24 bg-card border-y border-border'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center'>
            <Eyebrow>{tr('home.testimonials.eyebrow')}</Eyebrow>
            <h2 className='mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-foreground'>
              {tr('home.testimonials.title')}
            </h2>
          </div>
          <div className='mt-14 grid gap-6 md:grid-cols-3'>
            {TESTIMONIALS.map((key) => {
              const name = tr(`home.testimonials.${key}.name`);
              return (
                <figure
                  key={key}
                  className='relative rounded-2xl border border-border bg-background p-7 flex flex-col'
                >
                  <Quote className='absolute right-6 top-6 h-8 w-8 text-primary/15' />
                  <div className='flex gap-0.5 text-amber-400' aria-label='5 out of 5 stars'>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className='h-4 w-4 fill-current' />
                    ))}
                  </div>
                  <blockquote className='mt-4 text-foreground leading-relaxed flex-1'>
                    “{tr(`home.testimonials.${key}.quote`)}”
                  </blockquote>
                  <figcaption className='mt-6 flex items-center gap-3'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary'>
                      {name.charAt(0)}
                    </div>
                    <div>
                      <p className='font-semibold text-foreground'>{name}</p>
                      <p className='text-sm text-muted-foreground'>
                        {tr(`home.testimonials.${key}.role`)}
                      </p>
                    </div>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id='pricing' className='py-20 sm:py-24 scroll-mt-8'>
        <PricingSection
          prices={prices}
          products={products}
          checkoutAction={checkoutAction}
          lang={typedLang}
        />
      </section>

      {/* FAQ */}
      <section className='py-20 sm:py-24 bg-card border-t border-border'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-3 gap-10 lg:gap-16'>
          <div>
            <Eyebrow>{tr('home.faq.eyebrow')}</Eyebrow>
            <h2 className='mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-foreground'>
              {tr('home.faq.title')}
            </h2>
            <p className='mt-4 text-muted-foreground'>{tr('home.faq.subtitle')}</p>
          </div>
          <Accordion type='single' collapsible className='lg:col-span-2 divide-y divide-border'>
            {FAQS.map((key) => (
              <AccordionItem key={key} value={key} className='border-none'>
                <AccordionTrigger className='py-5 text-left text-base font-semibold hover:no-underline hover:text-primary'>
                  {tr(`home.faq.questions.${key}.question`)}
                </AccordionTrigger>
                <AccordionContent className='pb-5 text-base text-muted-foreground leading-relaxed'>
                  {tr(`home.faq.questions.${key}.answer`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final call to action */}
      <section className='py-20 sm:py-24'>
        <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[#7c3aed] to-[#c0418a] px-6 py-16 sm:px-16 text-center shadow-2xl shadow-primary/25'>
            <div
              aria-hidden
              className='absolute -top-24 -right-24 -z-10 h-72 w-72 rounded-full bg-white/10 blur-2xl'
            />
            <div
              aria-hidden
              className='absolute -bottom-24 -left-24 -z-10 h-72 w-72 rounded-full bg-[#ece862]/20 blur-2xl'
            />
            <h2 className='text-3xl sm:text-5xl font-bold tracking-tight text-white text-balance'>
              {tr('home.cta.title_part1')} {tr('home.cta.title_highlight')}
            </h2>
            <p className='mt-5 text-lg text-white/85 max-w-2xl mx-auto'>
              {tr('home.cta.subtitle_part1')}{' '}
              <span className='font-semibold text-white'>{tr('home.cta.trial_highlight')}</span>{' '}
              {tr('home.cta.subtitle_part2')}
            </p>
            <Button
              asChild
              size='lg'
              className='mt-10 rounded-full bg-white text-primary hover:bg-white/90 h-12 px-8 text-base group'
            >
              <a href='#pricing'>
                {tr('home.cta.button')}
                <ArrowRight className='ml-1 h-5 w-5 transition-transform group-hover:translate-x-0.5' />
              </a>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
