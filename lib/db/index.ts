import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { DATABASE_PATH, UPLOAD_DIR } from '@/lib/env';
import { SCHEMA_SQL } from './schema';
import { seedDefaults } from './seed';

/**
 * A single SQLite connection for the process.
 *
 * SQLite is the right store here: the site is read-heavy, the data set is small,
 * and it keeps the deployment inside CEF's one-container contract — no second
 * service, no network hop, no connection pool. Reads are synchronous and take
 * microseconds, so pages render without waiting on a database round trip.
 */

let instance: Database.Database | undefined;

function connect(): Database.Database {
  fs.mkdirSync(path.dirname(DATABASE_PATH), { recursive: true });
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });

  const database = new Database(DATABASE_PATH);
  database.pragma('journal_mode = WAL');
  database.pragma('foreign_keys = ON');
  database.pragma('busy_timeout = 5000');
  database.exec(SCHEMA_SQL);
  seedDefaults(database);
  return database;
}

/** The shared database handle, opened and migrated on first use. */
export function db(): Database.Database {
  // Next.js reloads modules in development; cache on globalThis so dev does not
  // leak a new SQLite handle on every hot update.
  const globalRef = globalThis as typeof globalThis & { __koterDb?: Database.Database };
  if (process.env.NODE_ENV !== 'production') {
    globalRef.__koterDb ??= connect();
    return globalRef.__koterDb;
  }
  instance ??= connect();
  return instance;
}

/** Current timestamp in the format the schema uses. */
export function now(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}
