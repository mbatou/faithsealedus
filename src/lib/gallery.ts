export interface GalleryImage {
  src: string;
  alt: string;
}

// Candid moments from the couple's story, served from /public — distinct from
// the studio shots used in the hero and Our Story so nothing repeats.
// Note: filenames are case-sensitive on Linux/Vercel — keep the exact casing.
const IMAGES: GalleryImage[] = [
  { src: '/story2.JPG', alt: 'Augusta & Georges quad biking under a baobab' },
  { src: '/story1.JPG', alt: 'Augusta laughing over lunch' },
  { src: '/story3.jpg', alt: 'Georges placing sunglasses on Augusta' },
  { src: '/story4.JPG', alt: 'Augusta & Georges go-karting' },
  { src: '/story7.png', alt: 'Augusta & Georges in the music room' },
];

export function getGalleryImages(): GalleryImage[] {
  return IMAGES;
}
