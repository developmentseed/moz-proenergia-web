import Link from 'next/link';
import { promises as fs } from 'fs';
import { HStack, Box } from "@chakra-ui/react";
import Sidebar from '@/components/ui/sidebar';

export default async function ModelPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
    const { slug } = await params

  const metadataFile = await fs.readFile(process.cwd() + `/src/app/mock/${slug}/metadata/data.json`, 'utf8');
  const metadata = JSON.parse(metadataFile);

  const defScenario = metadata.scenarios[0];
  const defScenarioFile = await fs.readFile(process.cwd() + `/src/app/mock/${slug}/${defScenario.id}/metadata/data.json`, 'utf8');
  const defScenarioData = JSON.parse(defScenarioFile);

  return (
      <HStack width={'100vw'} height='full'>
          <Box width={350} height='full' p={2}> 
            <Sidebar slug={slug} modelMetadata={metadata} scenarioMetadata={defScenarioData}></Sidebar>
          </Box>
          <Box width={'calc(100vw - 350px)'} height='full'>Map</Box>
      </HStack>
  );
}
