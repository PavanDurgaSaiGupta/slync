
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { GitHub, KeyRound, ArrowRight } from 'lucide-react';

import NeonButton from '@/components/NeonButton';
import NeonInput from '@/components/NeonInput';
import GlitchText from '@/components/GlitchText';
import MatrixRain from '@/components/MatrixRain';
import { useTheme } from '@/hooks/useTheme';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  const { setUser, setToken: setAuthToken, isLoading, error } = useAuthStore();
  
  const handleLoginWithGitHub = async () => {
    if (!token) {
      alert('Please enter your GitHub token');
      return;
    }
    
    try {
      // Set the token in the store, which initializes Octokit
      setAuthToken(token);
      
      // At this point, we would normally get the user information
      // But since we don't have a real GitHub OAuth flow, we'll just simulate it
      setUser({
        username: 'matrix_user',
        email: email || 'user@matrix.com',
        avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4'
      });
      
      navigate('/');
    } catch (err) {
      console.error('GitHub login error:', err);
    }
  };
  
  const handleLoginWithPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // This is a simulated login - in a real app, we would validate with a backend
    if (email && password) {
      setUser({
        username: 'matrix_user',
        email,
        avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4'
      });
      
      navigate('/');
    }
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-matrix-background p-4">
      {theme.showCodeRain && <MatrixRain speed={theme.speed} />}
      
      <motion.div 
        className="matrix-glass w-full max-w-md rounded-lg p-8 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="mb-8 text-center"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <GlitchText text="Matrix Access Terminal" variant="title" className="mb-2" />
          <p className="text-matrix-primary/80">Enter credentials to jack in</p>
        </motion.div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Tab Selector */}
          <motion.div className="flex mb-6" variants={itemVariants}>
            <button 
              className="flex-1 py-2 border-b-2 border-matrix-primary text-matrix-primary"
            >
              Sign In
            </button>
            <Link 
              to="/register" 
              className="flex-1 py-2 text-matrix-primary/50 hover:text-matrix-primary/70 transition-colors"
            >
              Create Account
            </Link>
          </motion.div>
          
          {/* Login Form */}
          <form onSubmit={handleLoginWithPassword}>
            <motion.div className="space-y-4" variants={containerVariants}>
              <motion.div variants={itemVariants}>
                <NeonInput
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <NeonInput
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  icon={<KeyRound size={18} />}
                />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <NeonButton 
                  type="submit" 
                  className="w-full"
                >
                  Access <ArrowRight className="inline ml-2" size={16} />
                </NeonButton>
              </motion.div>
            </motion.div>
          </form>
          
          {/* Divider */}
          <motion.div 
            className="relative flex items-center py-4"
            variants={itemVariants}
          >
            <div className="flex-grow border-t border-matrix-primary/30"></div>
            <span className="flex-shrink mx-4 text-matrix-primary/60">OR</span>
            <div className="flex-grow border-t border-matrix-primary/30"></div>
          </motion.div>
          
          {/* GitHub Login */}
          <motion.div className="space-y-4" variants={containerVariants}>
            <motion.div variants={itemVariants}>
              <NeonInput
                type="text"
                placeholder="GitHub Personal Access Token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                icon={<GitHub size={18} />}
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <NeonButton
                onClick={handleLoginWithGitHub}
                className="w-full"
                disabled={isLoading}
              >
                <GitHub size={18} className="inline mr-2" />
                Connect with GitHub
              </NeonButton>
            </motion.div>
            
            {error && (
              <motion.p 
                className="text-red-500 text-sm mt-2"
                variants={itemVariants}
              >
                {error}
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
