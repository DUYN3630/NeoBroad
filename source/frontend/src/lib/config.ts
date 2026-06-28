export const BACKEND_URL = import.meta.env.VITE_API_BASE_URL 
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/v1\/?$/, '') 
  : 'http://localhost:5054';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5054/api/v1';
