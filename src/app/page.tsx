import { Shell } from '@/components/layout/shell';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { fetchModels } from '@/utils/data-transformation';

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
