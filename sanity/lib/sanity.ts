import { createClient } from 'next-sanity';
import imageUrlBuilder from '@sanity/image-url';

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01', // Używamy stabilnej wersji API
  useCdn: false, // false w dev, żeby od razu widzieć nowe zdjęcia
});

// Pomocnik do generowania URL-i dla obrazków z Sanity
const builder = imageUrlBuilder(client);

export function urlFor(source: any) {
  return builder.image(source);
}