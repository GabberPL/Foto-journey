import { defineArrayMember, defineField, defineType } from 'sanity';
import { PHOTO_CATEGORIES } from './categories';
import { COUNTRY_OPTIONS } from './countries';

export const photoType = defineType({
  name: 'photo',
  title: 'Zdjęcie',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Tytuł zdjęcia',
      type: 'string',
      validation: (Rule) => Rule.required().min(2),
    }),
    defineField({
      name: 'image',
      title: 'Plik zdjęcia',
      type: 'image',
      // 'location' wyciąga GPS z EXIF przy uploadzie — zdjęcia z telefonu tagują się same
      options: { hotspot: true, metadata: ['exif', 'location'] },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Kategorie',
      type: 'array',
      description: 'Zaznacz jedną lub więcej kategorii.',
      of: [defineArrayMember({ type: 'string' })],
      options: {
        list: PHOTO_CATEGORIES.map((category) => ({ ...category })),
      },
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'featured',
      title: 'Wyróżnione (strona główna)',
      type: 'boolean',
      description: 'Zdjęcia z tą flagą trafiają do puli, z której strona główna losuje 4 kadry na wizytę.',
      initialValue: false,
    }),
    defineField({
      name: 'country',
      title: 'Kraj',
      type: 'string',
      description: 'Zacznij wpisywać kraj, np. „Kam” i wybierz Kambodżę. Pozostaw puste, jeśli zdjęcie nie ma być na mapie.',
      options: {
        list: COUNTRY_OPTIONS,
      },
    }),
    defineField({
      name: 'location',
      title: 'Lokalizacja (Miasto / region)',
      type: 'string',
      description: 'Opcjonalnie doprecyzuj miejsce, np. miasto lub region.',
    }),
    defineField({
      name: 'coordinates',
      title: 'Dokładna lokalizacja (pin na mapie)',
      type: 'geopoint',
      description:
        'Opcjonalnie: wskaż miejsce wykonania zdjęcia na mapie — pojawi się jako dokładny pin na Mapie Podróży. Bez pinu zdjęcie liczy się do zbiorczego znacznika kraju. Zdjęcia z GPS w EXIF (np. z telefonu) dostają lokalizację automatycznie przy uploadzie.',
    }),
    defineField({
      name: 'exif',
      title: 'Dane sprzętowe (EXIF)',
      type: 'object',
      fields: [
        defineField({ name: 'camera', title: 'Aparat', type: 'string', initialValue: 'Nikon D7100' }),
        defineField({ name: 'lens', title: 'Obiektyw', type: 'string' }),
        defineField({ name: 'aperture', title: 'Przysłona (np. f/1.8)', type: 'string' }),
        defineField({ name: 'speed', title: 'Czas migawki (np. 1/500s)', type: 'string' }),
        defineField({ name: 'iso', title: 'ISO', type: 'string' }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      category: 'category',
      media: 'image',
    },
    prepare(selection) {
      const { title, category, media } = selection as {
        title?: string;
        category?: string | string[];
        media?: string | null;
      };
      const subtitle = Array.isArray(category)
        ? category.join(', ')
        : typeof category === 'string'
          ? category
          : 'Brak kategorii';

      return {
        title,
        subtitle,
        media,
      };
    },
  },
});

