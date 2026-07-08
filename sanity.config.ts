import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './sanity/schema';

// Pobieramy zmienne środowiskowe, które wygenerował dla Ciebie instalator Sanity
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

export default defineConfig({
  name: 'default',
  title: 'Photo Journal CMS',

  projectId,
  dataset,

  // To jest ścieżka, pod którą będzie dostępny panel na Twojej stronie
  basePath: '/studio',

  plugins: [
    structureTool(),
    visionTool(), // Narzędzie dla deweloperów do testowania zapytań do bazy
  ],

  schema: {
    types: schemaTypes,
  },
});