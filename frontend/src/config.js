import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

export default {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || (isNative ? 'http://10.0.2.2:8001/api' : 'http://localhost:8001/api'),
  
  reverb: {
    key: import.meta.env.VITE_REVERB_APP_KEY || 'tfw1crlcln6t1ppggslj',
    host: import.meta.env.VITE_REVERB_HOST || (isNative ? '10.0.2.2' : 'localhost'),
    port: parseInt(import.meta.env.VITE_REVERB_PORT || '8081'),
    scheme: import.meta.env.VITE_REVERB_SCHEME || 'http',
  }
};