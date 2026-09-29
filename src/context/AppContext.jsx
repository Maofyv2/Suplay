import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null); // { message, type: 'success'|'error'|'info' }
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('suplay_theme') === 'dark';
  });

  // Apply data-theme to <html> whenever darkMode changes
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.setAttribute('data-theme', 'dark');
      localStorage.setItem('suplay_theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
      localStorage.setItem('suplay_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => setDarkMode((prev) => !prev), []);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), duration);
  }, []);

  const hideToast = useCallback(() => setToast(null), []);

  const value = {
    isLoading,
    setIsLoading,
    toast,
    showToast,
    hideToast,
    darkMode,
    toggleDarkMode,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}

export default AppContext;
