
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import AuthLayout from '@/components/auth/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { SignUpResult } from '@/types/auth';

const Auth = () => {
  // UI states
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { theme } = useTheme();
  const { user, signIn, signUp, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is authenticated, redirect to home
    if (user) {
      navigate('/');
      return;
    }
  }, [user, navigate]);

  const handleRegister = async (email: string, password: string, username: string): Promise<SignUpResult> => {
    setIsLoading(true);
    
    try {
      const result = await signUp(email, password);
      if (result.success) {
        // Automatically switch to login mode and pre-fill credentials
        setIsRegistering(false);
        
        // Inform user registration was successful
        toast.info('Registration successful. Please log in.');
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
        navigate('/');
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

  return (
    <AuthLayout theme={theme}>
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
