
import { Suspense } from 'react';
import { promises as fs } from 'fs';
import { HStack } from "@chakra-ui/react";
import MainPanel from '@/components/ui/main-panel';
import { ModelMetadata } from '@/app/types';

// For dynamic route + ssg: fetch all the possible params
export async function generateStaticParams() {
  const file = await fs.readFile(process.cwd() + '/src/app/mock/models/data.json', 'utf8');
  const models = JSON.parse(file);

  return models.map((model: ModelMetadata) => ({
    slug: model.id
  }))
}

export default async function ModelPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  const metadataFile = await fs.readFile(process.cwd() + `/src/app/mock/${slug}/metadata/data.json`, 'utf8');
  const metadata = JSON.parse(metadataFile);
  
  return (
      <HStack width={'100vw'} height='full'>
        <Suspense>
          <MainPanel modelData={metadata} />
        </Suspense>
      </HStack>
  );
}
