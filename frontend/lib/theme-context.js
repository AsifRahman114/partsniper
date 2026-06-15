'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const THEME_STORAGE_KEY = 'partsniper-theme';

const ThemeContext = createContext(null);

function getSystemTheme() {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    const initialTheme = storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : getSystemTheme();
    setTheme(initialTheme);
    applyTheme(initialTheme);
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized || (theme !== 'light' && theme !== 'dark')) return;
    applyTheme(theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme, initialized]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}