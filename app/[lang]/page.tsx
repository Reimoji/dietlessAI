import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { PricingSection } from '@/components/ui/pricing-section';
import { checkoutAction } from '@/lib/payments/actions';
import { getStripePrices, getStripeProducts } from '@/lib/payments/stripe';
import {
  AlertCircle,
  Apple,
  ArrowRight,
  Banana,
  Brain,
  Cherry,
  Citrus,
  Clock,
  CreditCard,
  Grape,
  HelpCircle,
  Leaf,
  Mail,
  MessageSquare,
  Settings,
} from 'lucide-react';
import { Terminal } from '@/components/ui/terminal';
import Footer from '@/components/layout/Footer';
import Image from "next/image";

// Prices are fresh for one hour max
export const revalidate = 3600;

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  // Extract lang from async params
  const { lang } = await params;
  const [prices, products] = await Promise.all([getStripePrices(), getStripeProducts()]);
  return (
    <main>
      <div className='overflow-x-hidden w-full'>
        <section
          className='py-20 relative overflow-hidden'
          style={{
            position: 'relative',
            backgroundColor: 'var(--background)', // Keep original background
          }}
        >
          {/* Gradient background with pseudo-element style approach */}
          <div
            style={{
              content: '""',
              position: 'absolute',
              inset: 0,
              zIndex: 0,
              pointerEvents: 'none',
              backgroundImage: `
                /* Purple/Blue blob - top left: position (20% 0%), color (124, 128, 240), opacity (1), size (25%) */
                radial-gradient(circle at 20% 0%, rgba(124, 128, 240, 1) 0%, rgba(124, 128, 240, 0) 25%),

                /* Yellow blob - bottom left: position (29% 80%), color (236, 232, 98), opacity (0.9), size (35%) */
                radial-gradient(circle at 29% 80%, rgba(236, 232, 98, 0.9) 0%, rgba(236, 232, 98, 0) 35%),

                /* Pink blob - right side: position (92% 40%), color (236, 98, 171), opacity (0.85), size (27%) */
                radial-gradient(circle at 92% 40%, rgba(236, 98, 171, 0.85) 0%, rgba(236, 98, 171, 0) 27%),

                /* Blue blob - bottom right: position (80% 94%), color (124, 128, 240), opacity (0.8), size (21%) */
                radial-gradient(circle at 80% 94%, rgba(124, 128, 240, 0.8) 0%, rgba(124, 128, 240, 0) 21%),

                /* Yellow blob - top center: position (43% 8%), color (236, 232, 98), opacity (0.7), size (29%) */
                radial-gradient(circle at 43% 8%, rgba(236, 232, 98, 0.7) 0%, rgba(236, 232, 98, 0) 29%)
              `,
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
              opacity: 0.9,
              filter: 'blur(1px)', // Optional: add some blur if desired
            }}
          />

          {/* Content container */}
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
            <div className='lg:grid lg:grid-cols-12 lg:gap-8'>
              <div className='sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left'>
                <h1 className='text-4xl font-bold text-foreground tracking-tight sm:text-5xl md:text-6xl'>
                  Unlock Effortless Nutrition and Achieve a Healthier You with
                  <span className='block text-primary'>dietlessAI</span>
                </h1>
                <p className='mt-3 text-base text-muted-foreground sm:mt-5 sm:text-xl lg:text-lg xl:text-xl'>
                  Personalized Meal Plans That Evolve with Your Lifestyle—No Guesswork, No Strict
                  Rules, Just Sustainable Results
                </p>
                <div className='mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0'>
                  <a href='#pricing'>
                    <Button className='bg-background hover:bg-primary text-foreground hover:text-secondary cursor-pointer border border-border rounded-full text-lg px-8 py-4 inline-flex items-center justify-center'>
                      Get Started
                      <ArrowRight className='ml-2 h-5 w-5' />
                    </Button>
                  </a>
                </div>
              </div>
              <div className='mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center'>
                <Terminal />
              </div>
            </div>
          </div>
        </section>

        <section className='py-16 bg-background w-full'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <h2 className='text-3xl font-bold text-center mb-20 text-foreground'>
              Why Dietless AI Will Transform the Way You Eat—and Help You Lose Weight Naturally
            </h2>
            <div className='lg:grid lg:grid-cols-3 lg:gap-8'>
              <div className='z-20'>
                <div className='flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-foreground '>
                  <Brain className='h-6 w-6' />
                </div>
                <div className='mt-5'>
                  <h2 className='text-lg font-medium text-foreground'>
                    Personalized Plans, Tailored to You
                  </h2>
                  <p className='mt-2 text-base text-muted-foreground'>
                    Developed with guidance from Erik, DietlessAI uses advanced technology to tailor
                    your nutrition plan based on your goals, preferences, and lifestyle—no
                    one-size-fits-all diets.
                  </p>
                </div>
              </div>

              <div className='mt-10 lg:mt-0'>
                <div className='flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-foreground'>
                  <MessageSquare className='h-6 w-6' />
                </div>
                <div className='mt-5'>
                  <h2 className='text-lg font-medium text-foreground'>Real-Time Adjustments</h2>
                  <p className='mt-2 text-base text-muted-foreground'>
                    Craving something different or going out with friends? Your plan adapts on the
                    spot, so you can still enjoy life while shedding pounds.
                  </p>
                </div>
              </div>

              <div className='mt-10 lg:mt-0'>
                <div className='flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-foreground'>
                  <Leaf className='h-6 w-6' />
                </div>
                <div className='mt-5'>
                  <h2 className='text-lg font-medium text-foreground'>
                    Built-In Motivation and Support
                  </h2>
                  <p className='mt-2 text-base text-muted-foreground'>
                    Get daily tips, hacks and progress nudges that keep you focused on your targets.
                    Dietless AI acts like your personal coach, ready to encourage you at every step.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Science You Can Trust Section */}
        <section className='py-16 bg-background w-full relative'>
          {/* Gradient background for Science section - positioned absolutely to the viewport */}
          <div
            style={{
              position: 'absolute',
              top: '-30vh',
              left: '-30vw',
              right: '-30vw',
              bottom: '-50vh',
              zIndex: 0,
              pointerEvents: 'none',
              backgroundImage: `
                /* Pink blob - top right: position (36% 15%), color (236, 98, 171), opacity (0.7), size (6%) */
                radial-gradient(circle at 36% 15%, rgba(236, 98, 171, 0.7) 0%, rgba(236, 98, 171, 0) 6%),
                
                /* Pink blob - bottom left: position (17% 27%), color (236, 98, 171), opacity (0.75), size (5%) */
                radial-gradient(circle at 17% 27%, rgba(236, 98, 171, 0.75) 0%, rgba(236, 98, 171, 0) 5%),

                /* Blue blob - bottom left: position (7% 20%), color (124, 128, 240), opacity (0.8), size (9%) */
                radial-gradient(circle at 7% 20%, rgba(124, 128, 240, 0.8) 0%, rgba(124, 128, 240, 0) 9%),

                /* Yellow blob - center: position (34% 27%), color (236, 232, 98), opacity (0.8), size (7%) */
                radial-gradient(circle at 34% 27%, rgba(236, 232, 98, 0.8) 0%, rgba(236, 232, 98, 0) 7%),
                
                /* Transition blob to next section: position (50% 100%), color (124, 128, 240), opacity (0.6), size (40%) */
                radial-gradient(circle at 50% 100%, rgba(124, 128, 240, 0.6) 0%, rgba(124, 128, 240, 0) 40%)
              `,
              backgroundRepeat: 'no-repeat',
              backgroundSize: '200% 200%',
              opacity: 0.9,
              filter: 'blur(30px)',
            }}
          />
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
            <h2 className='text-3xl font-bold text-center mb-20 text-foreground'>
              Science You Can Trust
            </h2>
            <p className='text-base text-muted-foreground text-center max-w-3xl mx-auto mb-12'>
              Dietless AI is built on a foundation of the most respected and credible nutrition
              science. It combines insights from evidence-based dietary principles, ensuring every
              recommendation aligns with proven strategies for weight loss and healthy living. No
              fads, no guesswork—just reliable guidance for achieving your goals.
            </p>
            <div className='flex justify-center mb-12'>
              <a href='#pricing'>
                <Button className='bg-background hover:bg-primary text-foreground hover:text-secondary cursor-pointer border border-border rounded-full text-lg px-8 py-4 inline-flex items-center justify-center'>
                  Get Started
                  <ArrowRight className='ml-2 h-5 w-5' />
                </Button>
              </a>
            </div>
          </div>
        </section>

        <section className='py-24 bg-background'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            {/* Image on left, bullet points on right */}
            <div className='flex flex-col lg:flex-row items-center gap-12'>
              {/* Image side */}
              <div className='flex-1 flex justify-center items-center'>
                <div className='relative w-full aspect-[9/16] max-w-[380px] mx-auto lg:mx-0'>
                  <Image
                    src="/images/dietlessai_screenshot.png"
                    alt="DietlessAI App Screenshot"
                    width={380}
                    height={700}
                    className="w-full h-auto object-cover"
                    style={{
                      filter:
                        "drop-shadow(0 10px 15px rgba(0, 0, 0, 0.3)) drop-shadow(-8px 15px 15px rgba(0, 0, 0, 0.2))",
                      transform: "perspective(1000px) rotateY(2deg)",
                    }}
                  />
                </div>
              </div>

              {/* Bullet points side */}
              <div className='flex-1'>
                <ul className='space-y-6'>
                  <li className='flex items-start gap-4'>
                    <div className='mt-1 rounded-full bg-primary/10 p-1'>
                      <Citrus className='h-7 w-7 text-primary' />
                    </div>
                    <div>
                      <h3 className='font-medium text-foreground'>Time-Saving Shopping Lists</h3>
                      <p className='text-muted-foreground'>
                        Shop quickly and avoid impulse buys, helping you keep those extra calories
                        at bay
                      </p>
                    </div>
                  </li>

                  <li className='flex items-start gap-4'>
                    <div className='mt-1 rounded-full bg-primary/10 p-1'>
                      <Apple className='h-7 w-7 text-primary' />
                    </div>
                    <div>
                      <h3 className='font-medium text-foreground'>Expert-Approved Recipes</h3>
                      <p className='text-muted-foreground'>
                        Chef-curated meals that taste amazing while keeping you on track for healthy
                        weight loss
                      </p>
                    </div>
                  </li>

                  <li className='flex items-start gap-4'>
                    <div className='mt-1 rounded-full bg-primary/10 p-1'>
                      <Cherry className='h-7 w-7 text-primary' />
                    </div>
                    <div>
                      <h3 className='font-medium text-foreground'>Family-Friendly Planning</h3>
                      <p className='text-muted-foreground'>
                        Use Dietless AI on your own or involve the whole family—everyone gets meal
                        plans tailored to their unique goals
                      </p>
                    </div>
                  </li>

                  <li className='flex items-start gap-4'>
                    <div className='mt-1 rounded-full bg-primary/10 p-1'>
                      <Banana className='h-7 w-7 text-primary' />
                    </div>
                    <div>
                      <h3 className='font-medium text-foreground'>Flexible Meal Swaps</h3>
                      <p className='text-muted-foreground'>
                        Switch out ingredients to suit your cravings, allergies, or time
                        constraints—no more feeling trapped in a rigid diet
                      </p>
                    </div>
                  </li>

                  <li className='flex items-start gap-4'>
                    <div className='mt-1 rounded-full bg-primary/10 p-1'>
                      <Grape className='h-7 w-7 text-primary' />
                    </div>
                    <div>
                      <h3 className='font-medium text-foreground'>Goal-Focused Insights</h3>
                      <p className='text-muted-foreground'>
                        Whether you aim to lose a few pounds or maintain your ideal weight, Dietless
                        AI adapts to keep you moving forward
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Heading and paragraph underneath */}
            <div className='mt-20 w-full'>
              <h3 className='text-2xl font-bold text-foreground mb-6'>Storytime...</h3>
              <p className='text-muted-foreground text-base mb-6'>
                You're juggling long work hours, family responsibilities, and maybe a workout or
                two—only to realize your eating habits are all over the place. You want to feel
                healthier, perhaps lose a bit of weight, but conflicting advice and busy schedules
                keep you stuck. Following rigid meal plans feels overwhelming, and those fad diets
                never seem to fit into your real life.
              </p>
              <p className='text-muted-foreground text-base'>
                Enter <strong>Dietless AI</strong> - an app inspired by years of experience from a
                leading nutritionist, Erik and his work of helping people overcome the same
                struggles you face today. Dietless AI is designed to simplify nutrition, learn your
                tastes, and adapt to your daily routine, giving you the expert guidance you need to
                build a healthier, more balanced lifestyle.
              </p>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className='py-24 bg-background relative z-10 overflow-visible'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <h2 className='text-3xl font-bold text-center mb-16 text-foreground'>
              What Our Users Say
            </h2>

            {/* Testimonials grid */}
            <div className='grid md:grid-cols-3 gap-8'>
              {/* First Testimonial */}
              <GlowingEffect
                disabled={false}
                spread={50}
                blur={10}
                glow={true}
                variant='default'
                borderWidth={6}
                proximity={50}
                inactiveZone={0} // No inactive zone - always active
                movementDuration={2} // Faster movement
              >
                <div className='bg-card p-6 rounded-xl shadow-md relative z-20 h-full'>
                  <div className='mb-4'>
                    <h4 className='font-semibold text-foreground'>Mark D.</h4>
                    <p className='text-sm text-muted-foreground'>Entrepreneur</p>
                  </div>
                  <p className='text-muted-foreground'>
                    "The grocery list feature alone saves me so much time. Plus, I'm finally seeing
                    real results on the scale. Dietless AI is a game-changer!"
                  </p>
                </div>
              </GlowingEffect>

              {/* Second Testimonial */}
              <GlowingEffect
                disabled={false}
                spread={50}
                blur={10}
                glow={true}
                variant='default'
                borderWidth={6}
                proximity={50}
                inactiveZone={0} // No inactive zone - always active
                movementDuration={2} // Faster movement
              >
                <div className='bg-card p-6 rounded-xl shadow-md relative z-20 h-full'>
                  <div className='mb-4'>
                    <h4 className='font-semibold text-foreground'>Jamie L.</h4>
                    <p className='text-sm text-muted-foreground'>Full-Time Student</p>
                  </div>
                  <p className='text-muted-foreground'>
                    "It's so nice having a plan that adapts when I go out to eat or have a change in
                    schedule. Dietless AI takes away the guilt and keeps me moving forward."
                  </p>
                </div>
              </GlowingEffect>

              {/* Third Testimonial */}
              <GlowingEffect
                disabled={false}
                spread={50}
                blur={10}
                glow={true}
                variant='default'
                borderWidth={6}
                proximity={50}
                inactiveZone={0} // No inactive zone - always active
                movementDuration={2} // Faster movement
              >
                <div className='bg-card p-6 rounded-xl shadow-md relative z-20 h-full'>
                  <div className='mb-4'>
                    <h4 className='font-semibold text-foreground'>Taylor K.</h4>
                    <p className='text-sm text-muted-foreground'>Busy Parent</p>
                  </div>
                  <p className='text-muted-foreground'>
                    "No more guesswork! The app's smart suggestions have helped me maintain a
                    balanced diet without feeling like I'm missing out on anything."
                  </p>
                </div>
              </GlowingEffect>
            </div>
          </div>

          {/* Add a connector blob between testimonials and pricing */}
          <div
            style={{
              position: 'absolute',
              bottom: '-150px',
              left: 0,
              right: 0,
              height: '300px',
              zIndex: 15,
              pointerEvents: 'none',
              backgroundImage: `
                radial-gradient(circle at 50% 100%, rgba(124, 128, 240, 0.9) 0%, rgba(124, 128, 240, 0) 35%)
              `,
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
              opacity: 0.8,
              filter: 'blur(60px)',
            }}
          />
        </section>

        {/* Pricing Section */}
        <section id='pricing' className='py-24 bg-background relative'>
          <div className='relative w-full'>
            <PricingSection 
              prices={prices} 
              products={products} 
              checkoutAction={checkoutAction} 
              lang={lang}
            />
          </div>
        </section>

        {/* FAQ Section */}
        <section className='py-24 bg-background relative'>
          {/* Gradient background for FAQ section */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 0,
              pointerEvents: 'none',
              backgroundImage: `
                /* Yellow blob - top left: position (40% 65%), color (236, 232, 98), opacity (0.95), size (14%) */
                radial-gradient(circle at 40% 65%, rgba(236, 232, 98, 0.95) 0%, rgba(236, 232, 98, 0) 14%),

                /* Pink blob - bottom right: position (80% 50%), color (236, 98, 171), opacity (0.9), size (10%) */
                radial-gradient(circle at 80% 50%, rgba(236, 98, 171, 0.9) 0%, rgba(236, 98, 171, 0) 10%),

                /* Blue blob - center right: position (12% 78%), color (124, 128, 240), opacity (0.8), size (12%) */
                radial-gradient(circle at 12% 78%, rgba(124, 128, 240, 0.8) 0%, rgba(124, 128, 240, 0) 12%)
              `,
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
              opacity: 0.75,
              filter: 'blur(10px)',
            }}
          />
          <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
            <h2 className='text-3xl font-bold text-center mb-16 text-foreground'>
              Frequently Asked Questions
            </h2>

            <Accordion type='single' collapsible className='space-y-4'>
              <AccordionItem
                value='item-1'
                className='bg-card rounded-lg overflow-hidden border-none shadow-sm'
              >
                <AccordionTrigger className='px-6 py-4 hover:no-underline'>
                  <div className='flex items-center gap-4'>
                    <div className='flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary'>
                      <HelpCircle className='h-4 w-4' />
                    </div>
                    <span className='font-medium'>How does DietlessAI work?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className='px-6 text-muted-foreground'>
                  DietlessAI uses advanced artificial intelligence to analyze your preferences,
                  dietary requirements, and goals. It then creates personalized nutrition plans and
                  provides real-time advice to help you achieve optimal health and wellness.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value='item-2'
                className='bg-card rounded-lg overflow-hidden border-none shadow-sm'
              >
                <AccordionTrigger className='px-6 py-4 hover:no-underline'>
                  <div className='flex items-center gap-4'>
                    <div className='flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary'>
                      <Clock className='h-4 w-4' />
                    </div>
                    <span className='font-medium'>
                      What makes Dietless AI different from other nutrition apps?
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className='px-6 text-muted-foreground'>
                  Dietless AI adapts to your day-to-day routine, offering real-life solutions
                  instead of rigid rules. Whether you’re on the go or making a home-cooked meal, the
                  app adjusts to your lifestyle.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value='item-3'
                className='bg-card rounded-lg overflow-hidden border-none shadow-sm'
              >
                <AccordionTrigger className='px-6 py-4 hover:no-underline'>
                  <div className='flex items-center gap-4'>
                    <div className='flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary'>
                      <AlertCircle className='h-4 w-4' />
                    </div>
                    <span className='font-medium'>
                      Is Dietless AI suitable for specific dietary needs?
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className='px-6 text-muted-foreground'>
                  Absolutely. Whether you’re gluten-free, vegan, or focusing on moderate weight
                  management, Dietless AI personalizes plans to fit your unique requirements.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value='item-4'
                className='bg-card rounded-lg overflow-hidden border-none shadow-sm'
              >
                <AccordionTrigger className='px-6 py-4 hover:no-underline'>
                  <div className='flex items-center gap-4'>
                    <div className='flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary'>
                      <CreditCard className='h-4 w-4' />
                    </div>
                    <span className='font-medium'>How often does the app update my meal plan?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className='px-6 text-muted-foreground'>
                  Dietless AI monitors your progress and can update recommendations daily. It
                  ensures your plan remains relevant, flexible, and aligned with your goals.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value='item-5'
                className='bg-card rounded-lg overflow-hidden border-none shadow-sm'
              >
                <AccordionTrigger className='px-6 py-4 hover:no-underline'>
                  <div className='flex items-center gap-4'>
                    <div className='flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary'>
                      <CreditCard className='h-4 w-4' />
                    </div>
                    <span className='font-medium'>Can I cancel my subscription at any time?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className='px-6 text-muted-foreground'>
                  You can cancel your subscription at any time with no long-term commitments. If you
                  cancel, you will continue to have access to DietlessAI until the end of your
                  current billing period
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value='item-6'
                className='bg-card rounded-lg overflow-hidden border-none shadow-sm'
              >
                <AccordionTrigger className='px-6 py-4 hover:no-underline'>
                  <div className='flex items-center gap-4'>
                    <div className='flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary'>
                      <Mail className='h-4 w-4' />
                    </div>
                    <span className='font-medium'>How accurate is the AI nutrition advice?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className='px-6 text-muted-foreground'>
                  Our AI is trained on extensive, up-to-date nutrition data and provides
                  evidence-based recommendations. While highly accurate for general nutrition
                  advice, we always recommend consulting with healthcare professionals for specific
                  medical conditions or concerns.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value='item-7'
                className='bg-card rounded-lg overflow-hidden border-none shadow-sm'
              >
                <AccordionTrigger className='px-6 py-4 hover:no-underline'>
                  <div className='flex items-center gap-4'>
                    <div className='flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary'>
                      <Settings className='h-4 w-4' />
                    </div>
                    <span className='font-medium'>What makes Dietless AI reliable?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className='px-6 text-muted-foreground'>
                  Dietless AI is built on a foundation of rigorously researched, science-based
                  nutrition principles. Its recommendations are informed by the most trusted
                  insights in the field of nutrition, ensuring that your personalized plan is both
                  effective and sustainable. Whether your goal is weight loss, maintaining your
                  current weight, or simply eating healthier, you can feel confident that Dietless
                  AI is designed to deliver evidence-backed results.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className='py-20 bg-gradient-to-b from-background to-card'>
          <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative'>
            {/* Decorative elements */}
            <div className='absolute top-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl opacity-70 -z-10'></div>
            <div className='absolute bottom-0 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl opacity-70 -z-10'></div>

            <h2 className='text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight'>
              Take the First Step Toward
              <br />
              <span className='relative inline-block'>
                <span className='relative z-10'>Effortless Nutrition</span>
                <span className='absolute bottom-2 left-0 w-full h-3 bg-primary/20 -z-10 rounded-full'></span>
              </span>
            </h2>

            <p className='text-xl text-muted-foreground mb-8 max-w-2xl mx-auto'>
              Start Your{' '}
              <span className='bg-primary text-primary-foreground opacity-75 px-1 py-0.5 rounded-sm font-medium'>
                Free 2-Day Trial
              </span>{' '}
              and Discover the Simplicity of Dietless AI Today
            </p>

            <a href='#' className='inline-block'>
              <Button className='bg-background hover:bg-primary text-foreground hover:text-secondary cursor-pointer border border-border rounded-full text-lg px-8 py-4 inline-flex items-center justify-center group'>
                GET STARTED!
                <ArrowRight className='ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300' />
              </Button>
            </a>
          </div>
        </section>

        {/* Footer */}
              <Footer />
      </div>
    </main>
  );
}
