import { Shell } from '@/components/layout/shell';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { fetchModels } from '@/utils/data-transformation';
import ModelCards from '@/components/layout/landing-models';

export default async function ModelsPage() {
  // Disable prefetching for now so models can reflect the names right away
  // const queryClient = new QueryClient();

  // await queryClient.prefetchQuery({
  //   queryKey: ['models'],
  //   queryFn: ({ signal }) => fetchModels(signal),
  // });

  // const models = await fetchModels();

  return (
    <Shell>
      <ModelCards />
    </Shell>

  );
}
