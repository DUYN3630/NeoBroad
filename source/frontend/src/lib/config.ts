const rawApiUrl = import.meta.env.VITE_API_BASE_URL;

export const BACKEND_URL = rawApiUrl 
  ? rawApiUrl.replace(/\/api\/v1\/?$/, '') 
  : 'http://localhost:5054';

export const API_BASE_URL = rawApiUrl
  ? (rawApiUrl.endsWith('/api/v1') || rawApiUrl.endsWith('/api/v1/') 
      ? rawApiUrl 
      : `${rawApiUrl.replace(/\/$/, '')}/api/v1`)
  : 'http://localhost:5054/api/v1';
