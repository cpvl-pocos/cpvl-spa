// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useFetch, useIdleTimeout } from '@/hooks';
import { useSessionStorage } from 'usehooks-ts';
import { API, getURI } from '@/services';
import type { IProfileData } from '@/types';

interface AuthContextType {
  profile: IProfileData | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<IProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLogged, setIsLogged] = useSessionStorage(
    (import.meta.env.VITE_LOGGED_KEY || 'CPVL_USER_IS_LOGGED') as string,
    false
  );

  const fetchConfig = React.useMemo(() => ({
    url: getURI(API.profile),
    method: 'GET' as const,
    immediate: false
  }), []);

  const { doFetch } = useFetch<IProfileData>(fetchConfig);

  const logout = useCallback(() => {
    localStorage.removeItem('CPVL_AUTH_TOKEN');
    setIsLogged(false);
    setProfile(null);
    window.location.href = '/login';
  }, [setIsLogged]);

  // Logout after 10 minutes of inactivity
  useIdleTimeout(logout, 10 * 60 * 1000);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await doFetch({ url: getURI(API.profile) });
      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [doFetch]);

  useEffect(() => {
    if (isLogged && !profile && !loading) {
      fetchProfile();
    } else if (!isLogged && profile) {
      setProfile(null);
    }
  }, [fetchProfile, profile, isLogged, loading]);

  const isAdmin = profile?.user?.role === 'admin' ||
    (profile?.routes || []).some(r => r.route === 'pilots');

  const value = React.useMemo(() => ({
    profile,
    loading,
    refreshProfile: fetchProfile,
    isAdmin
  }), [profile, loading, fetchProfile, isAdmin]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
