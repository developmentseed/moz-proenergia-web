'use client';

import { useState, useEffect } from 'react';
import { Box, Heading, VStack, Container } from '@chakra-ui/react';
import { Scenario as ScenarioPanel } from './scenario';
import { Control as ControlPanel } from './control';
import { ItemUnit, ModelMetadata, ScenarioMetadata } from '@/app/types';

interface SidebarProps {
  slug: string;
  modelMetadata: ModelMetadata,
  scenarioMetadata: ScenarioMetadata
}


export default function Sidebar({ slug, modelMetadata, scenarioMetadata}: SidebarProps) {
  const [selectedScenario, setSelectedScenario] = useState<ItemUnit>(modelMetadata.scenarios[0]);
  const [scenarioData, setScenarioData] = useState<ScenarioMetadata>(scenarioMetadata);

  useEffect(() => {
    async function loadScenarioData() {
      const res = await fetch(`/mock/${slug}/${selectedScenario.id}/metadata/data.json`);
      const scenarioData = await res.json();
      setScenarioData(scenarioData);
    }
    loadScenarioData();
  },[slug, selectedScenario]);
  


  return <VStack>
    <Heading as={'h2'}> {modelMetadata.title} </Heading>
    <ScenarioPanel scenarios={modelMetadata.scenarios} onChange={setSelectedScenario}></ScenarioPanel>
    <ControlPanel scenarioData={scenarioData}></ControlPanel>
  </VStack>
}
