'use client';

import { type ChangeEvent } from 'react';
import { Text, Box, Heading } from "@chakra-ui/react";
import { Select } from '@/components/chakra';
import { Control as ControlPanel } from './control';
import { useModel } from "@/utils/context/model";

const ControlPanelWidth = 350;
const AnimationTime = '0.3s';

const MainPanel = ({ isOpen }: { isOpen: boolean }) => {
  const { model, scenarioId, setScenarioId } = useModel();

  const onChange = (e:ChangeEvent<HTMLSelectElement >) => {
    setScenarioId(e.target.value);
  };
  const scenarioItems = model.scenarios.map(s => ({
    value: s.id,
    label: s.label,
    description: s.description
  }));

  return ( <Box
    position="relative"
    height='full'
    transition={`width ${AnimationTime} ease`}
    width={isOpen ? ControlPanelWidth : 0}
            >
    <Box width={ControlPanelWidth} height='full' overflowY='auto' boxShadow='md'>
      <Box mb={4} mt={2} p={4}>
        <Text fontFamily='heading' textTransform='uppercase'>Model</Text>
        <Heading as={'h2'}> {model.title} </Heading>
        <Select title={'Scenario'} items={scenarioItems} value={scenarioId} onChange={onChange} />
      </Box>
      <ControlPanel />
    </Box>
  </Box>);
};

export default MainPanel;