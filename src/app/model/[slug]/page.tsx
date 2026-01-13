import { Suspense } from 'react';
import { promises as fs } from 'fs';
import { Flex, HStack, Box } from "@chakra-ui/react";
import MainPanel from '@/components/ui/main-panel';
import { SideNav } from '@/components/layout/side-nav';
import { ModelMetadata } from '@/app/types';

// For dynamic route + ssg: fetch all the possible params
export async function generateStaticParams() {
  const file = await fs.readFile(process.cwd() + '/src/app/mock/models/data.json', 'utf8');
  const models = JSON.parse(file);

  return models.map((model: ModelMetadata) => ({
    slug: model.id
  }));
}

export default async function ModelPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;

  // Fetch models to populate sidenav
  const modelsFile = await fs.readFile(process.cwd() + '/src/app/mock/models/data.json', 'utf8');
  const models = JSON.parse(modelsFile);

  // Fetch current model metadata
  const metadataFile = await fs.readFile(process.cwd() + `/src/app/mock/${slug}/metadata/data.json`, 'utf8');
  const metadata = JSON.parse(metadataFile);

  return (
    <Flex height="100%" width="100%">
      <SideNav models={models} currentSlug={slug} />
      <Box id='main-panel' width='full' height="100%">
        <Suspense>
          <MainPanel modelData={metadata} />
        </Suspense>
      </Box>
    </Flex>
  );
}
