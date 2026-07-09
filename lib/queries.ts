import { client } from '@/sanity/lib/client';
import { PHOTO_CATEGORIES } from '@/sanity/categories';
import type { CategorySummary, CountryMarker, SanityPhoto, SiteSettings, Trip } from './types';

const PHOTO_FIELDS = `
  _id,
  title,
  category,
  featured,
  location,
  country,
  exif,
  image,
  "coords": coalesce(coordinates, image.asset->metadata.location) { lat, lng }
`;

const TRIP_LIST_FIELDS = `
  _id,
  title,
  slug,
  excerpt,
  coverImage,
  countries,
  startDate,
  endDate,
  publishedAt,
  "photoCount": count(photos)
`;

export const fetchSiteSettings = () =>
  client.fetch<SiteSettings | null>(`*[_type == "siteSettings"][0] {
    _id,
    title,
    tagline,
    heroTitle,
    heroSubtitle,
    heroCtaLabel,
    heroImage,
    aboutTitle,
    aboutDescription,
    aboutImage,
    aboutEquipment,
    aboutSecondaryText,
    contactEmail,
    footerText
  }`);

export const fetchAllPhotos = () =>
  client.fetch<SanityPhoto[]>(`*[_type == "photo"] | order(_createdAt desc) { ${PHOTO_FIELDS} }`);

/**
 * Pula kadrów na stronę główną: wyróżnione (featured), a jeśli jest ich mniej niż 4 —
 * uzupełniona najnowszymi zdjęciami, żeby strona nie była pusta przed oznaczeniem puli.
 */
export const fetchFeaturedPool = async (poolSize = 12): Promise<SanityPhoto[]> => {
  const featured = await client.fetch<SanityPhoto[]>(
    `*[_type == "photo" && featured == true] | order(_createdAt desc) [0...$poolSize] { ${PHOTO_FIELDS} }`,
    { poolSize },
  );
  if (featured.length >= 4) return featured;

  const latest = await client.fetch<SanityPhoto[]>(
    `*[_type == "photo"] | order(_createdAt desc) [0...$poolSize] { ${PHOTO_FIELDS} }`,
    { poolSize },
  );
  const seen = new Set(featured.map((photo) => photo._id));
  return [...featured, ...latest.filter((photo) => !seen.has(photo._id))].slice(0, poolSize);
};

export const fetchCategorySummaries = async (): Promise<CategorySummary[]> => {
  const projection = PHOTO_CATEGORIES.map(
    ({ value }) => `"${value}": {
      "count": count(*[_type == "photo" && "${value}" in category]),
      "cover": *[_type == "photo" && "${value}" in category] | order(_createdAt desc) [0].image
    }`,
  ).join(',\n');

  const result = await client.fetch<Record<string, { count: number; cover?: unknown }>>(`{ ${projection} }`);

  return PHOTO_CATEGORIES.map(({ title, value }) => ({
    title,
    value,
    count: result[value]?.count ?? 0,
    cover: result[value]?.cover,
  }));
};

export const fetchCountryMarkers = async (): Promise<CountryMarker[]> => {
  const rows = await client.fetch<Array<{ country?: string }>>(
    `*[_type == "photo" && defined(country)] { country }`,
  );
  const counts = new Map<string, number>();
  rows.forEach(({ country }) => {
    const name = country?.trim();
    if (!name) return;
    counts.set(name, (counts.get(name) ?? 0) + 1);
  });
  return Array.from(counts, ([country, count]) => ({ country, count }));
};

export const fetchTrips = () =>
  client.fetch<Trip[]>(
    `*[_type == "trip"] | order(coalesce(publishedAt, _createdAt) desc) { ${TRIP_LIST_FIELDS} }`,
  );

export const fetchLatestTrip = () =>
  client.fetch<Trip | null>(
    `*[_type == "trip"] | order(coalesce(publishedAt, _createdAt) desc) [0] { ${TRIP_LIST_FIELDS} }`,
  );

export const fetchTripBySlug = (slug: string) =>
  client.fetch<Trip | null>(
    `*[_type == "trip" && slug.current == $slug][0] {
      ${TRIP_LIST_FIELDS},
      body,
      "photos": photos[]-> { ${PHOTO_FIELDS} }
    }`,
    { slug },
  );
