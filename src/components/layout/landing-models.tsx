'use client';

import Link from 'next/link';
import { Card } from '@/components/chakra';
import {
  useQuery
} from '@tanstack/react-query';
import { fetchModels } from '@/utils/data-transformation';
import { SimpleGrid } from '@chakra-ui/react';

export default function ModelCards() {

  const { data: models } = useQuery({
    queryKey: ['models'],
    queryFn: fetchModels,
  });

  return (
    <SimpleGrid columns={3} padding={2} gap={2}>
      {models?.map(e =>
        <Link key={e.id} href ={`/model/${e.id}`}>
          <Card title={e.name} description = {e.description} />
        </Link>
        )}
    </SimpleGrid>
  );
}
