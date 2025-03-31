
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Octokit } from 'octokit';
import { toast } from 'sonner';
import { Github, Lock, User, ArrowRight } from 'lucide-react';

import NeonButton from '@/components/NeonButton';
import NeonInput from '@/components/NeonInput';
import GlitchText from '@/components/GlitchText';
import MatrixRain from '@/components/MatrixRain';
import { useTheme } from '@/hooks/useTheme';

const Authentication = () => {
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setToken: setAuthToken, setUser, user } = useAuthStore();
  const navigate = useNavigate();
  const { theme } = useTheme();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleAuth = async () => {
    if (!token.trim()) {
      toast.error('Please enter a GitHub token');
      return;
    }

    setIsLoading(true);
    
    try {
      // Create Octokit instance with the token
      const octokit = new Octokit({ auth: token });
      
      // Get user data to verify the token
      const { data } = await octokit.rest.users.getAuthenticated();
      
      if (data) {
        // Set user and token in auth store
        setUser({
          username: data.login,
          email: data.email || '',
          avatarUrl: data.avatar_url
        });
        setAuthToken(token);
        
        toast.success('GitHub authentication successful!');
        navigate('/');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error('Authentication failed. Please check your token and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAuth();
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
            <GlitchText text="Matrix Synapse Terminal" variant="title" className="mb-2" />
            <p className="text-matrix-primary/70">Access granted only to authorized users</p>
          </div>
          
          <div className="matrix-card">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-black/50 rounded-full border-2 border-matrix-primary/30">
                <Github size={32} className="text-matrix-primary" />
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-center text-matrix-primary mb-6">
              GitHub Authentication
            </h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="token" className="block text-matrix-primary/80 mb-2 flex items-center">
                  <Lock size={16} className="mr-2" />
                  GitHub Personal Access Token
                </label>
                <NeonInput
                  id="token"
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter your GitHub token"
                />
                <p className="text-matrix-primary/60 text-sm mt-2">
                  Token requires <code className="bg-black/40 px-1 rounded">repo</code> scope
                </p>
              </div>
              
              <NeonButton 
                onClick={handleAuth} 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Authenticating...' : 'Connect to GitHub'}
                {!isLoading && <ArrowRight size={16} className="ml-2" />}
              </NeonButton>
            </div>
            
            <div className="mt-6 pt-4 border-t border-matrix-primary/20">
              <h3 className="text-matrix-primary/90 font-bold mb-2">How to get a token:</h3>
              <ol className="list-decimal list-inside text-matrix-primary/70 text-sm space-y-1">
                <li>Go to GitHub Settings → Developer settings → <a 
                  href="https://github.com/settings/tokens" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-matrix-primary underline"
                >Personal access tokens</a></li>
                <li>Click "Generate new token" (classic)</li>
                <li>Add a note like "Matrix Synapse Terminal"</li>
                <li>Select the <code className="bg-black/40 px-1 rounded">repo</code> scope</li>
                <li>Click "Generate token" and copy it</li>
              </ol>
              <p className="text-red-400 mt-4 text-sm">
                <strong>Important:</strong> Save your token securely! GitHub will only show it once.
              </p>
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

const Info = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;

export default Authentication;
