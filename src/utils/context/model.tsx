'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useQueryState, parseAsString } from 'nuqs';
import { ModelMetadata } from '@/app/types';

type ModelContextType = {
  model: ModelMetadata;
  scenarioId: string;
  setScenarioId: (param: string) => void;
};

const ModelContext = createContext<ModelContextType | null>(null);

export function ModelProvider({
  model,
  children
}: {
  model: ModelMetadata;
  children: ReactNode;
}) {
  const initialScenario = model.scenarios[0];
  const [scenarioId, setScenarioId] = useQueryState('scenario', parseAsString.withDefault(initialScenario.id));

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
