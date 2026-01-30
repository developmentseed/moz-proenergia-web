import { Shell } from "@/components/layout/shell";
import { DownloadList } from "./download-list";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { fetchVectors } from "@/utils/data-transformation";

export default async function Page() {

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['vector'],
    queryFn: () => fetchVectors()
  });

  return (
    <Shell breadcrumb={[{ label: "Downloads" }]}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <DownloadList />
      </HydrationBoundary>
    </Shell>
  );
}
