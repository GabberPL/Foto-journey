export type PortableTextBlock = {
  _type: string;
  children?: Array<{ _type?: string; text?: string }>;
};

export type GeoCoords = {
  lat: number;
  lng: number;
};

export type SanityPhoto = {
  _id: string;
  title: string;
  category: string[] | string;
  featured?: boolean;
  location?: string;
  country?: string;
  /** Dokładna lokalizacja: pole coordinates albo GPS z EXIF pliku (coalesce w GROQ). */
  coords?: GeoCoords | null;
  exif?: {
    camera?: string;
    lens?: string;
    aperture?: string;
    speed?: string;
    iso?: string;
  };
  image?: unknown;
};

export type Trip = {
  _id: string;
  title: string;
  slug?: { current?: string };
  excerpt?: string;
  body?: PortableTextBlock[];
  coverImage?: unknown;
  countries?: string[];
  startDate?: string;
  endDate?: string;
  publishedAt?: string;
  photoCount?: number;
  photos?: SanityPhoto[];
};

export type SiteSettings = {
  _id: string;
  title?: string;
  tagline?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroCtaLabel?: string;
  heroImage?: unknown;
  aboutTitle?: string;
  aboutDescription?: PortableTextBlock[];
  aboutImage?: unknown;
  aboutEquipment?: string;
  aboutSecondaryText?: string;
  contactEmail?: string;
  footerText?: string;
};

export type CategorySummary = {
  value: string;
  title: string;
  count: number;
  cover?: unknown;
};

export type CountryMarker = {
  country: string;
  count: number;
};
