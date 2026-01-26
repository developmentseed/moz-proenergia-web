'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { ModelProvider } from '@/utils/context/model';
import { Flex, Box, IconButton } from '@chakra-ui/react';
import { ModelMetadata, Filter } from '@/app/types';
import MainMap from '@/components/map';
import { LuPanelRightOpen, LuPanelLeftOpen } from 'react-icons/lu';

import MainPanel from './main-panel';

const queryClient = new QueryClient();
const ControlPanelWidth = 350;
const AnimationTime = '0.3s';

// Global label type
interface GlobalLabel {
  column: string;
  type: string;
  label: string;
  description?: string;
  unit?: string;
  options?: Array<{ value: string; label: string }>;
}

// Fetch metadata and merge options from separate files (for client-side refetch)
async function fetchModelData(slug: string): Promise<ModelMetadata> {
  const metadataPath = `/mock/${slug}/metadata`;
  const filtersPath = `/mock/${slug}/filters`;

  // Fetch main metadata and global labels in parallel
  const [metadataRes, globalLabelsRes] = await Promise.all([
    fetch(`${metadataPath}/data.json`),
    fetch('/config/global-label.json')
  ]);

  if (!metadataRes.ok) throw new Error('Failed to fetch metadata');
  const metadata: ModelMetadata = await metadataRes.json();

  // Build global labels lookup map by column
  let globalLabelsMap: Map<string, GlobalLabel> = new Map();
  if (globalLabelsRes.ok) {
    const globalLabels: GlobalLabel[] = await globalLabelsRes.json();
    globalLabelsMap = new Map(globalLabels.map(item => [item.column, item]));
  }

  // Helper to fetch filter options/values file
  const fetchFilterData = async (column: string) => {
    try {
      const res = await fetch(`${filtersPath}/${column}.json`);
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  };

  // Fetch main attribute options
  if (metadata.main?.column) {
    const mainOptions = await fetchFilterData(metadata.main.column);
    if (mainOptions) metadata.main.options = mainOptions;
  }

  // Fetch all filter options/values in parallel
  const filterDataPromises = (metadata.filters || []).map((filter: Filter) => {
    if (filter.column) {
      return fetchFilterData(filter.column);
    }
    return Promise.resolve(null);
  });

  const filterData = await Promise.all(filterDataPromises);

  // Three-way merge: metadata filters + fetched options + global labels
  metadata.filters = metadata.filters.map((filter, index) => {
    const globalLabel = globalLabelsMap.get(filter.column);
    const fetchedOptions = filterData[index];

    return {
      ...filter,
      // Merge global label data (label, description, unit)
      ...(globalLabel && { ...globalLabel }),
      // Merge fetched options (overrides global label options if present)
      ...(fetchedOptions && { options: fetchedOptions }),
    };
  });

  return metadata;
}

const ExplorerContent = ({ modelData }: { modelData: ModelMetadata }) => {
  const [isOpen, setIsOpen] = useState(true);

  // Use SSG data as initial, can refetch client-side when needed
  const { data } = useQuery({
    queryKey: ['modelData', modelData.id],
    queryFn: () => fetchModelData(modelData.id),
    // initialData: modelData, // Start with data fetched from static generation
    staleTime: Infinity, // Don't auto-refetch, only refetch when manually triggered
  });

  const currentData = data ?? modelData;

  return (
    <ModelProvider model={currentData}>
      <Flex id='container' width="full" height='full' position="relative">
        <MainPanel isOpen={isOpen} />
        {/* Toggle Button Tab */}
        <Box
          position="absolute"
          left={isOpen ? ControlPanelWidth : 0}
          top="8"
          transform="translateY(-50%)"
          zIndex={1000}
          transition={`left ${AnimationTime} ease`}
          border='1px solid'
          borderColor='panelBorder'
          borderLeft='none'
        >
          <IconButton
            aria-label={isOpen ? 'Collapse panel' : 'Expand panel'}
            onClick={() => setIsOpen(!isOpen)}
            variant="solid"
            size="sm"
            bg='panelBg'
            borderLeft='none'
            borderRadius={0}
          >
            {isOpen ? <LuPanelRightOpen stroke='gray' /> : <LuPanelLeftOpen stroke='gray' />}
          </IconButton>
        </Box>

        <Box transition={`width ${AnimationTime} ease`} height='full' width='full'>
          <MainMap main={currentData.main} />
        </Box>
      </Flex>
    </ModelProvider>
  );
};

const Explorer = ({ modelData }: { modelData: ModelMetadata }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ExplorerContent modelData={modelData} />
    </QueryClientProvider>
  );
};

export default Explorer;