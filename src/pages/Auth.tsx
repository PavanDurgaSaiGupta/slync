
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, LogIn, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import NeonButton from '@/components/NeonButton';
import NeonInput from '@/components/NeonInput';
import MatrixRain from '@/components/MatrixRain';
import GlitchText from '@/components/GlitchText';
import { useTheme } from '@/hooks/useTheme';

enum AuthMode {
  SIGN_IN = 'sign_in',
  SIGN_UP = 'sign_up',
}

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading, signIn, signUp } = useAuth();
  const { theme } = useTheme();
  
  const [authMode, setAuthMode] = useState<AuthMode>(AuthMode.SIGN_IN);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  
  // Redirect to home if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalLoading(true);
    
    try {
      if (authMode === AuthMode.SIGN_UP) {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (error) {
      console.error('Authentication error:', error);
    } finally {
      setLocalLoading(false);
    }
  };
  
  const toggleAuthMode = () => {
    setAuthMode(authMode === AuthMode.SIGN_IN ? AuthMode.SIGN_UP : AuthMode.SIGN_IN);
    setPassword('');
    setConfirmPassword('');
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-matrix-primary text-2xl">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-matrix-background flex flex-col items-center justify-center p-4">
      {theme.showCodeRain && <MatrixRain speed={theme.speed} />}
      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <GlitchText variant="title" text={authMode === AuthMode.SIGN_IN ? 'Access Terminal' : 'New User Registration'} />
        <p className="text-matrix-primary-70 mt-2">
          {authMode === AuthMode.SIGN_IN 
            ? 'Enter your credentials to connect' 
            : 'Register to access the Slync Terminal'}
        </p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <form onSubmit={handleSubmit} className="matrix-card">
          <div className="space-y-6">
            <div>
              <label className="block text-matrix-primary mb-2">Email</label>
              <NeonInput
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                icon={<Mail size={18} />}
              />
            </div>
            
            <div>
              <label className="block text-matrix-primary mb-2">Password</label>
              <NeonInput
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                icon={<Lock size={18} />}
              />
            </div>
            
            {authMode === AuthMode.SIGN_UP && (
              <div>
                <label className="block text-matrix-primary mb-2">Confirm Password</label>
                <NeonInput
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  icon={<Lock size={18} />}
                />
              </div>
            )}
            
            <div className="flex flex-col space-y-4">
              <NeonButton
                type="submit"
                disabled={isLoading || localLoading}
                className="w-full"
              >
                {localLoading ? (
                  <span className="animate-pulse">Processing...</span>
                ) : authMode === AuthMode.SIGN_IN ? (
                  <div className="flex items-center justify-center">
                    <LogIn size={18} className="mr-2" />
                    Sign In
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <User size={18} className="mr-2" />
                    Create Account
                  </div>
                )}
              </NeonButton>
              
              <button
                type="button"
                onClick={toggleAuthMode}
                className="text-matrix-primary-70 hover:text-matrix-primary text-sm transition-colors"
              >
                {authMode === AuthMode.SIGN_IN
                  ? "Don't have an account? Sign Up"
                  : "Already have an account? Sign In"}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center"
      >
        <p className="text-matrix-primary-50 text-sm">
          Powered by Slync Terminal • Secure Access Protocol
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
