'use client';

import { useState } from 'react';
import { Button, Heading, Center, Spinner } from "@chakra-ui/react";
import { Card } from '@/components/chakra';
import ReactMarkdown from 'react-markdown';

import NextLink from "next/link";
import { ChakraDrawer } from '@/components/chakra/drawer';
import {
  useQuery
} from '@tanstack/react-query';
import { slugify, fetchModels } from '@/utils/data-transformation';
import { useTranslation } from 'react-i18next';
import { SimpleGrid, Text, Box } from '@chakra-ui/react';
import { DrawerSummaryTable } from './drawer-summary-table';
import { LuArrowRight } from 'react-icons/lu';

export default function ModelCards() {
  const { t } = useTranslation();
  const [selectedModel, setSelectedModel] = useState<{ id: string; name: string; description: string; slug: string } | null>(null);

  const { data: models } = useQuery({
    queryKey: ['models'],
    queryFn: ({ signal }) => fetchModels(signal),
  });
  console.log(models);

  return (
    <>
      <Heading size="3xl">Models</Heading>
      <SimpleGrid columns={{ base: 1, md: 2 }} py={6} gap={6} minChildWidth={{base: "none",md: "md"}}>
        {models?.map(e => (
          <div key={e.id} onClick={() => setSelectedModel({ id: String(e.id), name: t(`model.${e.id}.name`, { defaultValue: e.name }), description: t(`model.${e.id}.description`, { defaultValue: e.description }), slug: slugify(e.name) })} style={{ cursor: 'pointer' }}>
            <Card title={t(`model.${e.id}.name`, { defaultValue: e.name })} description={t(`model.${e.id}.description`, { defaultValue: e.description })} />
          </div>
        ))}
        {!models && <Center py={10}>
          <Spinner colorPalette="orange" color="colorPalette.600" size="xl" />
        </Center>}
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
              <ReactMarkdown
                components={{
                  p: ({ children }) => <Text pb={8}>{children}</Text>,
                }}
              >
                {selectedModel.description}
              </ReactMarkdown>
              <DrawerSummaryTable modelId={selectedModel.id} />
            </Box>
          }
          drawerFooterContent={
            <Button asChild variant="solid" colorPalette="orange">
              <NextLink href={`/model/${selectedModel.slug}`}>
                {t('models.exploreModel')}
                <LuArrowRight />
              </NextLink>
            </Button>
          }
        />
      )}
    </>
  );
}
