import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Github, User, KeyRound, Mail, ArrowRight } from 'lucide-react';

import NeonButton from '@/components/NeonButton';
import NeonInput from '@/components/NeonInput';
import GlitchText from '@/components/GlitchText';
import MatrixRain from '@/components/MatrixRain';
import { useTheme } from '@/hooks/useTheme';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { setUser, setToken: setAuthToken, isLoading, error } = useAuthStore();
  
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    // Simulate registration - in a real app, we would connect to a backend
    setUser({
      username,
      email,
      avatarUrl: `https://avatars.dicebear.com/api/identicon/${username}.svg`
    });
    
    navigate('/');
  };
  
  const handleGitHubRegister = async () => {
    if (!token) {
      alert('Please enter your GitHub token');
      return;
    }
    
    try {
      // Set the token in the store, which initializes Octokit
      setAuthToken(token);
      
      // Simulate getting GitHub user info - in a real app this would be an API call
      setUser({
        username: username || 'matrix_user',
        email: email || 'user@matrix.com',
        avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4'
      });
      
      navigate('/');
    } catch (err) {
      console.error('GitHub registration error:', err);
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
        className="matrix-glass w-full max-w-md rounded-lg p-8"
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
          <GlitchText text="Create Access Terminal" variant="title" className="mb-2" />
          <p className="text-matrix-primary/80">Set up your credentials</p>
        </motion.div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Tab Selector */}
          <motion.div className="flex mb-6" variants={itemVariants}>
            <Link 
              to="/login" 
              className="flex-1 py-2 text-matrix-primary/50 hover:text-matrix-primary/70 transition-colors"
            >
              Sign In
            </Link>
            <button 
              className="flex-1 py-2 border-b-2 border-matrix-primary text-matrix-primary"
            >
              Create Account
            </button>
          </motion.div>
          
          {/* Registration Form */}
          <form onSubmit={handleRegister}>
            <motion.div className="space-y-4" variants={containerVariants}>
              <motion.div variants={itemVariants}>
                <NeonInput
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  icon={<User size={18} />}
                />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <NeonInput
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  icon={<Mail size={18} />}
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
                <NeonInput
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  icon={<KeyRound size={18} />}
                />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <NeonButton 
                  type="submit" 
                  className="w-full"
                >
                  Create Account <ArrowRight className="inline ml-2" size={16} />
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
          
          {/* GitHub Registration */}
          <motion.div className="space-y-4" variants={containerVariants}>
            <motion.div variants={itemVariants}>
              <NeonInput
                type="text"
                placeholder="GitHub Personal Access Token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                icon={<Github size={18} />}
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <NeonButton
                onClick={handleGitHubRegister}
                className="w-full"
                disabled={isLoading}
              >
                <Github size={18} className="inline mr-2" />
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

export default Register;
