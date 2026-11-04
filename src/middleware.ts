import { NextResponse, type NextRequest } from 'next/server';

// Augusta doesn't want guests in Ghana to see the Senegal celebration, so
// visitors located in Ghana are served the Accra-only edition of the home
// page. The URL stays "/"; Vercel resolves the country from the visitor's IP
// and sets this header itself (a client-supplied value is overwritten).
export function middleware(request: NextRequest) {
  const country = request.headers.get('x-vercel-ip-country')?.toUpperCase();
  if (country === 'GH') {
    return NextResponse.rewrite(new URL('/accra', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/',
};
