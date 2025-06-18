import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Cast the config object to `any` to bypass strict typing
const queryClient = postgres(process.env.DATABASE_URL!, {
  max: 1,
  ssl: 'require',
  fetch: fetch, // ✅ for Edge runtime
} as any); // 👈 bypass TS type error

export const db = drizzle(queryClient);
