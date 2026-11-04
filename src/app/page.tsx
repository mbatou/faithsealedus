import { HomePage } from '@/components/HomePage';

// Statically generated with hourly ISR: the page is served straight from the
// CDN (no serverless cold-start or missing env can 404 it). Dynamic bits
// (prayers, RSVP) are handled by client fetches to route handlers.
// Visitors in Ghana are rewritten to /accra by the middleware.
export const revalidate = 3600;

export default function Home() {
  return <HomePage region="all" />;
}
