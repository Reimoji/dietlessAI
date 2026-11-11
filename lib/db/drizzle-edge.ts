// drizzle-edge.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema'; // ✅ make sure this path is correct!

const connectionString = (process.env.DATABASE_URL || process.env.POSTGRES_URL)!;
const isLocal = /@(localhost|127\.0\.0\.1)[:/]/.test(connectionString);

const queryClient = postgres(connectionString, {
  max: 1,
  ssl: isLocal ? false : 'require',
  fetch: fetch,
} as any);

export const db = drizzle(queryClient, { schema }); // ✅ add schema here
