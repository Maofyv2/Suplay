import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCurrentUser, login as loginService, logout as logoutService, register as registerService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const { user, token } = await loginService(email, password);
    localStorage.setItem('suplay_user', JSON.stringify(user));
    localStorage.setItem('suplay_token', token);
    setCurrentUser(user);
    return user;
  }, []);

  const register = useCallback(async (data) => {
    const { user, token } = await registerService(data);
    localStorage.setItem('suplay_user', JSON.stringify(user));
    localStorage.setItem('suplay_token', token);
    setCurrentUser(user);
    return user;
  }, []);

  const logout = useCallback(() => {
    logoutService();
    setCurrentUser(null);
  }, []);

  const updateCurrentUser = useCallback((data) => {
    setCurrentUser((prev) => {
      const updated = { ...prev, ...data };
      localStorage.setItem('suplay_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const value = {
    currentUser,
    role: currentUser?.role || null,
    isAuthenticated: !!currentUser,
    loading,
    login,
    register,
    logout,
    updateCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export default AuthContext;
