import axios from 'axios';
import { toaster } from '@/components/chakra/toaster';
import i18next from 'i18next';

export const API_ENDPOINT = 'https://proenergia-staging.ds.io/api/v1/';
export const MEDIA_URL_PREFIX = 'https://proenergia-staging.ds.io/media/';

//@TODO
export const STALE_TIME = 600000; // 1 hour
export const CONCURRENCY_NUM = 3;
export const DEFAULT_COL = 'default';

export const api = axios.create({
  baseURL: API_ENDPOINT,
  timeout: 30000,
});

export function handleApiError(error: {
  response?: { status: number };
  config?: { url?: string };
}): Promise<never> {
  if (error.response?.status === 403) {
    toaster.create({
      type: "error",
      title: i18next.t('error.accessDeniedTitle'),
      description: i18next.t('error.accessDeniedDescription'),
    });
  } else if ((error.response?.status ?? 0) >= 500) {
    console.error(`[API] Server error ${error.response!.status}:`, error.config?.url);
  }
  return Promise.reject(error);
}

api.interceptors.response.use((response) => response, handleApiError);
