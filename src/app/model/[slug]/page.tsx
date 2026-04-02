import { Suspense } from 'react';
import { Flex, Box } from "@chakra-ui/react";
import Explorer from '@/components/ui/explorer';
import { SideNav } from '@/components/layout/side-nav';
import {
  fetchModels,
  slugify,
} from '@/utils/data-transformation';

export const dynamicParams = false;
// Generate pages per model id
export async function generateStaticParams() {
  const res = await fetchModels();
  return res.map((model) => ({
    slug: slugify(model.name),
  }));
}

export default async function ModelPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  const models = await fetchModels();
  const model = models.find((m) => slugify(m.name) === slug);

  if (!model) {
    throw new Error(`Model not found for slug: ${slug}`);
  }

  return (
    <Flex h="calc(100vh - 3.5rem - 1px)" maxH="calc(100vh - 3.5rem - 1px)" overflow="hidden" width="100%">
      <Suspense>
        <SideNav models={models} currentSlug={slug} />
        <Box id='main-panel' width='full' height="100%">
          <Explorer modelId={model.id} />
        </Box>
      </Suspense>
    </Flex>
  );
}
