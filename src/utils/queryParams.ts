'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export type QueryParams = Record<string, string | string[] | undefined>;

/**
 * Parse URLSearchParams into a plain object
 */
export function parseQueryParams(searchParams: URLSearchParams): QueryParams {
  const params: QueryParams = {};

  searchParams.forEach((value, key) => {
    const existing = params[key];
    if (existing === undefined) {
      params[key] = value;
    } else if (Array.isArray(existing)) {
      existing.push(value);
    } else {
      params[key] = [existing, value];
    }
  });

  return params;
}

/**
 * Create URLSearchParams from a plain object
 */
export function createQueryString(params: QueryParams): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(v => searchParams.append(key, v));
    } else {
      searchParams.set(key, String(value));
    }
  });

  return searchParams.toString();
}

/**
 * Hook for managing query parameters
 */
export function useQueryParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentParams = parseQueryParams(searchParams);

  /**
   * Update query parameters by merging with current params
   */
  const updateQueryParams = useCallback(
    (updates: QueryParams, options?: { replace?: boolean; scroll?: boolean }) => {
      const newParams = { ...currentParams, ...updates };

      // Remove undefined/null values
      Object.keys(newParams).forEach(key => {
        if (newParams[key] === undefined || newParams[key] === null) {
          delete newParams[key];
        }
      });

      const queryString = createQueryString(newParams);
      const url = queryString ? `${pathname}?${queryString}` : pathname;

      if (options?.replace) {
        router.replace(url, { scroll: options.scroll ?? false });
      } else {
        router.push(url, { scroll: options.scroll ?? false });
      }
    },
    [currentParams, pathname, router]
  );

  /**
   * Set query parameters (replaces all existing params)
   */
  const setQueryParams = useCallback(
    (params: QueryParams, options?: { replace?: boolean; scroll?: boolean }) => {
      const queryString = createQueryString(params);
      const url = queryString ? `${pathname}?${queryString}` : pathname;

      if (options?.replace) {
        router.replace(url, { scroll: options.scroll ?? false });
      } else {
        router.push(url, { scroll: options.scroll ?? false });
      }
    },
    [pathname, router]
  );

  /**
   * Remove specific query parameters
   */
  const removeQueryParams = useCallback(
    (keys: string[], options?: { replace?: boolean; scroll?: boolean }) => {
      const newParams = { ...currentParams };
      keys.forEach(key => delete newParams[key]);

      const queryString = createQueryString(newParams);
      const url = queryString ? `${pathname}?${queryString}` : pathname;

      if (options?.replace) {
        router.replace(url, { scroll: options.scroll ?? false });
      } else {
        router.push(url, { scroll: options.scroll ?? false });
      }
    },
    [currentParams, pathname, router]
  );

  /**
   * Clear all query parameters
   */
  const clearQueryParams = useCallback(
    (options?: { replace?: boolean; scroll?: boolean }) => {
      if (options?.replace) {
        router.replace(pathname, { scroll: options.scroll ?? false });
      } else {
        router.push(pathname, { scroll: options.scroll ?? false });
      }
    },
    [pathname, router]
  );

  /**
   * Get a specific query parameter value
   */
  const getQueryParam = useCallback(
    (key: string): string | string[] | undefined => {
      return currentParams[key];
    },
    [currentParams]
  );

  return {
    params: currentParams,
    updateQueryParams,
    setQueryParams,
    removeQueryParams,
    clearQueryParams,
    getQueryParam,
  };
}
