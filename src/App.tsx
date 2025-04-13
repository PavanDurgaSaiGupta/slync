
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useTheme } from './hooks/useTheme';

// Pages
import Index from './pages/Index';
import Auth from './pages/Auth';
import HowToUse from './pages/HowToUse';
import Bookmarks from './pages/Bookmarks';
import Todos from './pages/Todos';
import Notes from './pages/Notes';
import Themes from './pages/Themes';
import ImportExport from './pages/ImportExport';
import GitCommands from './pages/GitCommands';
import NotFound from './pages/NotFound';

// Protected route wrapper component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  // If loading, show loading indicator
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-matrix-primary text-2xl">Loading...</div>
      </div>
    );
  }
  
  // If not authenticated, render nothing while redirecting
  if (!user) return null;
  
  return <>{children}</>;
};

function AppRoutes() {
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
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/how-to-use" element={<HowToUse />} />
      
      {/* Protected routes */}
      <Route path="/bookmarks" element={
        <ProtectedRoute>
          <Bookmarks />
        </ProtectedRoute>
      } />
      
      <Route path="/todos" element={
        <ProtectedRoute>
          <Todos />
        </ProtectedRoute>
      } />
      
      <Route path="/notes" element={
        <ProtectedRoute>
          <Notes />
        </ProtectedRoute>
      } />
      
      <Route path="/themes" element={
        <ProtectedRoute>
          <Themes />
        </ProtectedRoute>
      } />
      
      <Route path="/import-export" element={
        <ProtectedRoute>
          <ImportExport />
        </ProtectedRoute>
      } />
      
      <Route path="/git-terminal" element={
        <ProtectedRoute>
          <GitCommands />
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  const { theme } = useTheme();
  
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        
        <Toaster 
          theme={theme?.isDark ? "dark" : "light"}
          position="top-center"
          richColors
          closeButton
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
