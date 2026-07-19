import 'server-only';
import { getSupabaseServiceClient } from './supabase/server';
import { getSupabaseAnonClient, GALLERY_BUCKET } from './supabase/client';

export interface GalleryImage {
  src: string;
  alt: string;
}

// The couple's shoot, bundled in /public. These show by default; uploading to
// the Supabase Storage bucket (if configured) overrides them.
// Note: filenames are case-sensitive on Linux/Vercel — keep the .PNG casing.
const FALLBACK_IMAGES: GalleryImage[] = [
  { src: '/faithsealedus5.PNG', alt: 'Augusta & Georges' },
  { src: '/faithsealedus1.PNG', alt: 'Augusta & Georges' },
  { src: '/faithsealedus7.PNG', alt: 'Augusta & Georges' },
  { src: '/faithsealedus4.PNG', alt: 'Augusta & Georges' },
  { src: '/faithsealedus6.PNG', alt: 'Augusta & Georges' },
  { src: '/faithsealedus3.PNG', alt: 'Augusta & Georges' },
  { src: '/faithsealedus8.PNG', alt: 'Augusta & Georges' },
  { src: '/faithsealedus2.PNG', alt: 'Augusta & Georges' },
];

const IMAGE_EXT = /\.(jpe?g|png|webp|avif|gif)$/i;

/**
 * Lists public image URLs from the configured Supabase Storage bucket.
 * Falls back to bundled placeholder art when Supabase is not configured or
 * the bucket is empty, so the page always renders something tasteful.
 */
export async function getGalleryImages(): Promise<GalleryImage[]> {
  const supabase = getSupabaseServiceClient() ?? getSupabaseAnonClient();
  if (!supabase) return FALLBACK_IMAGES;

  try {
    const { data, error } = await supabase.storage
      .from(GALLERY_BUCKET)
      .list('', { limit: 100, sortBy: { column: 'name', order: 'asc' } });

    if (error || !data) return FALLBACK_IMAGES;

    const images = data
      .filter((file) => IMAGE_EXT.test(file.name))
      .map((file) => {
        const { data: pub } = supabase.storage
          .from(GALLERY_BUCKET)
          .getPublicUrl(file.name);
        return { src: pub.publicUrl, alt: file.name.replace(IMAGE_EXT, '') };
      });

    return images.length > 0 ? images : FALLBACK_IMAGES;
  } catch {
    return FALLBACK_IMAGES;
  }
}