export const siteSettingsType = defineType({
  name: 'siteSettings',
  title: 'Ustawienia strony',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Nazwa strony',
      type: 'string',
      initialValue: 'Photo Journal',
      validation: (Rule) => Rule.required().min(2),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline / nagłówek',
      type: 'string',
      initialValue: 'Uchwycić Ulotne',
    }),
    defineField({
      name: 'heroTitle',
      title: 'Tytuł hero',
      type: 'string',
      initialValue: 'Świat przez obiektyw Nikona.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Opis hero',
      type: 'text',
      rows: 4,
      initialValue: 'Niezawodowe kadry. Osobiste historie. Od ryków motocykli ADV, przez rytm Capoeiry, aż po ciszę makro i chaos ulic Tajlandii.',
    }),
    defineField({
      name: 'heroCtaLabel',
      title: 'Tekst przycisku CTA',
      type: 'string',
      initialValue: 'Odkryj Galerię',
    }),
    defineField({
      name: 'heroImage',
      title: 'Zdjęcie w hero',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'aboutTitle',
      title: 'Nagłówek sekcji O mnie',
      type: 'string',
      initialValue: 'O mnie & Pasje',
    }),
    defineField({
      name: 'aboutDescription',
      title: 'Treść sekcji O mnie',
      type: 'array',
      of: [defineArrayMember({ type: 'block' })],
    }),
    defineField({
      name: 'aboutImage',
      title: 'Zdjęcie w sekcji O mnie',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'aboutEquipment',
      title: 'Sprzęt / obiektyw',
      type: 'string',
      initialValue: 'Nikon D7100 · Nikkor 35mm f/1.8',
    }),
    defineField({
      name: 'aboutSecondaryText',
      title: 'Dodatkowy opis',
      type: 'text',
      rows: 4,
      initialValue: 'Fotografuję Nikonem D7100. Nie zawodowo, lecz z potrzeby serca. Zatrzymuję chwile, które mają znaczenie.',
    }),
    defineField({
      name: 'contactEmail',
      title: 'E-mail kontaktowy',
      type: 'string',
      description: 'Pokazywany w sekcji Kontakt na stronie „O mnie”.',
      validation: (Rule) => Rule.email(),
    }),
    defineField({
      name: 'footerText',
      title: 'Tekst w stopce',
      type: 'string',
      initialValue: '© 2026 Wszelkie prawa zastrzeżone.',
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Ustawienia strony',
      };
    },
  },
});

export const storyType = defineType({
  name: 'story',
  title: 'Historia',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Tytuł historii',
      type: 'string',
      validation: (Rule) => Rule.required().min(2),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Krótki opis',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'body',
      title: 'Treść historii',
      type: 'array',
      of: [defineArrayMember({ type: 'block' })],
    }),
    defineField({
      name: 'image',
      title: 'Zdjęcie historii',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'publishedAt',
      title: 'Data publikacji',
      type: 'datetime',
      initialValue: new Date().toISOString(),
    }),
    defineField({
      name: 'category',
      title: 'Kategoria',
      type: 'string',
      options: {
        list: [
          { title: 'Motocykl', value: 'Moto' },
          { title: 'Podróże', value: 'Travel' },
          { title: 'Natura', value: 'Nature' },
          { title: 'Capoeira', value: 'Capoeira' },
          { title: 'Ludzie', value: 'People' },
        ],
      },
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category',
      media: 'image',
    },
  },
});

export const tripType = defineType({
  name: 'trip',
  title: 'Wyprawa',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Tytuł wyprawy',
      type: 'string',
      validation: (Rule) => Rule.required().min(2),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Krótki opis',
      type: 'text',
      rows: 3,
      description: 'Zajawka pokazywana na liście wypraw i na stronie głównej.',
    }),
    defineField({
      name: 'body',
      title: 'Treść / dziennik',
      type: 'array',
      of: [defineArrayMember({ type: 'block' })],
    }),
    defineField({
      name: 'coverImage',
      title: 'Zdjęcie okładkowe',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'countries',
      title: 'Kraje na trasie',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      options: { list: COUNTRY_OPTIONS },
      description: 'Kraje odwiedzone podczas wyprawy — pokażą się na mini-mapie trasy.',
    }),
    defineField({
      name: 'startDate',
      title: 'Data rozpoczęcia',
      type: 'date',
    }),
    defineField({
      name: 'endDate',
      title: 'Data zakończenia',
      type: 'date',
    }),
    defineField({
      name: 'photos',
      title: 'Zdjęcia z wyprawy',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'photo' }] })],
      description: 'Podepnij kadry z galerii, które należą do tej wyprawy.',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Data publikacji',
      type: 'datetime',
      initialValue: new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      countries: 'countries',
      media: 'coverImage',
    },
    prepare(selection) {
      const { title, countries, media } = selection as {
        title?: string;
        countries?: string[];
        media?: string | null;
      };
      return {
        title,
        subtitle: Array.isArray(countries) && countries.length ? countries.join(' · ') : 'Wyprawa',
        media,
      };
    },
  },
});

export const schemaTypes = [photoType, tripType, siteSettingsType, storyType];