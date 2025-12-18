
import { createContext, useContext, ReactNode } from 'react';
import { useQueryStates } from 'nuqs';
import { useFilterConfig } from '@/utils/hooks/use-filter-config';
// import { useFilterConfig } from '../filters/useFilterConfig';

type FilterContextType = {
  filters: Record<string, any>;
  setFilters: (updates: Record<string, any>) => void;
  filterConfigs: Filter[];
  isLoading: boolean;
  // Derived state
  hasActiveFilters: boolean;
  clearAllFilters: () => void;
};

const FilterContext = createContext<FilterContextType | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const { filterConfigs, parsers, isLoading } = useFilterConfig();
  const [filters, setFilters] = useQueryStates(parsers, {
    history: 'replace',
  });

  // Derived state
  const hasActiveFilters = Object.values(filters).some(value => {
    if (Array.isArray(value)) return value.length > 0;
    return value !== '' && value !== null && value !== undefined;
  });

  const clearAllFilters = () => {
    const resetState = Object.keys(parsers).reduce((acc, key) => {
      acc[key] = null;
      return acc;
    }, {} as Record<string, null>);
    setFilters(resetState);
  };

  return (
    <FilterContext.Provider
      value={{
        filters,
        setFilters,
        filterConfigs,
        isLoading,
        hasActiveFilters,
        clearAllFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within FilterProvider');
  }
  return context;
};