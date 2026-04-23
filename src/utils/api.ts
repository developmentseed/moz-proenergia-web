import axios from 'axios';

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
  if (error.response?.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('cache_date');
    // Full navigation clears React state; the header will reflect logged-out status
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.location.reload();
    }
  } else if ((error.response?.status ?? 0) >= 500) {
    console.error(`[API] Server error ${error.response!.status}:`, error.config?.url);
  }
  return Promise.reject(error);
}

api.interceptors.response.use((response) => response, handleApiError);
