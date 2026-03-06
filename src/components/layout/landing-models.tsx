'use client';

import { useState } from 'react';
import { Button } from "@chakra-ui/react";
import { Card } from '@/components/chakra';
import NextLink from "next/link";
import { ChakraDrawer } from '@/components/chakra/drawer';
import {
  useQuery
} from '@tanstack/react-query';
import { slugify } from '@/utils/data-transformation';
import { fetchModels } from '@/utils/data-transformation';
import { SimpleGrid, Text, Box } from '@chakra-ui/react';
import { DrawerSummaryTable } from './drawer-summary-table';

export default function ModelCards() {
  const [selectedModel, setSelectedModel] = useState<{ id: string; name: string; description: string; slug: string } | null>(null);

  const { data: models } = useQuery({
    queryKey: ['models'],
    queryFn: ({ signal }) => fetchModels(signal),
  });

  return (
    <>
      <SimpleGrid columns={2} py={6} gap={6}>
        {models?.map(e => (
          <div key={e.id} onClick={() => setSelectedModel({ id: String(e.id), name: e.name, description: e.description, slug: slugify(e.name) })} style={{ cursor: 'pointer' }}>
            <Card title={e.name} description={e.description} />
          </div>
        ))}
      </SimpleGrid>

      {selectedModel && (
        <ChakraDrawer
          title={selectedModel.name}
          open={!!selectedModel}
          onOpenChange={(details) => {
            if (!details.open) setSelectedModel(null);
          }}
          triggerContent={null}
          drawerContent={
            <Box>
              <Text pb={2}>{selectedModel.description || "Description for Model"}</Text>
              <DrawerSummaryTable modelId={selectedModel.id} />
            </Box>
          }
          drawerFooterContent={
            <Button asChild>
              <NextLink href={`/model/${selectedModel.slug}`}>
                Go to Explorer
              </NextLink>
            </Button>
          }
        />
      )}
    </>
  );
}
