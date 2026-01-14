'use client';

import { type ChangeEvent, useState } from 'react';
import { useQueryState, parseAsString } from 'nuqs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ModelProvider } from '@/utils/context/model';
import { Flex, Box, Heading, IconButton, Collapsible } from "@chakra-ui/react";
import { Select } from '@/components/chakra';
import { Control as ControlPanel } from './control';
import { ModelMetadata } from '@/app/types';
import MainMap from '@/components/map';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

const queryClient = new QueryClient();
const ControlPanelWidth = 350;
const AnimationTime = '0.3s';
const MainPanel = ({ modelData }: { modelData: ModelMetadata }) => {
    const [isOpen, setIsOpen] = useState(true);

    const initialScenario = modelData.scenarios[0];
    const [scenario, setScenario] = useQueryState(
    'scenario',
    parseAsString.withDefault(initialScenario.id)
  );

  const currentScenario = modelData.scenarios.find(s => s.id === scenario)!;
  const setScenarioId = (e:ChangeEvent<HTMLSelectElement >) => {
    setScenario(e.target.value);
  };
  const scenarioItems = modelData.scenarios.map(s => ({
    value: s.id,
    label: s.label,
    description: s.description
  }));

  return (
    <ModelProvider model={modelData}>
      <QueryClientProvider client={queryClient}>
        <Flex width="full" height='full' position="relative">
          <Box
            position="relative"
            height='full'
            transition={`width ${AnimationTime} ease`}
            width={isOpen ? ControlPanelWidth : 0}
          >
            <Box width={ControlPanelWidth} height='full' p={2}>
              <Heading as={'h2'}> {modelData.title} </Heading>
              <Select title={'Scenario'} items={scenarioItems} value={scenario} onChange={setScenarioId} />
              <ControlPanel />
            </Box>
          </Box>

          {/* Toggle Button Tab */}
          <Box
            position="absolute"
            left={isOpen ? ControlPanelWidth : 0}
            top="8"
            transform="translateY(-50%)"
            zIndex={1000}
            transition={`left ${AnimationTime} ease`}
          >
            <IconButton
              aria-label={isOpen ? "Collapse panel" : "Expand panel"}
              onClick={() => setIsOpen(!isOpen)}
              size="sm"
              bg="gray.200"
              _hover={{ bg: "gray.300" }}
              borderLeftRadius={0}
            >
              {isOpen ? <HiChevronLeft /> : <HiChevronRight />}
            </IconButton>
          </Box>

          <Box transition={`width ${AnimationTime} ease`} height='full' width='full'><MainMap scenario={currentScenario} main={modelData.main} /></Box>
        </Flex>
      </QueryClientProvider>
    </ModelProvider>
  );
};

export default MainPanel;