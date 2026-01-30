import Link from 'next/link';
import { Shell } from '@/components/layout/shell';
import { SimpleGrid } from "@chakra-ui/react";
import { Card } from '@/components/chakra';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { fetchModels } from '@/utils/data-transformation';
import { ModelGroupMetadata } from './types';
import ModelCards from '@/components/layout/landing-models';

export default async function Home() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['models'],
    queryFn: fetchModels,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Shell>
        <ModelCards />
      </Shell>
    </HydrationBoundary>
  );
}
