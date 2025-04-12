import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeType = {
  themeNumber: number;
  showCodeRain: boolean;
  speed: 'slow' | 'normal' | 'fast';
  enableCrtFlicker: boolean;
  isDark: boolean;
};

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: Partial<ThemeType>) => void;
}

const defaultTheme: ThemeType = {
  themeNumber: 1,
  showCodeRain: true,
  speed: 'normal',
  enableCrtFlicker: false,
  isDark: true,
};

const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>(() => {
    const savedTheme = localStorage.getItem('slync-theme');
    return savedTheme ? JSON.parse(savedTheme) : defaultTheme;
  });

  useEffect(() => {
    // Apply CSS variables based on theme
    document.documentElement.style.setProperty('--theme-primary', getThemeColor(theme.themeNumber));
    document.documentElement.style.setProperty('--theme-secondary', getThemeSecondary(theme.themeNumber));
    
    // Apply matrix-background class with the appropriate theme color
    document.documentElement.classList.forEach(className => {
      if (className.startsWith('theme-')) {
        document.documentElement.classList.remove(className);
      }
    });
    document.documentElement.classList.add(`theme-${theme.themeNumber}`);
    
    // Add or remove the CRT flicker effect globally
    if (theme.enableCrtFlicker) {
      document.documentElement.classList.add('enable-flicker');
    } else {
      document.documentElement.classList.remove('enable-flicker');
    }
    
    // Save theme to localStorage
    localStorage.setItem('slync-theme', JSON.stringify(theme));
  }, [theme]);

  const setTheme = (newThemeProps: Partial<ThemeType>) => {
    setThemeState(prevTheme => ({ ...prevTheme, ...newThemeProps }));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Helper function to get theme color
const getThemeColor = (themeNumber: number): string => {
  switch (themeNumber) {
    case 1: return '#0CFC5C'; // Matrix Green
    case 2: return '#5D80FE'; // Neo Blue
    case 3: return '#FF71C5'; // Cyber Pink
    case 4: return '#ECDB54'; // Amber Gold
    case 5: return '#9B87F5'; // Purple Neon
    default: return '#0CFC5C';
  }
};

// Helper function to get secondary theme color
const getThemeSecondary = (themeNumber: number): string => {
  switch (themeNumber) {
    case 1: return '#0D7377'; // Matrix Green complementary
    case 2: return '#1D3057'; // Neo Blue complementary
    case 3: return '#8C4573'; // Cyber Pink complementary
    case 4: return '#8C7A28'; // Amber Gold complementary
    case 5: return '#433A68'; // Purple Neon complementary
    default: return '#0D7377';
  }
};

export const useTheme = () => useContext(ThemeContext);
