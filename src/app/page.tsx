import Link from 'next/link';
import { promises as fs } from 'fs';
import { Shell } from '@/components/layout/shell';
import { SimpleGrid } from "@chakra-ui/react";
import { Card } from '@/components/chakra';
import { type ModelGroupMetadata } from '@/app/types';

export default async function Home() {
  const file = await fs.readFile(process.cwd() + '/src/app/mock/models/data.json', 'utf8');
  const models = JSON.parse(file) as ModelGroupMetadata[];
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
