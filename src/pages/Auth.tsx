import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, User, Mail, Key, Lock, Code, Info } from 'lucide-react';
import { toast } from 'sonner';

import NeonButton from '@/components/NeonButton';
import NeonInput from '@/components/NeonInput';
import GlitchText from '@/components/GlitchText';
import MatrixRain from '@/components/MatrixRain';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';

const Auth = () => {
  // Form states
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  
  // UI states
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isRegistering) {
        if (!email || !password || !username) {
          toast.error('Please fill all fields');
          setIsLoading(false);
          return;
        }
        
        // Register new user
        const result = await signUp(email, password);
        if (result.success) {
          // Automatically switch to login mode and pre-fill credentials
          setIsRegistering(false);
          
          // Don't automatically sign in, just prepare the login form
          toast.info('Please sign in with your new account');
        }
      } else {
        if (!email || !password) {
          toast.error('Please enter your email and password');
          setIsLoading(false);
          return;
        }
        
        // Log in existing user
        const success = await signIn(email, password);
        if (success) {
          navigate('/');
        }
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast.error(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="min-h-screen bg-matrix-background">
      {theme.showCodeRain && <MatrixRain speed={theme.speed} />}
      
      <div className="container mx-auto px-4 h-screen flex flex-col items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <motion.div 
                className="p-4 rounded-full border-2 border-matrix-primary shadow-glow"
                animate={{ boxShadow: ['0 0 10px 2px var(--theme-primary)', '0 0 20px 5px var(--theme-primary)', '0 0 10px 2px var(--theme-primary)'] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Code size={40} className="text-matrix-primary" />
              </motion.div>
            </div>
            <GlitchText text="SLYNC" variant="title" className="mb-2" />
            <p className="text-matrix-primary/70">Sync your data with Supabase</p>
          </div>
          
          <div className="matrix-card">
            <div className="space-y-6">
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-black/50 rounded-full border-2 border-matrix-primary">
                  <User size={32} className="text-matrix-primary" />
                </div>
              </div>
              
              <h2 className="text-xl font-bold text-center text-matrix-primary mb-6">
                {isRegistering ? 'Create Account' : 'Welcome Back'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-matrix-primary/80 mb-2 flex items-center">
                    <Mail size={16} className="mr-2" />
                    Email
                  </label>
                  <NeonInput
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter your email"
                    icon={<Mail size={18} />}
                  />
                </div>
                
                {isRegistering && (
                  <div>
                    <label className="block text-matrix-primary/80 mb-2 flex items-center">
                      <User size={16} className="mr-2" />
                      Username
                    </label>
                    <NeonInput
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Choose a username"
                      icon={<User size={18} />}
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-matrix-primary/80 mb-2 flex items-center">
                    <Lock size={16} className="mr-2" />
                    Password
                  </label>
                  <NeonInput
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter your password"
                    icon={<Lock size={18} />}
                  />
                </div>
                
                <NeonButton 
                  type="submit"
                  className="w-full"
                  disabled={isLoading || authLoading}
                >
                  {isLoading || authLoading ? 'Processing...' : isRegistering ? 'Register' : 'Login'}
                  {!isLoading && !authLoading && <ArrowRight size={16} className="ml-2" />}
                </NeonButton>
              </form>
              
              <div className="text-center">
                <button 
                  className="text-matrix-primary/70 hover:text-matrix-primary text-sm"
                  onClick={() => setIsRegistering(!isRegistering)}
                  type="button"
                >
                  {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
                </button>
              </div>
            </div>
            
            <div className="mt-6">
              <NeonButton 
                onClick={() => navigate('/how-to-use')} 
                secondary 
                className="w-full"
              >
                <Info size={16} className="mr-2" />
                How to Use This App
              </NeonButton>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
