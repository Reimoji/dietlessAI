# DietlessAI

## Demo deployment (no domain, no Stripe)

The app runs in **demo mode** when `DEMO_MODE=true` (or when `STRIPE_SECRET_KEY` is unset):
pricing comes from static plans, "Subscribe" instantly grants a 30-day trial instead of
charging a card, every new sign-up can chat right away, and emails are only logged.

Quickest way to get a public demo URL (free tiers, `*.vercel.app` address):

1. **Vercel**: *Add New → Project → Import* `Reimoji/dietlessAI` (framework: Next.js, pnpm is auto-detected).
2. **Database**: in the Vercel project, *Storage → Create → Neon (Postgres)* and connect it.
   It sets `DATABASE_URL` automatically, which the app accepts.
3. **Environment variables** (Project → Settings → Environment Variables):
   - `DEMO_MODE` = `true`
   - `AUTH_SECRET` = any random string (`openssl rand -hex 32`)
   - `OPENAI_API_KEY` = your OpenAI key (without it the site works but the chat replies with an error)
   - `BASE_URL` = the `https://<project>.vercel.app` URL (optional in demo mode)
   - `OPENAI_MODEL` = optional, defaults to `gpt-4.1-2025-04-14`
4. **Create the tables and demo user** once, from your machine, using the Neon connection string:
   ```bash
   POSTGRES_URL="<neon connection string>" DEMO_MODE=true pnpm db:migrate
   POSTGRES_URL="<neon connection string>" DEMO_MODE=true pnpm db:seed
   ```
   Demo login: `test@test.com` / `admin123` (visitors can also sign up themselves).
5. Redeploy. Done.

Running the demo locally: `docker compose up -d`, then put
`POSTGRES_URL=postgres://postgres:postgres@localhost:54322/postgres`, `AUTH_SECRET=...` and
`DEMO_MODE=true` in `.env`, run `pnpm db:migrate && pnpm db:seed && pnpm dev`.

---

# Next.js SaaS Starter

This is a starter template for building a SaaS application using **Next.js** with support for authentication, Stripe integration for payments, and a dashboard for logged-in users.

**Demo: [https://next-saas-start.vercel.app/](https://next-saas-start.vercel.app/)**

## Features

- Marketing landing page (`/`) with animated Terminal element
- Pricing page (`/pricing`) which connects to Stripe Checkout
- Dashboard pages with CRUD operations on users/teams
- Basic RBAC with Owner and Member roles
- Subscription management with Stripe Customer Portal
- Email/password authentication with JWTs stored to cookies
- Global middleware to protect logged-in routes
- Local middleware to protect Server Actions or validate Zod schemas
- Activity logging system for any user events

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Database**: [Postgres](https://www.postgresql.org/)
- **ORM**: [Drizzle](https://orm.drizzle.team/)
- **Payments**: [Stripe](https://stripe.com/)
- **UI Library**: [shadcn/ui](https://ui.shadcn.com/)

## Getting Started

```bash
git clone https://github.com/nextjs/saas-starter
cd saas-starter
pnpm install
```

## Running Locally

Use the included setup script to create your `.env` file:

```bash
pnpm db:setup
```

Then, run the database migrations and seed the database with a default user and team:

```bash
pnpm db:migrate
pnpm db:seed
```

This will create the following user and team:

- User: `test@test.com`
- Password: `admin123`

You can, of course, create new users as well through `/sign-up`.

Finally, run the Next.js development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app in action.

Optionally, you can listen for Stripe webhooks locally through their CLI to handle subscription change events:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Testing Payments

To test Stripe payments, use the following test card details:

- Card Number: `4242 4242 4242 4242`
- Expiration: Any future date
- CVC: Any 3-digit number

## Going to Production

When you're ready to deploy your SaaS application to production, follow these steps:

### Set up a production Stripe webhook

1. Go to the Stripe Dashboard and create a new webhook for your production environment.
2. Set the endpoint URL to your production API route (e.g., `https://yourdomain.com/api/stripe/webhook`).
3. Select the events you want to listen for (e.g., `checkout.session.completed`, `customer.subscription.updated`).

### Deploy to Vercel

1. Push your code to a GitHub repository.
2. Connect your repository to [Vercel](https://vercel.com/) and deploy it.
3. Follow the Vercel deployment process, which will guide you through setting up your project.

### Add environment variables

In your Vercel project settings (or during deployment), add all the necessary environment variables. Make sure to update the values for the production environment, including:

1. `BASE_URL`: Set this to your production domain.
2. `STRIPE_SECRET_KEY`: Use your Stripe secret key for the production environment.
3. `STRIPE_WEBHOOK_SECRET`: Use the webhook secret from the production webhook you created in step 1.
4. `POSTGRES_URL`: Set this to your production database URL.
5. `AUTH_SECRET`: Set this to a random string. `openssl rand -base64 32` will generate one.

## Other Templates

While this template is intentionally minimal and to be used as a learning resource, there are other paid versions in the community which are more full-featured:

- https://achromatic.dev
- https://shipfa.st
- https://makerkit.dev
