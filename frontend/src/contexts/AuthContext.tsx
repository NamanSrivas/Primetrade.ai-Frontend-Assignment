'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { authApi } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import type { User, LoginData, RegisterData } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { show: showToast } = useToast();

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Read cached user for instant UI; token is now HTTP-only cookie set by backend
      const savedUser = Cookies.get('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      // Always validate token with backend (cookie-based)
      try {
        const response = await authApi.validateToken();
        setUser(response.user);
        Cookies.set('user', JSON.stringify(response.user), { expires: 7 });
      } catch (error) {
        clearAuthData();
      }
    } catch (error) {
      clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: LoginData) => {
    try {
      const response = await authApi.login(data);
      const { user: userData } = response; // token set via HTTP-only cookie
      Cookies.set('user', JSON.stringify(userData), { expires: 7 });
      setUser(userData);
      showToast('Welcome back!', 'success');
    } catch (error) {
      showToast('Login failed. Check your credentials.', 'error');
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authApi.register(data);
      const { user: userData } = response; // token set via HTTP-only cookie
      Cookies.set('user', JSON.stringify(userData), { expires: 7 });
      setUser(userData);
      showToast('Account created! You are now signed in.', 'success');
    } catch (error) {
      showToast('Registration failed. Try a different email.', 'error');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout(); // clears HTTP-only cookie server-side
    } catch {}
    clearAuthData();
    showToast('Signed out', 'info');
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    Cookies.set('user', JSON.stringify(userData), { expires: 7 });
  };

  const clearAuthData = () => {
    Cookies.remove('user');
    setUser(null);
  };

  const value = { user, loading, login, register, logout, updateUser };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
