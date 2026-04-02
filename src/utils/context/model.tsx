'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { ModelMetadata } from '@/app/types';

type ModelContextType = {
  model: ModelMetadata;
  scenarioId: string;
  setScenarioId: (param: string) => void;
};

const ModelContext = createContext<ModelContextType | null>(null);

export function ModelProvider({
  model,
  scenarioId,
  setScenarioId,
  children
}: {
  model: ModelMetadata;
  scenarioId: string;
  setScenarioId: (param: string) => void;
  children: ReactNode;
}) {
  const value = useMemo(() => ({
    model,
    scenarioId,
    setScenarioId,
  }), [model, scenarioId, setScenarioId]);

  return (
    <ModelContext.Provider value={value}>
      {children}
    </ModelContext.Provider>
  );
}

export const useModel = () => {
  const context = useContext(ModelContext);
  if (!context) {
    throw new Error('useModel must be used within ModelProvider');
  }
  return context;
};
