// drizzle-edge.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema'; // ✅ make sure this path is correct!

const queryClient = postgres(process.env.DATABASE_URL!, {
  max: 1,
  ssl: 'require',
  fetch: fetch,
} as any);

export const db = drizzle(queryClient, { schema }); // ✅ add schema here
