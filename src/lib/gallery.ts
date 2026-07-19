export interface GalleryImage {
  src: string;
  alt: string;
}

// The couple's photos, served from /public. To add or change the gallery,
// drop new files in /public and edit this list.
// Note: filenames are case-sensitive on Linux/Vercel — keep the .PNG casing.
const IMAGES: GalleryImage[] = [
  { src: '/faithsealedus5.PNG', alt: 'Augusta & Georges' },
  { src: '/faithsealedus1.PNG', alt: 'Augusta & Georges' },
  { src: '/faithsealedus7.PNG', alt: 'Augusta & Georges' },
  { src: '/faithsealedus4.PNG', alt: 'Augusta & Georges' },
  { src: '/faithsealedus6.PNG', alt: 'Augusta & Georges' },
  { src: '/faithsealedus3.PNG', alt: 'Augusta & Georges' },
  { src: '/faithsealedus8.PNG', alt: 'Augusta & Georges' },
  { src: '/faithsealedus2.PNG', alt: 'Augusta & Georges' },
];

export function getGalleryImages(): GalleryImage[] {
  return IMAGES;
}
