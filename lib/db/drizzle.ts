import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

dotenv.config();

// Vercel/Neon integrations expose DATABASE_URL; the starter used POSTGRES_URL.
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!connectionString) {
  // Don't throw at import time: `next build` loads route modules to collect page data,
  // and the build should succeed before a database is attached. Queries fail until it is.
  console.warn('POSTGRES_URL (or DATABASE_URL) environment variable is not set');
}

export const client = postgres(connectionString || 'postgres://missing-database-url@localhost:5432/missing');
export const db = drizzle(client, { schema });
