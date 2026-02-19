'use client';

import Link from 'next/link';
import { Card } from '@/components/chakra';
import {
  useQuery
} from '@tanstack/react-query';
import { slugify } from '@/utils/data-transformation';
import { fetchModels } from '@/utils/data-transformation';
import { SimpleGrid } from '@chakra-ui/react';

export default function ModelCards() {

  const { data: models } = useQuery({
    queryKey: ['models'],
    queryFn: ({ signal }) => fetchModels(signal),
  });

  return (
    <SimpleGrid columns={3} py={6} gap={6}>
      {models?.map(e =>
        <Link key={e.id} href ={`/model/${slugify(e.name)}`}>
          <Card title={e.name} description = {e.description} />
        </Link>
        )}
    </SimpleGrid>
  );
}
