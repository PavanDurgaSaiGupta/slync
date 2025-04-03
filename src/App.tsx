
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';

import { useAuthStore } from './store/authStore';
import { useTheme } from './hooks/useTheme';
import ThemeSwitcher from './components/ThemeSwitcher';

// Pages
import Index from './pages/Index';
import Authentication from './pages/Authentication';
import HowToUse from './pages/HowToUse';
import Bookmarks from './pages/Bookmarks';
import Todos from './pages/Todos';
import Notes from './pages/Notes';
import Themes from './pages/Themes';
import ImportExport from './pages/ImportExport';
import GitCommands from './pages/GitCommands';
import NotFound from './pages/NotFound';

function App() {
  const { user } = useAuthStore();
  const { theme, setTheme } = useTheme();

  // Protected route component
  const Protected = ({ children }: { children: React.ReactNode }) => {
    if (!user) {
      return <Navigate to="/authentication" replace />;
    }
    return <>{children}</>;
  };

  return (
    <Router>
      <ThemeSwitcher 
        currentTheme={theme ? theme.themeNumber : 1} 
        onChange={(themeNumber) => {
          if (setTheme) {
            setTheme({ ...theme, themeNumber });
          }
        }} 
      />
      
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/authentication" element={<Authentication />} />
        <Route path="/how-to-use" element={<HowToUse />} />
        <Route path="/bookmarks" element={<Bookmarks />} />
        <Route path="/todos" element={<Todos />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/themes" element={<Themes />} />
        <Route path="/import-export" element={<ImportExport />} />
        <Route path="/git-terminal" element={<GitCommands />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      <Toaster 
        theme={theme?.isDark ? "dark" : "light"}
        position="top-center"
        richColors
      />
    </Router>
  );
}

export default App;
