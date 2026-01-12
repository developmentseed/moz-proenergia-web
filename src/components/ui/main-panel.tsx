'use client';

import { type ChangeEvent } from 'react';
import { useQueryState, parseAsString } from 'nuqs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ModelProvider } from '@/utils/context/model';
import { Box, Heading } from "@chakra-ui/react";
import { Select } from '@/components/chakra';
import { Control as ControlPanel } from './control';
import { ModelMetadata } from '@/app/types';
import MainMap from '@/components/map';

const queryClient = new QueryClient();

const MainPanel = ({ modelData }: { modelData: ModelMetadata }) => {

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
        <Box width={350} height='full' p={2}>
          <Heading as={'h2'}> {modelData.title} </Heading>
          <Select title={'Scenario'} items={scenarioItems} value={scenario} onChange={setScenarioId} />
          <ControlPanel />
        </Box>
        <Box width={'calc(100vw - 350px)'} height='full'><MainMap scenario={currentScenario} main={modelData.main} /></Box>
      </QueryClientProvider>
    </ModelProvider>
  );
};

export default MainPanel;