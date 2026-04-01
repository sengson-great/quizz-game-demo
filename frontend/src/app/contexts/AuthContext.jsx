import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';

const defaultAuthContext = {
    currentUser: null,
    loading: true,
    login: async () => false,
    register: async () => false,
    logout: async () => {},
    updateUser: () => {},
};

const AuthContext = createContext(defaultAuthContext);
const STORAGE_KEY = 'auth_token';
const SETTINGS_KEY = 'user_settings'; // persists frontend-only prefs across refreshes

// Load saved local settings (avatar, musicEnabled, etc.) and merge onto the user object
const loadSavedSettings = () => {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'); }
    catch { return {}; }
};
const applyDefaults = (user) => {
    const saved = loadSavedSettings();
    if (!user.avatar) user.avatar = saved.avatar || '🦊';
    if (!user.username) user.username = saved.username || user.name;
    if (user.totalScore === undefined) user.totalScore = 0;
    if (user.gamesPlayed === undefined) user.gamesPlayed = 0;
    if (user.wins === undefined) user.wins = 0;
    // Restore frontend-only settings
    user.soundEnabled = saved.soundEnabled ?? true;
    user.musicEnabled = saved.musicEnabled ?? true;
    user.language = saved.language || 'km';
    user.preferredCategories = saved.preferredCategories || [];
    return user;
};

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem(STORAGE_KEY);
            if (token) {
                try {
                    const response = await api.get('/user');
                    const user = applyDefaults(response.data);
                    setCurrentUser(user);
                } catch (error) {
                    console.error("Failed to fetch user", error);
                    localStorage.removeItem(STORAGE_KEY);
                }
            }
            setLoading(false);
        };
        fetchUser();
    }, []);

    const login = useCallback(async (email, password) => {
        try {
            const response = await api.post('/login', { email, password });
            const { user, token } = response.data;
            
            const loggedInUser = applyDefaults(user);

            localStorage.setItem(STORAGE_KEY, token);
            setCurrentUser(loggedInUser);
            return true;
        } catch (error) {
            console.error("Login Error:", error);
            return false;
        }
    }, []);

    const register = useCallback(async (username, email, password) => {
        try {
            const response = await api.post('/register', { 
                name: username, 
                email, 
                password, 
                password_confirmation: password 
            });
            const { user, token } = response.data;

            const registeredUser = applyDefaults(user);

            localStorage.setItem(STORAGE_KEY, token);
            setCurrentUser(registeredUser);
            return true;
        } catch (error) {
            console.error("Register Error:", error);
            return false;
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error("Logout Error:", error);
        } finally {
            localStorage.clear();
            setCurrentUser(null);
        }
    }, []);

    const updateUser = useCallback((updates) => {
        if (!currentUser) return;
        setCurrentUser(prev => ({ ...prev, ...updates }));
        // Persist frontend-only settings to localStorage so they survive refresh
        const settingsToSave = ['avatar', 'username', 'soundEnabled', 'musicEnabled', 'language', 'preferredCategories'];
        const saved = loadSavedSettings();
        const next = { ...saved };
        settingsToSave.forEach(k => { if (updates[k] !== undefined) next[k] = updates[k]; });
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    }, [currentUser]);

    const contextValue = React.useMemo(() => ({
        currentUser, loading, login, register, logout, updateUser
    }), [currentUser, loading, login, register, logout, updateUser]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
