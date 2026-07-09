import { createElement, useState } from 'react';
import { defineConfig, useClient, type DocumentActionComponent } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { googleMapsInput } from '@sanity/google-maps-input';
import { useToast } from '@sanity/ui';
import { Icon } from '@sanity/icons';
import { schemaTypes } from './sanity/schema';
import PublishAllPhotosTool from './sanity/tools/PublishAllPhotosTool';

const PublishIcon = () => createElement(Icon, { symbol: 'publish' });

// Pobieramy zmienne środowiskowe, które wygenerował dla Ciebie instalator Sanity
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

const PUBLISH_ALL_API_VERSION = '2025-01-01';

type DraftPhotoDoc = { _id: string };

const PublishAllPhotosAction: DocumentActionComponent = (props) => {
  const client = useClient({ apiVersion: PUBLISH_ALL_API_VERSION });
  const toast = useToast();
  const [isPublishing, setIsPublishing] = useState(false);

  if (props.type !== 'photo') {
    return null;
  }

  return {
    label: isPublishing ? 'Publikowanie…' : 'Publikuj wszystkie zdjęcia',
    icon: PublishIcon,
    disabled: isPublishing,
    onHandle: async () => {
      setIsPublishing(true);
      try {
        const drafts = await client.fetch<DraftPhotoDoc[]>(
          `*[_type == "photo" && _id in path("drafts.**")]{ _id }`
        );

        if (!drafts.length) {
          toast.push({ status: 'info', title: 'Brak zdjęć oczekujących na publikację' });
          return;
        }

        const actions = drafts.map((doc) => ({
          actionType: 'sanity.action.document.publish' as const,
          draftId: doc._id,
          publishedId: doc._id.replace(/^drafts\./, ''),
        }));

        await client.action(actions, { tag: 'publish-all-photos' });
        toast.push({
          status: 'success',
          title: `Opublikowano ${actions.length} ${actions.length === 1 ? 'zdjęcie' : 'zdjęć'}`,
        });
      } catch (error) {
        toast.push({
          status: 'error',
          title: 'Nie udało się opublikować zdjęć',
          description: error instanceof Error ? error.message : undefined,
        });
      } finally {
        setIsPublishing(false);
        props.onComplete();
      }
    },
  };
};

export default defineConfig({
  name: 'default',
  title: 'Photo Journal CMS',

  projectId,
  dataset,

  // To jest ścieżka, pod którą będzie dostępny panel na Twojej stronie
  basePath: '/studio',

  plugins: [
    structureTool(),
    visionTool(),
    // Wybór geopointu klikaniem na mapie (pole „Dokładna lokalizacja” na zdjęciu)
    googleMapsInput({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
      defaultZoom: 5,
      defaultLocation: { lat: 52.2297, lng: 21.0122 },
    }),
  ],

  document: {
    actions: (prev, context) =>
      context.schemaType === 'photo' ? [PublishAllPhotosAction, ...prev] : prev,
  },

  tools: (prev) => [
    ...prev,
    {
      name: 'publish-all-photos',
      title: 'Publikuj wszystko',
      icon: PublishIcon,
      component: PublishAllPhotosTool,
    },
  ],

  schema: {
    types: schemaTypes,
  },
});
