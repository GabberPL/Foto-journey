import { useCallback, useState } from 'react';
import { Button, Card, Code, Container, Flex, Heading, Spinner, Stack, Text } from '@sanity/ui';
import { Icon } from '@sanity/icons';
import { useClient } from 'sanity';

const PUBLISH_ALL_API_VERSION = '2025-01-01';

type PublishResult =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; count: number }
  | { status: 'empty' }
  | { status: 'error'; message: string };

type DraftPhotoDoc = { _id: string };

export default function PublishAllPhotosTool() {
  const client = useClient({ apiVersion: PUBLISH_ALL_API_VERSION });
  const [result, setResult] = useState<PublishResult>({ status: 'idle' });

  const handlePublishAll = useCallback(async () => {
    setResult({ status: 'loading' });
    try {
      const drafts = await client.fetch<DraftPhotoDoc[]>(
        `*[_type == "photo" && _id in path("drafts.**")]{ _id }`
      );

      if (!drafts.length) {
        setResult({ status: 'empty' });
        return;
      }

      const actions = drafts.map((doc) => ({
        actionType: 'sanity.action.document.publish' as const,
        draftId: doc._id,
        publishedId: doc._id.replace(/^drafts\./, ''),
      }));

      await client.action(actions, { tag: 'publish-all-photos' });
      setResult({ status: 'success', count: actions.length });
    } catch (error) {
      setResult({
        status: 'error',
        message: error instanceof Error ? error.message : 'Nieznany błąd',
      });
    }
  }, [client]);

  const isLoading = result.status === 'loading';

  return (
    <Container width={1} padding={4}>
      <Stack space={4}>
        <Heading size={2}>Publikuj wszystkie zdjęcia</Heading>
        <Text muted size={2}>
          Publikuje jednym kliknięciem wszystkie zdjęcia oczekujące na publikację —
          przydatne po hurtowym wgraniu nowych zdjęć do galerii.
        </Text>

        <Card padding={4} radius={3} shadow={1}>
          <Flex align="center" justify="space-between" gap={3} wrap="wrap">
            <Text>Opublikuje wszystkie zdjęcia z niezatwierdzonymi zmianami.</Text>
            <Button
              icon={<Icon symbol="publish" />}
              text={isLoading ? 'Publikowanie…' : 'Publikuj wszystkie zdjęcia'}
              tone="positive"
              disabled={isLoading}
              onClick={handlePublishAll}
            />
          </Flex>
        </Card>

        {isLoading ? (
          <Flex align="center" gap={2}>
            <Spinner muted />
            <Text muted size={1}>
              Trwa publikowanie zdjęć…
            </Text>
          </Flex>
        ) : null}

        {result.status === 'success' ? (
          <Card padding={3} radius={2} tone="positive">
            <Text size={1}>
              Opublikowano {result.count} {result.count === 1 ? 'zdjęcie' : 'zdjęć'}.
            </Text>
          </Card>
        ) : null}

        {result.status === 'empty' ? (
          <Card padding={3} radius={2} tone="caution">
            <Text size={1}>Brak zdjęć oczekujących na publikację.</Text>
          </Card>
        ) : null}

        {result.status === 'error' ? (
          <Card padding={3} radius={2} tone="critical">
            <Stack space={2}>
              <Text size={1} weight="semibold">
                Nie udało się opublikować zdjęć.
              </Text>
              <Code size={1}>{result.message}</Code>
            </Stack>
          </Card>
        ) : null}
      </Stack>
    </Container>
  );
}
