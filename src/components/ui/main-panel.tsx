'use client'

import { type ChangeEvent } from 'react';
import { useQueryState, parseAsString } from 'nuqs';
import { ModelProvider } from '@/utils/context/model';
import { Box, Heading } from "@chakra-ui/react";
import { Select } from '@/components/chakra';
import { Control as ControlPanel } from './control';
import { ModelMetadata } from '@/app/types';

const MainPanel = ({ modelData}: { modelData: ModelMetadata }) => {

    const initialScenario = modelData.scenarios[0];
    const [scenario, setScenario] = useQueryState(
    'scenario',
    parseAsString.withDefault(initialScenario.id)
  );

  const setScenarioId = (e:ChangeEvent<HTMLSelectElement >) => {
    setScenario(e.target.value);
  }

  return (
    <ModelProvider model={modelData}>
      <Box width={350} height='full' p={2}> 
        <Heading as={'h2'}> {modelData.title} </Heading>
          <Select title={'Scenario'} items={modelData.scenarios} value={scenario} onChange={setScenarioId} />
          <ControlPanel />
      </Box>
      <Box width={'calc(100vw - 350px)'} height='full'>Maps</Box>
  </ModelProvider>
  )
}

export default MainPanel;