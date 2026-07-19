import 'server-only';
import { createHash, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

export const ADMIN_COOKIE = 'admin_session';

/**
 * Derives an opaque session token from the admin password. The plaintext
 * password never touches the cookie — only this hash does — so the cookie
 * can't be reversed into the password, and it can't be forged without knowing
 * the password.
 */
function expectedToken(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return createHash('sha256').update(`wedding-admin:${password}`).digest('hex');
}

export function verifyPassword(input: string): boolean {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(password);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function sessionToken(): string | null {
  return expectedToken();
}

export function isAuthed(): boolean {
  const token = expectedToken();
  if (!token) return false;
  const cookie = cookies().get(ADMIN_COOKIE)?.value;
  if (!cookie) return false;
  const a = Buffer.from(cookie);
  const b = Buffer.from(token);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
