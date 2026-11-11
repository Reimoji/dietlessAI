import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

dotenv.config();

// Vercel/Neon integrations expose DATABASE_URL; the starter used POSTGRES_URL.
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('POSTGRES_URL (or DATABASE_URL) environment variable is not set');
}

export const client = postgres(connectionString);
export const db = drizzle(client, { schema });
