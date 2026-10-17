// Vercel resolves the visitor's country from their IP and injects it as a
// request header on dynamic routes. Absent locally and on non-Vercel hosts.
export function clientCountry(request: Request): string | null {
  const country = request.headers.get('x-vercel-ip-country');
  return country ? country.trim().toUpperCase() : null;
}
