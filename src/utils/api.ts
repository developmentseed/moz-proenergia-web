import axios from 'axios';

export const API_ENDPOINT = 'https://proenergia-staging.ds.io/api/v1/';
export const MEDIA_URL_PREFIX = 'https://proenergia-staging.ds.io/media/';

//@TODO
export const STALE_TIME = 600000; // 1 hour

export const DEFAULT_COL = 'default';

export const api = axios.create({
  baseURL: API_ENDPOINT,
  timeout: 15000,
});
