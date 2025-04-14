
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import AuthLayout from '@/components/auth/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { SignUpResult } from '@/types/auth';
import { useAuthStore } from '@/store/authStore';

const Auth = () => {
  // UI states
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { theme } = useTheme();
  const { user, signIn, signUp, isLoading: authLoading } = useAuth();
  const { token } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is authenticated but no GitHub token, redirect to GitHub setup
    if (user && !token) {
      navigate('/github-setup');
      return;
    }
    
    // If user is fully authenticated with GitHub token, redirect to home
    if (user && token) {
      navigate('/');
      return;
    }
  }, [user, token, navigate]);

  const handleRegister = async (email: string, password: string, username: string): Promise<SignUpResult> => {
    setIsLoading(true);
    
    try {
      const result = await signUp(email, password);
      if (result.success) {
        // Log the user in automatically with the new credentials
        await signIn(email, password);
        
        // Will be redirected to GitHub setup by the useEffect above
      }
      return result;
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const success = await signIn(email, password);
      if (success) {
        // Will be redirected by the useEffect above
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast.error(error.message || 'Authentication failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMode = () => {
    setIsRegistering(!isRegistering);
  };

  const handleHowToUse = () => {
    navigate('/how-to-use');
  };

  // Convert theme.speed to the correct type for AuthLayout
  const authLayoutTheme = {
    showCodeRain: theme.showCodeRain,
    speed: theme.speed as "slow" | "normal" | "fast"
  };

  return (
    <AuthLayout theme={authLayoutTheme}>
      {isRegistering ? (
        <RegisterForm 
          onToggleMode={handleToggleMode}
          onRegister={handleRegister}
          isLoading={isLoading || authLoading}
          onHowToUse={handleHowToUse}
        />
      ) : (
        <LoginForm 
          onToggleMode={handleToggleMode}
          onLogin={handleLogin}
          isLoading={isLoading || authLoading}
          onHowToUse={handleHowToUse}
        />
      )}
    </AuthLayout>
  );
};

export default Auth;
