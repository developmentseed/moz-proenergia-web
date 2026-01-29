import Link from 'next/link';
import { Shell } from '@/components/layout/shell';
import { SimpleGrid } from "@chakra-ui/react";
import { Card } from '@/components/chakra';
import { fetchModels } from '@/utils/data-transformation';

export default async function Home() {
  const models = await fetchModels();
  return (
    <Shell>
      <SimpleGrid columns={3} padding={2} gap={2}>
        {models.map(e =>
          <Link key={e.id} href ={`/model/${e.id}`}>
            <Card title={e.name} description = {e.description} />
          </Link>
      )}
      </SimpleGrid>
    </Shell>
  );
}
