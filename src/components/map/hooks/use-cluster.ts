'use client';
import { useQueryState, parseAsString } from 'nuqs';

export function useCluster() {
  const [clusterId, setClusterId] = useQueryState('cluster', parseAsString);

  return {
    clusterId,
    setClusterId,
  };
}
