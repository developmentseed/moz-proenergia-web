import { Suspense } from 'react';
import { Flex, Box } from "@chakra-ui/react";
import Explorer from '@/components/ui/explorer';
import { SideNav } from '@/components/layout/side-nav';
import {
  fetchModels,
  fetchModelMetadata,
  fetchVectors,
  transformToModelMetadata,
} from '@/utils/data-transformation';

// ----- Page Component -----
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

  // Fetch all data in parallel
  const [models, apiModel, apiVectors] = await Promise.all([
    fetchModels(),
    fetchModelMetadata(slug),
    fetchVectors(),
  ]);

  // Transform API response to expected format
  const metadata = await transformToModelMetadata(apiModel, apiVectors);

  return (
    <Flex height="calc(100vh - 74px)" width="100%">
      <SideNav models={models} currentSlug={slug} />
      <Box id='main-panel' width='full' height="100%">
        <Suspense>
          {/* Control Panel and Map */}
          <Explorer modelData={metadata} />
        </Suspense>
      </Box>
    </Flex>
  );
}
