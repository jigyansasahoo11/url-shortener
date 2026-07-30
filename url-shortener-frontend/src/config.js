// src/config.js
export const API_BASE_URL = import.meta.env.VITE_API_URL;
export const SHORT_URL_DISPLAY = API_BASE_URL.replace(/^https?:\/\//, '');