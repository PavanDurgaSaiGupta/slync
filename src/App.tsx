
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';

import { useAuthStore } from './store/authStore';
import { useTheme } from './hooks/useTheme';

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

// Protected route wrapper component
const ProtectedRoute = ({ children, requireRepo = false }: { children: React.ReactNode, requireRepo?: boolean }) => {
  const { user, token, repo } = useAuthStore();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user || !token) {
      navigate('/authentication');
    } else if (requireRepo && !repo) {
      navigate('/');
      // Show toast notification
      const showToast = async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        const { toast } = await import('sonner');
        toast.error('Please connect a repository first');
      };
      showToast();
    }
  }, [user, token, repo, navigate, requireRepo]);

  // If not authenticated, render nothing while redirecting
  if (!user || !token) return null;
  
  // If repo is required but not connected, render nothing while redirecting
  if (requireRepo && !repo) return null;
  
  return <>{children}</>;
};

function App() {
  const { theme } = useTheme();
  
  // Set up global CSS variables based on theme
  useEffect(() => {
    if (theme.enableCrtFlicker) {
      document.documentElement.classList.add('enable-flicker');
    } else {
      document.documentElement.classList.remove('enable-flicker');
    }
  }, [theme.enableCrtFlicker]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/authentication" element={<Authentication />} />
        <Route path="/how-to-use" element={<HowToUse />} />
        
        {/* Protected routes that require repository */}
        <Route path="/bookmarks" element={
          <ProtectedRoute requireRepo={true}>
            <Bookmarks />
          </ProtectedRoute>
        } />
        
        <Route path="/todos" element={
          <ProtectedRoute requireRepo={true}>
            <Todos />
          </ProtectedRoute>
        } />
        
        <Route path="/notes" element={
          <ProtectedRoute requireRepo={true}>
            <Notes />
          </ProtectedRoute>
        } />
        
        <Route path="/import-export" element={
          <ProtectedRoute requireRepo={true}>
            <ImportExport />
          </ProtectedRoute>
        } />
        
        <Route path="/git-terminal" element={
          <ProtectedRoute requireRepo={true}>
            <GitCommands />
          </ProtectedRoute>
        } />
        
        {/* Protected routes that don't require repository */}
        <Route path="/themes" element={
          <ProtectedRoute>
            <Themes />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      <Toaster 
        theme={theme?.isDark ? "dark" : "light"}
        position="top-center"
        richColors
        closeButton
      />
    </Router>
  );
}

export default App;
