import { Suspense } from 'react';
import { Flex, Box } from "@chakra-ui/react";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import Explorer from '@/components/ui/explorer';
import { SideNav } from '@/components/layout/side-nav';
import {
  fetchModels,
  fetchModelMetadata,
  fetchVectors,
  fetchFilterOptions,
  transformModelCore,
  transformVectorsToLayers,
} from '@/utils/data-transformation';
import { type ModelGroupMetadata } from '@/app/types';

// Generate pages per model id
export async function generateStaticParams() {
  const res = await fetchModels();
  return res.map((model) => ({
    slug: String(model.id),
  }));
}

export default async function ModelPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  const queryClient = new QueryClient();

  // Prefetch in parallel: models list, model metadata, vectors
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ['models'],
      queryFn: fetchModels,
    }),

    queryClient.prefetchQuery({
      queryKey: ['modelMetadata', slug],
      queryFn: async () => {
        const apiModel = await fetchModelMetadata(slug);
        return transformModelCore(apiModel);
      },
    }),
    queryClient.prefetchQuery({
      queryKey: ['vectors'],
      queryFn: async () => {
        const apiVectors = await fetchVectors();
        return transformVectorsToLayers(apiVectors);
      },
    }),
  ]);

  // Get model core to fetch filter options
  const modelCore = queryClient.getQueryData<ReturnType<typeof transformModelCore>>(['modelMetadata', slug]);
  const defaultScenarioId = modelCore?.scenarios[0]?.id;

  // Prefetch filter options in parallel
  if (modelCore && defaultScenarioId) {
    await Promise.all(
      modelCore.filterFields.map(field =>
        queryClient.prefetchQuery({
          queryKey: ['filterOptions', modelCore?.id, field.column],
          queryFn: () => fetchFilterOptions(defaultScenarioId, field.column),
        })
      )
    );
  }

  const models = queryClient.getQueryData<ModelGroupMetadata[]>(['models'])!;

  return (
    <Flex height="calc(100vh - 74px)" width="100%">
      <Suspense>
        <SideNav models={models} currentSlug={slug} />
        <Box id='main-panel' width='full' height="100%">
          <HydrationBoundary state={dehydrate(queryClient)}>
            <Explorer modelId={slug} />
          </HydrationBoundary>
        </Box>
      </Suspense>
    </Flex>
  );
}
