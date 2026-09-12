import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import backend from '@/api/backend';
import { isSupabaseConfigured } from '@/api/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState(null);

  const checkUserAuth = useCallback(async () => {
    setIsLoadingAuth(true);
    setAuthError(null);
    if (!isSupabaseConfigured) {
      setUser(null);
      setAuthChecked(true);
      setIsLoadingAuth(false);
      setAuthError({ type: 'configuration', message: 'Supabase environment variables are missing.' });
      return;
    }
    try {
      setUser(await backend.auth.me());
    } catch (error) {
      setUser(null);
      if (error?.status && error.status !== 401) {
        setAuthError({ type: 'unknown', message: error.message });
      }
    } finally {
      setAuthChecked(true);
      setIsLoadingAuth(false);
    }
  }, []);

  useEffect(() => {
    checkUserAuth();
    const subscription = backend.auth.onAuthStateChange(() => checkUserAuth());
    return () => subscription?.unsubscribe();
  }, [checkUserAuth]);

  const logout = useCallback(async () => {
    await backend.auth.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: Boolean(user),
      isLoadingAuth,
      isLoadingPublicSettings: false,
      authError,
      appPublicSettings: null,
      authChecked,
      logout,
      navigateToLogin: () => { window.location.href = '/login'; },
      checkUserAuth,
      checkAppState: checkUserAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within an AuthProvider');
  return value;
}
