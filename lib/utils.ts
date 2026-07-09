import { PHOTO_CATEGORIES } from '@/sanity/categories';
import { urlFor } from '@/sanity/lib/image';
import type { SanityPhoto } from './types';

export const getPhotoCategories = (category: SanityPhoto['category']): string[] => {
  if (Array.isArray(category)) return category;
  return category ? [category] : [];
};

export const getCategoryTitle = (value: string) =>
  PHOTO_CATEGORIES.find((category) => category.value.toLowerCase() === value.toLowerCase())?.title ?? value;

export const getImageUrl = (image: unknown, width = 1600) => {
  if (!image) return '';
  return urlFor(image as never).width(width).quality(85).auto('format').url();
};

export const formatTripDates = (startDate?: string, endDate?: string) => {
  const format = (value: string) =>
    new Date(value).toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
  if (startDate && endDate) {
    const start = format(startDate);
    const end = format(endDate);
    return start === end ? start : `${start} – ${end}`;
  }
  return startDate ? format(startDate) : endDate ? format(endDate) : null;
};
