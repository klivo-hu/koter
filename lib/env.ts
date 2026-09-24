import path from 'node:path';

/**
 * Environment contract. Every secret and every writable path enters the app here
 * and nowhere else, so nothing is hard-coded and the container stays configurable.
 *
 * Required in production: JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD_HASH.
 * See .env.example for the full list and how to generate the values.
 */

function required(name: string): string {
  const value = process.env[name];
  if (value === undefined || value.trim() === '') {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        `Hiányzó kötelező környezeti változó: ${name}. Lásd .env.example — a konténer enélkül nem indulhat el biztonságosan.`,
      );
    }
    return '';
  }
  return value.trim();
}

function optional(name: string, fallback: string): string {
  const value = process.env[name];
  return value === undefined || value.trim() === '' ? fallback : value.trim();
}

/** Absolute path to the writable data directory (SQLite file + uploads live here). */
export const DATA_DIR = path.resolve(optional('DATA_DIR', './data'));

/** Absolute path to the SQLite database file. */
export const DATABASE_PATH = path.resolve(optional('DATABASE_PATH', path.join(DATA_DIR, 'koter.db')));

/** Absolute path to the uploads directory served through /api/media. */
export const UPLOAD_DIR = path.resolve(optional('UPLOAD_DIR', path.join(DATA_DIR, 'uploads')));

/** HS256 signing secret for admin sessions. Must be >= 32 characters. */
export function jwtSecret(): Uint8Array {
  const secret = required('JWT_SECRET');
  if (process.env.NODE_ENV === 'production' && secret.length < 32) {
    throw new Error('A JWT_SECRET legalább 32 karakter hosszú legyen.');
  }
  // In development an unset secret falls back to a fixed dev-only value so the app
  // still boots; production throws above, so this can never ship.
  return new TextEncoder().encode(secret === '' ? 'koter-dev-secret-not-for-production-use' : secret);
}

/** The single admin account, configured entirely from the environment. */
export function adminCredentials(): { email: string; passwordHash: string } {
  return { email: required('ADMIN_EMAIL').toLowerCase(), passwordHash: required('ADMIN_PASSWORD_HASH') };
}

/** Session lifetime in seconds (default 8 hours). */
export const SESSION_TTL_SECONDS = Number.parseInt(optional('SESSION_TTL_SECONDS', '28800'), 10);

/** Largest accepted upload in bytes (default 8 MB). */
export const MAX_UPLOAD_BYTES = Number.parseInt(optional('MAX_UPLOAD_BYTES', '8388608'), 10);
