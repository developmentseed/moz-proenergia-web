import { Suspense } from 'react';
import { promises as fs } from 'fs';
import { Flex, Box } from "@chakra-ui/react";
import Explorer from '@/components/ui/explorer';
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

  // const basePath = process.cwd() + `/src/app/mock/${slug}/metadata`;

  // Reading options value files: will need to be replaced by requests to backend
  const readOptionsFile = async (column: string) => {
    try {
      const file = await fs.readFile(process.cwd() + `/src/app/mock/${slug}/filters/${column}.json`, 'utf8');
      return JSON.parse(file);
    } catch {
      return null;
    }
  };

  // Fetch main attribute options
  if (metadata.main?.column) {
    const mainOptions = await readOptionsFile(metadata.main.column);
    if (mainOptions) metadata.main.options = mainOptions;
  }

  // Fetch all filter options in parallel
  const filterOptionsPromises = (metadata.filters || []).map(async (filter: { column?: string }) => {
    if (filter.column) {
      return readOptionsFile(filter.column);
    }
    return null;
  });

  const filterData = await Promise.all(filterOptionsPromises);

  metadata.filters = metadata.filters.map((filter, index) => {
    if (filterData[index]) {
      const options = filterData[index];
      return {
        ...filter,
        options
      };
    } else {
      // @ TO DO: break?
      return filter;
    }
  });

  return (
    <Flex height="100%" width="100%">
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
