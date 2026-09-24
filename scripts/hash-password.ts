/**
 * Prints the ADMIN_PASSWORD_HASH value for a password.
 *
 *   npm run admin:hash -- "a-választott-jelszó"
 *
 * The password is never stored anywhere: only the printed scrypt hash goes into
 * .env, and the plain text stays with whoever chose it.
 */
import { hashPassword } from '../lib/auth/password.ts';

const password = process.argv[2];

if (password === undefined || password.length < 10) {
  console.error('Használat: npm run admin:hash -- "jelszó"  (legalább 10 karakter)');
  process.exit(1);
}

console.log(await hashPassword(password));
