import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function exportSchema() {
  console.log('Exporting complete schema...');
  
  // Connect to database
  const connectionString = process.env.POSTGRES_URL || 'postgres://postgres:postgres@localhost:54322/postgres';
  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql);
  
  try {
    // Get all migration SQL files
    const migrationsFolder = path.join(__dirname, '../lib/db/migrations');
    const migrationFiles = fs.readdirSync(migrationsFolder)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure correct order
    
    // Combine all migration SQL into one file
    let fullSchema = '';
    
    for (const file of migrationFiles) {
      const filePath = path.join(migrationsFolder, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      fullSchema += `-- Migration: ${file}\n${sql}\n\n`;
    }
    
    // Write to a single file
    const outputPath = path.join(__dirname, '../full-schema.sql');
    fs.writeFileSync(outputPath, fullSchema);
    
    console.log(`Full schema exported to ${outputPath}`);
  } catch (error) {
    console.error('Error exporting schema:', error);
  } finally {
    await sql.end();
  }
}

// Check if this file is being run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  exportSchema()
    .catch(console.error)
    .finally(() => process.exit(0));
}