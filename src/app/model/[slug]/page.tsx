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
  getModelData
} from '@/utils/data-transformation';
import { type ModelGroupMetadata } from '@/app/types';

// Generate pages per miodel id
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

  // Prefetch model data
  await queryClient.prefetchQuery({
    queryKey: ['model', slug],
    queryFn: () => getModelData(slug),
  });

  await queryClient.prefetchQuery({
    queryKey: ['models'],
    queryFn: fetchModels,
  });

  const models = queryClient.getQueryData<Awaited<ModelGroupMetadata[]>>(['models'])!;

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
