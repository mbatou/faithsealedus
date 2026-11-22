import { HomePage } from '@/components/HomePage';

// The Accra-only edition of the home page, served at "/" to visitors located
// in Ghana (see src/middleware.ts). The Senegal celebration is left out.
// 10 minutes, so the 1 December home-page switch lands promptly.
export const revalidate = 600;

export default function AccraHome() {
  return <HomePage region="gh" />;
}
