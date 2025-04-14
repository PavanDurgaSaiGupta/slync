
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { AuthState, SignUpResult } from '@/types/auth';
import { useAuthStore } from '@/store/authStore';

export const useAuthentication = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    error: null,
  });

  // Initialize GitHub integration hooks
  const { setToken, connectRepo } = useAuthStore();

  useEffect(() => {
    // Set up the auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setAuthState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
          isLoading: false,
        }));

        // Notify user of sign in/out events
        if (event === 'SIGNED_IN') {
          toast.success('Successfully signed in');
        } else if (event === 'SIGNED_OUT') {
          toast.info('You have been signed out');
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        isLoading: false,
      }));
    });

    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string): Promise<SignUpResult> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // No email verification required - direct signup with auto-confirm
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            email_confirmed: true
          }
        }
      });
      
      if (error) throw error;
      
      // Download credentials as CSV
      const credentials = `Email,Password\n${email},${password}`;
      const blob = new Blob([credentials], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'slync_credentials.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Registration successful! Your credentials have been downloaded.');
      
      // Return successful signup with credentials for the GitHub flow
      return { 
        success: true, 
        email, 
        password 
      };
    } catch (error: any) {
      setAuthState(prev => ({ 
        ...prev, 
        error: error.message || 'Failed to sign up',
        isLoading: false 
      }));
      toast.error(error.message || 'Failed to sign up');
      return { success: false };
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const signIn = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // After successful login, prompt for GitHub token and repo
      toast.info('Please connect to GitHub on the next page to complete setup');
      
      return true;
    } catch (error: any) {
      setAuthState(prev => ({ 
        ...prev, 
        error: error.message || 'Failed to sign in',
        isLoading: false 
      }));
      toast.error(error.message || 'Failed to sign in');
      return false;
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const signOut = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Also clear GitHub connection
      useAuthStore.getState().logout();
    } catch (error: any) {
      setAuthState(prev => ({ 
        ...prev, 
        error: error.message || 'Failed to sign out',
        isLoading: false
      }));
      toast.error(error.message || 'Failed to sign out');
      return false;
    }
    
    setAuthState(prev => ({ 
      ...prev, 
      user: null, 
      session: null, 
      isLoading: false 
    }));
    return true;
  };

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
  };
};
