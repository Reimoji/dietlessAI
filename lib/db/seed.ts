import { hashPassword } from '@/lib/auth/session';
import { demoTrialFields, isDemoMode } from '@/lib/demo';
import { eq } from 'drizzle-orm';
import { stripe } from '../payments/stripe';
import { db } from './drizzle';
import { teamMembers, teams, users } from './schema';

async function createStripeProducts() {
  console.log('Creating Stripe products and prices...');

  // Create Monthly product
  const monthlyProduct = await stripe.products.create({
    name: 'DietlessAI – Monthly',
    description: 'Monthly subscription plan',
  });

  await stripe.prices.create({
    product: monthlyProduct.id,
    unit_amount: 990, // 9.90€ in cents
    currency: 'eur',
    recurring: {
      interval: 'month',
      trial_period_days: 2,
    },
  });

  // Create Yearly product
  const yearlyProduct = await stripe.products.create({
    name: 'DietlessAI - Yearly',
    description: 'Annual subscription plan',
  });

  await stripe.prices.create({
    product: yearlyProduct.id,
    unit_amount: 8990, // 89.90€ in cents
    currency: 'eur',
    recurring: {
      interval: 'year',
      trial_period_days: 2,
    },
  });

  console.log('Stripe products and prices created successfully.');
}

async function seed() {
  const email = 'test@test.com';
  const password = 'admin123';
  const passwordHash = await hashPassword(password);

  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    console.log(`Seed user ${email} already exists, skipping.`);
    return;
  }

  const [user] = await db
    .insert(users)
    .values([
      {
        email: email,
        passwordHash: passwordHash,
        role: 'owner',
      },
    ])
    .returning();

  console.log('Initial user created.');

  const [team] = await db
    .insert(teams)
    .values({
      name: 'Test Team',
      ...(isDemoMode ? demoTrialFields() : {}),
    })
    .returning();

  await db.insert(teamMembers).values({
    teamId: team.id,
    userId: user.id,
    role: 'owner',
  });

  if (isDemoMode) {
    console.log('Demo mode: skipping Stripe product creation.');
  } else {
    await createStripeProducts();
  }
}

seed()
  .catch((error) => {
    console.error('Seed process failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Seed process finished. Exiting...');
    process.exit(0);
  });
