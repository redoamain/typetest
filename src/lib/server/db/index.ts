import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import { initDb } from './init';

const dbUrl = process.env.DATABASE_URL || 'local.db';

export const client = new Database(dbUrl);
client.pragma('journal_mode = WAL');
client.pragma('foreign_keys = ON');

export const db = drizzle(client, { schema });

// Ensure schema & seed default data
initDb(db, client);
