import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { useAuth } from "@/utils/context/auth";
import { fetchModels, byPresentationOrder } from "@/utils/data-transformation";
import { type ModelGroupMetadata } from "@/app/types";

export function useModels(
  options?: Omit<UseQueryOptions<ModelGroupMetadata[], Error, ModelGroupMetadata[]>, "queryKey" | "queryFn" | "select">
) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["models", token],
    queryFn: ({ signal }) => fetchModels(signal, token),
    select: (data) => data.toSorted(byPresentationOrder),
    ...options,
  });
}
