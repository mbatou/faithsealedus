'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import {
  ADMIN_COOKIE,
  sessionToken,
  verifyPassword,
} from '@/lib/admin-auth';

export async function login(
  _prevState: { error: boolean },
  formData: FormData,
): Promise<{ error: boolean }> {
  const password = String(formData.get('password') ?? '');
  const token = sessionToken();

  if (!token || !verifyPassword(password)) {
    return { error: true };
  }

  cookies().set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    // Site-wide so admin-gated API routes (e.g. /api/db-check) receive it too.
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours
  });

  revalidatePath('/admin');
  return { error: false };
}

export async function logout(): Promise<void> {
  cookies().delete({ name: ADMIN_COOKIE, path: '/' });
  revalidatePath('/admin');
}
