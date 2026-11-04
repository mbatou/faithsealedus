import { HomePage } from '@/components/HomePage';

// The Accra-only edition of the home page, served at "/" to visitors located
// in Ghana (see src/middleware.ts). The Senegal celebration is left out.
export const revalidate = 3600;

export default function AccraHome() {
  return <HomePage region="gh" />;
}
