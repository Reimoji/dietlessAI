import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { ArrowRight,
  Brain,
  Leaf,
  MessageSquare,
  Citrus,
  Apple,
  Banana,
  Cherry,
  Grape,
  EggFried,
  Mail,
  CreditCard,
  HelpCircle,
  AlertCircle,
  Clock,
  Settings } from 'lucide-react';
import { Terminal } from './terminal';
import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function HomePage() {
  return (
    <main>
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl font-bold text-foreground tracking-tight sm:text-5xl md:text-6xl">
                Unlock Effortless Nutrition and Achieve a Healthier You with
                <span className="block text-primary">dietlessAI</span>
              </h1>
              <p className="mt-3 text-base text-muted-foreground sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                Personalized Meal Plans That Evolve with Your Lifestyle—No Guesswork, No Strict Rules, Just Sustainable Results
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <a
                  href="https://vercel.com/templates/next.js/next-js-saas-starter"
                  target="_blank"
                >
                  <Button className="bg-background hover:bg-primary text-foreground hover:text-secondary cursor-pointer border border-border rounded-full text-lg px-8 py-4 inline-flex items-center justify-center">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <Terminal />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-20 text-foreground">Why Dietless AI Will Transform the Way You Eat—and Help You Lose Weight Naturally</h2>
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            <div>
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-foreground">
                <Brain className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-foreground">
                Personalized Plans, Tailored to You
                </h2>
                <p className="mt-2 text-base text-muted-foreground">
                Developed with guidance from Erik Orgu, DietlessAI uses advanced technology to tailor your nutrition plan based on your goals, preferences, and lifestyle—no one-size-fits-all diets.
                </p>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-foreground">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-foreground">
                Real-Time Adjustments
                </h2>
                <p className="mt-2 text-base text-muted-foreground">
                Craving something different or going out with friends? Your plan adapts on the spot, so you can still enjoy life while shedding pounds.
                </p>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-foreground">
                <Leaf className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-foreground">
                Built-In Motivation and Support
                </h2>
                <p className="mt-2 text-base text-muted-foreground">
                Get daily tips, hacks and progress nudges that keep you focused on your targets. Dietless AI acts like your personal coach, ready to encourage you at every step.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-20 text-foreground">Science You Can Trust</h2>
            <p className="text-base text-muted-foreground text-center max-w-3xl mx-auto mb-12">Dietless AI is built on a foundation of the most respected and credible nutrition science. It combines insights from evidence-based dietary principles, ensuring every recommendation aligns with proven strategies for weight loss and healthy living. No fads, no guesswork—just reliable guidance for achieving your goals.</p>
            <div className="flex justify-center mb-12">
              <a href="https://vercel.com/templates/next.js/next-js-saas-starter" target="_blank">
                <Button className="bg-background hover:bg-primary text-foreground hover:text-secondary cursor-pointer border border-border rounded-full text-lg px-8 py-4 inline-flex items-center justify-center">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
            </div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Image on left, bullet points on right */}
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Image side */}
            <div className="flex-1">
              <div className="relative w-full aspect-[9/16] max-w-[300px] mx-auto lg:mx-0 shadow-xl rounded-3xl overflow-hidden bg-card">
                <Image
                  src="/dietless-ai-app.png"
                  alt="DietlessAI App Screenshot"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Bullet points side */}
            <div className="flex-1">
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="mt-1 rounded-full bg-primary/10 p-1">
                    <Citrus className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Time-Saving Shopping Lists</h3>
                    <p className="text-muted-foreground">Shop quickly and avoid impulse buys, helping you keep those extra calories at bay</p>
                  </div>
                </li>

                <li className="flex items-start gap-4">
                  <div className="mt-1 rounded-full bg-primary/10 p-1">
                    <Apple className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Expert-Approved Recipes</h3>
                    <p className="text-muted-foreground">Chef-curated meals that taste amazing while keeping you on track for healthy weight loss</p>
                  </div>
                </li>

                <li className="flex items-start gap-4">
                  <div className="mt-1 rounded-full bg-primary/10 p-1">
                    <Cherry className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Family-Friendly Planning</h3>
                    <p className="text-muted-foreground">Use Dietless AI on your own or involve the whole family—everyone gets meal plans tailored to their unique goals</p>
                  </div>
                </li>

                <li className="flex items-start gap-4">
                  <div className="mt-1 rounded-full bg-primary/10 p-1">
                    <Banana className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Flexible Meal Swaps</h3>
                    <p className="text-muted-foreground">Switch out ingredients to suit your cravings, allergies, or time constraints—no more feeling trapped in a rigid diet</p>
                  </div>
                </li>

                <li className="flex items-start gap-4">
                  <div className="mt-1 rounded-full bg-primary/10 p-1">
                    <Grape className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Goal-Focused Insights</h3>
                    <p className="text-muted-foreground">Whether you aim to lose a few pounds or maintain your ideal weight, Dietless AI adapts to keep you moving forward</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Heading and paragraph underneath */}
          <div className="mt-20 w-full">
            <h3 className="text-2xl font-bold text-foreground mb-6">
              Storytime...
            </h3>
            <p className="text-muted-foreground text-base mb-6">
              You're juggling long work hours, family responsibilities, and maybe a workout or two—only to realize your eating habits are all over the place.
              You want to feel healthier, perhaps lose a bit of weight, but conflicting advice and busy schedules keep you stuck.
              Following rigid meal plans feels overwhelming, and those fad diets never seem to fit into your real life.
            </p>
            <p className="text-muted-foreground text-base">
              Enter <strong>Dietless AI</strong> - an app inspired by years of experience from a leading nutritionist, Erik Orgu and his work of helping people
              overcome the same struggles you face today. Dietless AI is designed to simplify nutrition, learn your tastes, and adapt to your daily routine,
              giving you the expert guidance you need to build a healthier, more balanced lifestyle.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16 text-foreground">
            What Our Users Say
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* First Testimonial */}
            <div className="bg-card p-6 rounded-xl shadow-md">
              <div className="mb-4">
                <h4 className="font-semibold text-foreground">Mark D.</h4>
                <p className="text-sm text-muted-foreground">Entrepreneur</p>
              </div>
              <p className="text-muted-foreground">
                "The grocery list feature alone saves me so much time. Plus, I'm finally seeing real results on the scale. Dietless AI is a game-changer!"
              </p>
            </div>

            {/* Second Testimonial */}
            <div className="bg-card p-6 rounded-xl shadow-md">
              <div className="mb-4">
                <h4 className="font-semibold text-foreground">Jamie L.</h4>
                <p className="text-sm text-muted-foreground">Full-Time Student</p>
              </div>
              <p className="text-muted-foreground">
                "It's so nice having a plan that adapts when I go out to eat or have a change in schedule. Dietless AI takes away the guilt and keeps me moving forward."
              </p>
            </div>

            {/* Third Testimonial */}
            <div className="bg-card p-6 rounded-xl shadow-md">
              <div className="mb-4">
                <h4 className="font-semibold text-foreground">Taylor K.</h4>
                <p className="text-sm text-muted-foreground">Busy Parent</p>
              </div>
              <p className="text-muted-foreground">
                "No more guesswork! The app's smart suggestions have helped me maintain a balanced diet without feeling like I'm missing out on anything."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16 text-foreground">
            Frequently Asked Questions
          </h2>

          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="bg-card rounded-lg overflow-hidden border-none shadow-sm">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary">
                    <HelpCircle className="h-4 w-4" />
                  </div>
                  <span className="font-medium">How does DietlessAI work?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 text-muted-foreground">
              DietlessAI uses advanced artificial intelligence to analyze your preferences, dietary requirements, and goals. It then creates personalized nutrition plans and provides real-time advice to help you achieve optimal health and wellness.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="bg-card rounded-lg overflow-hidden border-none shadow-sm">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary">
                    <Clock className="h-4 w-4" />
                  </div>
                  <span className="font-medium">What makes Dietless AI different from other nutrition apps?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 text-muted-foreground">
                Dietless AI adapts to your day-to-day routine, offering real-life solutions instead of rigid rules. Whether you’re on the go or making a home-cooked meal, the app adjusts to your lifestyle.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="bg-card rounded-lg overflow-hidden border-none shadow-sm">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <span className="font-medium">Is Dietless AI suitable for specific dietary needs?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 text-muted-foreground">
                Absolutely. Whether you’re gluten-free, vegan, or focusing on moderate weight management, Dietless AI personalizes plans to fit your unique requirements.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="bg-card rounded-lg overflow-hidden border-none shadow-sm">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <span className="font-medium">How often does the app update my meal plan?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 text-muted-foreground">
                Dietless AI monitors your progress and can update recommendations daily. It ensures your plan remains relevant, flexible, and aligned with your goals.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="bg-card rounded-lg overflow-hidden border-none shadow-sm">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <span className="font-medium">Can I cancel my subscription at any time?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 text-muted-foreground">
              You can cancel your subscription at any time with no long-term commitments. If you cancel, you will continue to have access to DietlessAI until the end of your current billing period
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="bg-card rounded-lg overflow-hidden border-none shadow-sm">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary">
                    <Mail className="h-4 w-4" />
                  </div>
                  <span className="font-medium">How accurate is the AI nutrition advice?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 text-muted-foreground">
              Our AI is trained on extensive, up-to-date nutrition data and provides evidence-based recommendations. While highly accurate for general nutrition advice, we always recommend consulting with healthcare professionals for specific medical conditions or concerns.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7" className="bg-card rounded-lg overflow-hidden border-none shadow-sm">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary">
                    <Settings className="h-4 w-4" />
                  </div>
                  <span className="font-medium">What makes Dietless AI reliable?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 text-muted-foreground">
              Dietless AI is built on a foundation of rigorously researched, science-based nutrition principles. Its recommendations are informed by the most trusted insights in the field of nutrition, ensuring that your personalized plan is both effective and sustainable. Whether your goal is weight loss, maintaining your current weight, or simply eating healthier, you can feel confident that Dietless AI is designed to deliver evidence-backed results.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-b from-background to-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          {/* Decorative elements */}
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl opacity-70 -z-10"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl opacity-70 -z-10"></div>

          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">
            Take the First Step Toward<br />
            <span className="relative inline-block">
              <span className="relative z-10">Effortless Nutrition</span>
              <span className="absolute bottom-2 left-0 w-full h-3 bg-primary/20 -z-10 rounded-full"></span>
            </span>
          </h2>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start Your <span className="bg-primary text-primary-foreground opacity-75 px-1 py-0.5 rounded-sm font-medium">Free 7-Day Trial</span> and Discover the Simplicity of Dietless AI Today
          </p>

          <a href="#" className="inline-block">
            <Button
              className="bg-background hover:bg-primary text-foreground hover:text-secondary cursor-pointer border border-border rounded-full text-lg px-8 py-4 inline-flex items-center justify-center group"
            >
              GET STARTED!
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <section className="py-16 bg-card border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Newsletter Subscription with Animation */}
          <div className="mb-16 p-8 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl border border-primary/10 relative overflow-hidden group">
            {/* Animated elements */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/10 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-1000 ease-in-out"></div>
            <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-primary/10 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-1000 ease-in-out delay-100"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-1000 ease-in-out scale-0 group-hover:scale-100"></div>

            <div className="max-w-3xl mx-auto text-center relative z-10">
              <h3 className="text-2xl font-bold mb-4 group-hover:scale-105 transition-transform duration-300">Stay Updated with DietlessAI</h3>
              <p className="text-muted-foreground mb-6">Get the latest nutrition tips, recipes, and updates delivered straight to your inbox.</p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 rounded-full px-4 py-4 h-auto border-primary/20 focus-visible:ring-primary group-hover:shadow-lg group-hover:shadow-primary/10 transition-all duration-300"
                />
                <Button
                  className="bg-primary hover:bg-primary/80 text-primary-foreground rounded-full px-5 py-2 h-auto group-hover:shadow-lg group-hover:shadow-primary/20 transition-all duration-300 relative overflow-hidden cursor-pointer"
                  style={{ minHeight: '44px' }}
                >
                  <span className="relative z-10 flex items-center">Subscribe
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                  <span className="absolute inset-0 bg-primary/90 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></span>
                </Button>
              </div>
            </div>
          </div>

          {/* Footer Content - Simplified */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Column 1: Logo & About */}
            <div className="space-y-4">
              <div className="flex items-center">
                <EggFried className="h-6 w-6 text-primary" />
                <span className="ml-2 text-xl font-bold">DietlessAI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Personalized Meal Plans That Evolve with Your Lifestyle—No Guesswork, No Strict Rules, Just Sustainable Results
              </p>
              <div className="flex space-x-4 pt-4">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors hover:scale-110 transform duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors hover:scale-110 transform duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors hover:scale-110 transform duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors hover:scale-110 transform duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                </a>
              </div>
            </div>

            {/* Column 2: About */}
            <div className="flex flex-col items-end justify-end h-full">
              <div className="flex space-x-6">
                <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200">Privacy Policy</a>
                <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200">Terms of Service</a>
                <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200">Cookie Policy</a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              © 2025 DietlessAI. All rights reserved.
            </p>
          </div>
        </div>
      </section>

    </main>
  );
}