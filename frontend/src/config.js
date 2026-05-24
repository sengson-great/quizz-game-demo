// import { Capacitor } from '@capacitor/core';

// const isNative = Capacitor.isNativePlatform();
// const platform = Capacitor.getPlatform();

// const getApiUrl = () => {
//   if (isNative) {
//     return platform === 'android' ? 'http://10.0.2.2:8001/api' : 'http://localhost:8001/api';
//   }
//   return import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL !== '/api'
//     ? import.meta.env.VITE_API_BASE_URL
//     : 'http://localhost:8001/api';
// };

// const getReverbHost = () => {
//   if (isNative) {
//     return platform === 'android' ? '10.0.2.2' : 'localhost';
//   }
//   return import.meta.env.VITE_REVERB_HOST || 'localhost';
// };

// export default {
//   apiBaseUrl: getApiUrl(),
  
//   reverb: {
//     key: import.meta.env.VITE_REVERB_APP_KEY || 'tfw1crlcln6t1ppggslj',
//     host: getReverbHost(),
//     port: parseInt(import.meta.env.VITE_REVERB_PORT || '8081'),
//     scheme: import.meta.env.VITE_REVERB_SCHEME || 'http',
//   }
// };

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL !== '/api'
    ? import.meta.env.VITE_API_BASE_URL
    : '/api';

const REVERB_HOST =
  import.meta.env.VITE_REVERB_HOST || window.location.hostname;

export default {
  apiBaseUrl: API_BASE_URL,

  reverb: {
    key: import.meta.env.VITE_REVERB_APP_KEY,
    host: REVERB_HOST,
    port: parseInt(import.meta.env.VITE_REVERB_PORT || '8081'),
    scheme: import.meta.env.VITE_REVERB_SCHEME || 'http',
  }
};