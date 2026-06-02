import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();
const platform = Capacitor.getPlatform();

const getApiUrl = () => {
  let envUrl = import.meta.env.VITE_API_BASE_URL;
  // If absolute URL is provided in env, use it directly
  if (envUrl && envUrl.startsWith('http')) {
    envUrl = envUrl.replace(/\/$/, '');
    if (!envUrl.endsWith('/api')) {
      envUrl += '/api';
    }
    return envUrl;
  }
  
  // If running natively and no absolute URL env is defined, fallback to production server
  if (isNative) {
    return 'https://parlerbien.xyz/api';
  }
  
  return '/api';
};

const getReverbHost = () => {
  if (isNative) {
    return import.meta.env.VITE_REVERB_HOST || 'parlerbien.xyz';
  }
  
  const host = window.location.hostname;
  const envHost = import.meta.env.VITE_REVERB_HOST;
  
  // If we are on a remote hostname (not localhost / local IP) but the env host is set to localhost,
  // we must ignore 'localhost' and connect to the actual host we are accessing the app from.
  if (envHost && envHost !== 'localhost' && envHost !== '127.0.0.1') {
    return envHost;
  }
  
  return host;
};

const getReverbPort = () => {
  if (isNative) {
    return parseInt(import.meta.env.VITE_REVERB_PORT || '443');
  }
  
  const isHttps = window.location.protocol === 'https:';
  const envPort = import.meta.env.VITE_REVERB_PORT;
  
  // Under HTTPS, we must connect using secure port 443 unless a specific non-8081 port is specified
  if (isHttps) {
    if (envPort && envPort !== '8081') {
      return parseInt(envPort);
    }
    return 443;
  }
  
  return parseInt(envPort || '8081');
};

const getReverbScheme = () => {
  if (isNative) {
    return import.meta.env.VITE_REVERB_SCHEME || 'https';
  }
  
  const isHttps = window.location.protocol === 'https:';
  if (isHttps) {
    return 'https';
  }
  
  return import.meta.env.VITE_REVERB_SCHEME || 'http';
};

const API_BASE_URL = getApiUrl();
const REVERB_HOST = getReverbHost();
const REVERB_PORT = getReverbPort();
const REVERB_SCHEME = getReverbScheme();

export default {
  apiBaseUrl: API_BASE_URL,

  reverb: {
    key: import.meta.env.VITE_REVERB_APP_KEY || 'tfw1crlcln6t1ppggslj',
    host: REVERB_HOST,
    port: REVERB_PORT,
    scheme: REVERB_SCHEME,
  }
};