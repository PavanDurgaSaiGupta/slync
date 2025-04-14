
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import AuthLayout from '@/components/auth/AuthLayout';
import GitHubSetupForm from '@/components/auth/GitHubSetup';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthStore } from '@/store/authStore';

const GitHubSetup = () => {
  const { theme } = useTheme();
  const { user, isLoading: authLoading } = useAuth();
  const { token } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is not authenticated, redirect to auth
    if (!user) {
      navigate('/auth');
      return;
    }
    
    // If GitHub is already connected, redirect to home
    if (token) {
      navigate('/');
      return;
    }
  }, [user, token, navigate]);

  const handleSetupComplete = () => {
    toast.success('GitHub setup complete! You can now use SLYNC.');
    navigate('/');
  };

  // Convert theme.speed to the correct type for AuthLayout
  const authLayoutTheme = {
    showCodeRain: theme.showCodeRain,
    speed: theme.speed as "slow" | "normal" | "fast"
  };

  return (
    <AuthLayout theme={authLayoutTheme}>
      <GitHubSetupForm 
        onComplete={handleSetupComplete}
        isLoading={authLoading}
      />
    </AuthLayout>
  );
};

export default GitHubSetup;
