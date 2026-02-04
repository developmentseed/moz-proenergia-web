import axios from 'axios';

export const API_ENDPOINT = 'https://proenergia-staging.ds.io/api/v1/';
export const MEDIA_URL_PREFIX = 'https://proenergia-staging.ds.io/media/';

export const api = axios.create({
  baseURL: API_ENDPOINT,
  timeout: 6000,
});
