'use client';

import { useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { ModelProvider } from '@/utils/context/model';
import { Flex, Box, IconButton, Skeleton } from '@chakra-ui/react';
import MainMap from '@/components/map';
import { LuPanelRightOpen, LuPanelLeftOpen } from 'react-icons/lu';
import { getModelData } from '@/utils/data-transformation';
import MainPanel from './main-panel';

const ControlPanelWidth = 350;
const AnimationTime = '0.3s';

const ExplorerContent = ({ modelId }: { modelId: string }) => {
  const [isOpen, setIsOpen] = useState(true);

  const { data } = useQuery({
    queryKey: ['model', modelId],
    queryFn: () => getModelData(modelId),
  });

  if (!data) {
    return (
      <Flex id='container' width="full" height='full' position="relative">
        <Skeleton width={ControlPanelWidth} height='full' />
        <Box flex={1} height='full' p={2}>
          <Skeleton width='full' height='full' />
        </Box>
      </Flex>
    );
  }

  return (
    <ModelProvider model={data}>
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
          <MainMap main={data.main} />
        </Box>
      </Flex>
    </ModelProvider>
  );
};

export default ExplorerContent;
