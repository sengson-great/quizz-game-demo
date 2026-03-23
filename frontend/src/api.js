
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    withCredentials: true,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
});

api.interceptors.request.use(config => {
    const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];
        
    if (token) {
        config.headers['X-XSRF-TOKEN'] = decodeURIComponent(token);
    }

    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
        config.headers['Authorization'] = `Bearer ${accessToken}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Clear local storage or state if persisted
            // Redirect to login or refresh page
            // Since we can't easily access React state or router here without ejection, 
            // we'll let the component handle it or trigger a window event.
            // For now, we'll just return the rejection.
             if (window.location.pathname !== '/' && window.location.pathname !== '/register') {
                 window.location.href = '/'; 
             }
        }
        return Promise.reject(error);
    }
);

export default api;
