'use client';

import { useState } from 'react';
import { Card } from '@/components/chakra';
import { ChakraDrawer } from '@/components/chakra/drawer';
import {
  useQuery
} from '@tanstack/react-query';
import { slugify } from '@/utils/data-transformation';
import { fetchModels } from '@/utils/data-transformation';
import { SimpleGrid, Text } from '@chakra-ui/react';

export default function ModelCards() {
  const [selectedModel, setSelectedModel] = useState<{ name: string; description: string; slug: string } | null>(null);

  const { data: models } = useQuery({
    queryKey: ['models'],
    queryFn: ({ signal }) => fetchModels(signal),
  });

  return (
    <>
      <SimpleGrid columns={3} py={6} gap={6}>
        {models?.map(e => (
          <div key={e.id} onClick={() => setSelectedModel({ name: e.name, description: e.description, slug: slugify(e.name) })} style={{ cursor: 'pointer' }}>
            <Card title={e.name} description={e.description} />
          </div>
        ))}
      </SimpleGrid>

      {selectedModel && (
        <ChakraDrawer
          title={selectedModel.name}
          href={`/model/${selectedModel.slug}`}
          open={!!selectedModel}
          onOpenChange={(details) => {
            if (!details.open) setSelectedModel(null);
          }}
        >
          {selectedModel.description && (
            <Text color="fg.muted">{selectedModel.description}</Text>
          )}
        </ChakraDrawer>
      )}
    </>
  );
}
