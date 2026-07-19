/** @type {import('next').NextConfig} */

// Derive the Supabase Storage hostname from the public URL so that
// next/image will serve gallery photos hosted in a Supabase bucket.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseHost;
try {
  if (supabaseUrl) supabaseHost = new URL(supabaseUrl).hostname;
} catch {
  supabaseHost = undefined;
}

const remotePatterns = [
  // Allow any Supabase project storage bucket by default.
  { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' },
];

if (supabaseHost && !supabaseHost.endsWith('.supabase.co')) {
  remotePatterns.push({
    protocol: 'https',
    hostname: supabaseHost,
    pathname: '/storage/v1/object/public/**',
  });
}

const nextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;
