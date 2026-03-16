import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MOCK_USERS, User } from '../data/mockData';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => boolean;
  register: (username: string, email: string, password: string) => boolean;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const defaultAuthContext: AuthContextType = {
  currentUser: null,
  login: () => false,
  register: () => false,
  logout: () => {},
  updateUser: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

const STORAGE_KEY = 'quiz_current_user';
const USERS_KEY = 'quiz_users';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUsers = localStorage.getItem(USERS_KEY);
    if (!storedUsers) {
      localStorage.setItem(USERS_KEY, JSON.stringify(MOCK_USERS));
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored));
      } catch {}
    }
  }, []);

  const getUsers = (): User[] => {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    } catch {
      return MOCK_USERS;
    }
  };

  const saveUsers = (users: User[]) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  const login = useCallback((email: string, password: string): boolean => {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      return true;
    }
    return false;
  }, []);

  const register = useCallback((username: string, email: string, password: string): boolean => {
    const users = getUsers();
    if (users.find(u => u.email === email)) return false;
    const newUser: User = {
      id: `user-${Date.now()}`,
      username,
      email,
      password,
      role: 'player',
      avatar: ['🦊', '🐺', '🦋', '🐉', '🦅', '🐬', '🦁', '🐙'][Math.floor(Math.random() * 8)],
      totalScore: 0,
      gamesPlayed: 0,
      wins: 0,
      rank: 0,
      joinedAt: new Date().toISOString().split('T')[0],
      preferredCategories: ['science', 'history', 'technology', 'geography', 'sports', 'arts'],
      language: 'en',
      soundEnabled: true,
      musicEnabled: false,
    };
    users.push(newUser);
    saveUsers(users);
    setCurrentUser(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    return true;
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    const users = getUsers();
    const idx = users.findIndex(u => u.id === currentUser.id);
    if (idx >= 0) {
      users[idx] = updated;
      saveUsers(users);
    }
    setCurrentUser(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  return useContext(AuthContext);
}
