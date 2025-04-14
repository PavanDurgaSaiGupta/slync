
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '@/components/auth/AuthLayout';
import GitHubSetupForm from '@/components/auth/GitHubSetupForm';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/contexts/AuthContext';

const GitHubSetup = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { token } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // If not logged in, redirect to auth
    if (!user) {
      navigate('/auth');
      return;
    }
    
    // If already has GitHub token, redirect to home
    if (token) {
      navigate('/');
      return;
    }
  }, [user, token, navigate]);

  const handleComplete = () => {
    navigate('/');
  };

  const handleHelp = () => {
    navigate('/how-to-use');
  };

  // Convert theme.speed to the correct type for AuthLayout
  const authLayoutTheme = {
    showCodeRain: theme.showCodeRain,
    speed: theme.speed as "slow" | "normal" | "fast"
  };

  return (
    <AuthLayout theme={authLayoutTheme}>
      <GitHubSetupForm 
        onComplete={handleComplete} 
        onHelp={handleHelp}
      />
    </AuthLayout>
  );
};

export default GitHubSetup;
