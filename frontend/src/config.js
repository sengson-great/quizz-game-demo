export default {
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
    reverb: {
        key: import.meta.env.VITE_REVERB_APP_KEY || 'tfw1crlcln6t1ppggslj',
        host: import.meta.env.VITE_REVERB_HOST || 'localhost',
        port: parseInt(import.meta.env.VITE_REVERB_PORT || '8081'),
        scheme: import.meta.env.VITE_REVERB_SCHEME || 'http',
    }
};
