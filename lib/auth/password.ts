import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

/**
 * Password hashing with scrypt from Node's standard library.
 *
 * scrypt is memory-hard and built in, so the image needs no native crypto
 * dependency. Passwords are never stored or compared in plain text: the
 * environment holds only `scrypt$N$<salt>$<hash>`, and verification is
 * constant-time.
 */

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;
const PREFIX = 'scrypt.1';

/*
 * The encoding is `scrypt.1.<salt>.<key>`, separated by dots rather than the
 * conventional `$`. The hash lives in a .env file, and dotenv expands `$name`
 * references — a `$`-separated hash silently loses everything after the first
 * `$` and every login then fails with no useful error. Dots cannot occur in
 * base64url output, so they separate the fields unambiguously.
 */

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const derived = await scrypt(password.normalize('NFKC'), salt, KEY_LENGTH);
  return `${PREFIX}.${salt.toString('base64url')}.${derived.toString('base64url')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.trim().split('.');
  if (parts.length !== 4 || `${parts[0]}.${parts[1]}` !== PREFIX) {
    return false;
  }
  const saltPart = parts[2];
  const hashPart = parts[3];
  if (saltPart === undefined || hashPart === undefined) {
    return false;
  }

  let expected: Buffer;
  try {
    expected = Buffer.from(hashPart, 'base64url');
  } catch {
    return false;
  }
  if (expected.length !== KEY_LENGTH) {
    return false;
  }

  const derived = await scrypt(password.normalize('NFKC'), Buffer.from(saltPart, 'base64url'), KEY_LENGTH);
  return timingSafeEqual(derived, expected);
}
