
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

import { useAuthStore } from './store/authStore';
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

  // Protected route component
  const Protected = ({ children }: { children: React.ReactNode }) => {
    if (!user) {
      return <Navigate to="/authentication" replace />;
    }
    return <>{children}</>;
  };

  return (
    <Router>
      <ThemeSwitcher currentTheme={1} onChange={(themeNumber) => {
        // This component will be managed by ThemeProvider
      }} />
      
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/authentication" element={<Authentication />} />
        <Route path="/how-to-use" element={<HowToUse />} />
        <Route path="/bookmarks" element={
          <Protected>
            <Bookmarks />
          </Protected>
        } />
        <Route path="/todos" element={
          <Protected>
            <Todos />
          </Protected>
        } />
        <Route path="/notes" element={
          <Protected>
            <Notes />
          </Protected>
        } />
        <Route path="/themes" element={
          <Protected>
            <Themes />
          </Protected>
        } />
        <Route path="/import-export" element={
          <Protected>
            <ImportExport />
          </Protected>
        } />
        <Route path="/git-terminal" element={
          <Protected>
            <GitCommands />
          </Protected>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      <Toaster 
        theme="dark"
        position="top-center"
        richColors
      />
    </Router>
  );
}

export default App;
