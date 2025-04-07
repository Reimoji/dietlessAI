import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { ArrowRight, Brain, Leaf, MessageSquare, Check, Citrus, Apple, Banana, Cherry, Grape, EggFried, Mail } from 'lucide-react';
import { Terminal } from './terminal';
import Image from 'next/image';

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

      <section className="py-16 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <div className="flex items-center mb-4">
                <EggFried className="h-6 w-6 " />
                <span className="ml-2 text-3xl font-bold">DietlessAI</span>
              </div>
              <p className="mt-3 max-w-3xl text-lg text-muted-foreground">
              Personalized Meal Plans That Evolve with Your Lifestyle
              </p>
            </div>
            <div className="mt-8 lg:mt-0 flex justify-center lg:justify-end">
              <a href="#" target="_blank">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer rounded-full text-xl px-12 py-6 inline-flex items-center justify-center">
                  Subscribe to newsletter
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-secondary-foreground/10 text-center text-medium text-secondary-foreground/40">
          © 2025 DietlessAI. All rights reserved.
        </div>
      </section>
      
    </main>
  );
}