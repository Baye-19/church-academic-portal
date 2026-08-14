import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  switchDemoUser: (role: UserRole) => Promise<void>;
  updateProfile: (updatedFields: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Load persisted session
    const savedToken = sessionStorage.getItem('amras_token');
    const savedUser = sessionStorage.getItem('amras_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password?: string) => {
    try {
      const res = await api.login(email, password);
      const authenticatedUser = res.user || res.data?.user;
      const authToken = res.token || res.data?.token || 'mock-token';

      if (res.success && authenticatedUser) {
        setUser(authenticatedUser);
        setToken(authToken);
        sessionStorage.setItem('amras_token', authToken);
        sessionStorage.setItem('amras_user', JSON.stringify(authenticatedUser));
        return { success: true };
      }
      return { success: false, message: res.message || 'Authentication failed' };
    } catch (e) {
      return { success: false, message: 'Server connection error' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem('amras_token');
    sessionStorage.removeItem('amras_user');
  };

  const switchDemoUser = async (role: UserRole) => {
    const roleCredentials: Record<UserRole, { email: string; pass: string }> = {
      ADMIN: { email: 'ashu@admin.edu', pass: 'Admin@123!' },
      DEPT_HEAD: { email: 'head@head.edu', pass: 'Head@123!' },
      TEACHER: { email: 'teacher@class.edu', pass: 'Teacher@123!' },
      COORDINATOR: { email: 'coordinator@amras.edu', pass: 'Coordinator@123!' },
    };
    const cred = roleCredentials[role];
    if (cred) {
      await login(cred.email, cred.pass);
    }
  };

  const updateProfile = async (updatedFields: Partial<User>) => {
    if (!user) return false;
    try {
      const res = await api.updateUserProfile(user.id, updatedFields);
      if (res.success && res.data) {
        setUser(res.data);
        sessionStorage.setItem('amras_user', JSON.stringify(res.data));
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to update profile', e);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, switchDemoUser, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
