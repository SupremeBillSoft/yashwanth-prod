import { createContext, useContext, useEffect, useState } from 'react';

export const THEMES = [
  { id: 'minimal', label: 'Clean Minimal' },
  { id: 'corporate', label: 'Corporate Blue' },
  { id: 'modern', label: 'Modern Dark Header' },
];

const ThemeContext = createContext({ theme: 'minimal', setTheme: () => {} });

const getSavedTheme = () => {
  try {
    const saved = localStorage.getItem('app-theme');
    return THEMES.some((t) => t.id === saved) ? saved : 'minimal';
  } catch {
    return 'minimal';
  }
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getSavedTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('app-theme', theme);
    } catch {}
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);