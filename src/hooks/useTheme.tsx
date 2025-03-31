
import { useState, useEffect, createContext, useContext } from 'react';

export type ThemeType = {
  themeNumber: number;
  speed: 'slow' | 'normal' | 'fast';
  enableCrtFlicker: boolean;
  showCodeRain: boolean;
};

const defaultTheme: ThemeType = {
  themeNumber: 1, // Matrix green by default
  speed: 'normal',
  enableCrtFlicker: true,
  showCodeRain: true,
};

const ThemeContext = createContext<{
  theme: ThemeType;
  setTheme: (theme: Partial<ThemeType>) => void;
}>({
  theme: defaultTheme,
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>(() => {
    const savedTheme = localStorage.getItem('matrix-app-theme');
    return savedTheme ? JSON.parse(savedTheme) : defaultTheme;
  });

  useEffect(() => {
    localStorage.setItem('matrix-app-theme', JSON.stringify(theme));
    
    // Apply CSS variables for the theme
    document.documentElement.style.setProperty('--theme-primary', `var(--theme-${theme.themeNumber}-primary)`);
    document.documentElement.style.setProperty('--theme-secondary', `var(--theme-${theme.themeNumber}-secondary)`);
    
  }, [theme]);

  const setTheme = (newTheme: Partial<ThemeType>) => {
    setThemeState(prev => ({ ...prev, ...newTheme }));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
