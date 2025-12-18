'use client'
// filters/useFilterConfig.ts - Shared hook for filter configuration
import { useState, useEffect } from 'react';
import { parseAsArrayOf, parseAsString, parseAsInteger } from 'nuqs';

export const useFilterConfig = () => {
  const [filterConfigs, setFilterConfigs] = useState<Filter[]>([]);
  const [parsers, setParsers] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/filters')
      .then(res => res.json())
      .then((configs: Filter[]) => {
        setFilterConfigs(configs);
        setParsers(createFilterParsers(configs));
        setIsLoading(false);
      });
  }, []);

  return { filterConfigs, parsers, isLoading };
};

const createFilterParsers = (configs: Filter[]) => {
  const parsers: Record<string, any> = {};
  
  configs.forEach(config => {
    switch (config.type) {
      case 'numeric':
        parsers[config.id] = parseAsArrayOf(parseAsInteger)
          .withDefault(config.values);
        break;
      case 'option':
        parsers[config.id] = parseAsString.withDefault('');
        break;
      case 'categorical':
        parsers[config.id] = parseAsArrayOf(parseAsString)
          .withDefault([]);
        break;
    }
  });
  
  return parsers;
};