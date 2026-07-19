import 'server-only';
import { getSupabaseServiceClient } from './supabase/server';
import { getSupabaseAnonClient, GALLERY_BUCKET } from './supabase/client';

export interface GalleryImage {
  src: string;
  alt: string;
}

// Local fallbacks so the gallery looks intentional before real photos are
// uploaded to the Supabase Storage bucket.
const FALLBACK_IMAGES: GalleryImage[] = Array.from({ length: 6 }, (_, i) => ({
  src: `/gallery/photo-${i + 1}.svg`,
  alt: `Placeholder photo ${i + 1}`,
}));

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
