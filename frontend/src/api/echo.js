import Echo from 'laravel-echo';
import windowPusher from 'pusher-js';
import config from '../config';

window.Pusher = windowPusher;

const echo = new Echo({
    broadcaster: 'reverb',
    key: config.reverb.key,
    wsHost: config.reverb.host,
    wsPort: config.reverb.port,
    wssPort: config.reverb.port,
    forceTLS: config.reverb.scheme === 'https',
    enabledTransports: ['ws', 'wss'],
    // Use the auth endpoint on the backend
    authEndpoint: `${config.apiBaseUrl}/broadcasting/auth`,
    auth: {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
            Accept: 'application/json',
        },
    },
});

export const updateEchoAuthToken = (token) => {
    if (echo.connector && echo.connector.options) {
        echo.connector.options.auth.headers.Authorization = `Bearer ${token}`;
    }
};

export default echo;
