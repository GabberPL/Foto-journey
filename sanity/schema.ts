import { defineField, defineType } from 'sanity';

// Definiujemy schemat pojedynczego zdjęcia
export const photoType = defineType({
  name: 'photo',
  title: 'Zdjęcie',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Tytuł zdjęcia',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Plik zdjęcia',
      type: 'image',
      options: {
        hotspot: true, // Pozwala na kadrowanie w CMS
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Kategoria',
      type: 'string',
      options: {
        list: [
          { title: 'Wyprawy (ADV)', value: 'ADV' },
          { title: 'Ludzie', value: 'People' },
          { title: 'Natura & Makro', value: 'Nature' },
          { title: 'Podróże', value: 'Travel' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'location',
      title: 'Lokalizacja (Kraj, Miasto)',
      type: 'string',
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
      subtitle: 'category',
      media: 'image',
    },
  },
});

// Eksportujemy wszystkie schematy (na razie mamy tylko zdjęcia, w przyszłości dodamy tu np. Posty z Instagrama i O Mnie)
export const schemaTypes = [photoType];