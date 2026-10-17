import { NextResponse } from 'next/server';
import { clientCountry } from '@/lib/geo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Returns the visitor's country code (ISO 3166-1 alpha-2) as resolved by
 * Vercel's edge network, or null when unknown (e.g. local development).
 * The home page is statically rendered, so the RSVP form asks here.
 */
export async function GET(request: Request) {
  return NextResponse.json(
    { country: clientCountry(request) },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}
