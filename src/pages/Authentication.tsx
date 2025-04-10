
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Octokit } from 'octokit';
import { toast } from 'sonner';
import { 
  Github, 
  Info,
  Code,
  ArrowRight,
  User,
  Mail,
  Key,
  Save,
  Lock
} from 'lucide-react';

import NeonButton from '@/components/NeonButton';
import NeonInput from '@/components/NeonInput';
import GlitchText from '@/components/GlitchText';
import MatrixRain from '@/components/MatrixRain';
import { useTheme } from '@/hooks/useTheme';

const Authentication = () => {
  // GitHub token authentication
  const [token, setToken] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  
  // Local registration credentials
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localUsers, setLocalUsers] = useState<{email: string, username: string, password: string}[]>([]);
  
  // UI state
  const [authMethod, setAuthMethod] = useState<'token' | 'repo' | 'local'>('local');
  const [isLoading, setIsLoading] = useState(false);
  const [userRepos, setUserRepos] = useState<{name: string, full_name: string}[]>([]);
  
  const { setToken: setAuthToken, setUser, user, connectRepo } = useAuthStore();
  const navigate = useNavigate();
  const { theme } = useTheme();

  useEffect(() => {
    if (user && token) {
      navigate('/');
    }
    
    // Load any saved local users from localStorage
    const savedUsers = localStorage.getItem('slync-local-users');
    if (savedUsers) {
      try {
        setLocalUsers(JSON.parse(savedUsers));
      } catch (e) {
        console.error('Error parsing saved users:', e);
      }
    }
  }, [user, token, navigate]);

  const handleAuthWithToken = async () => {
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
        
        // Fetch user repositories
        const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
          sort: 'updated',
          per_page: 100
        });
        
        setUserRepos(repos.map(repo => ({
          name: repo.name,
          full_name: repo.full_name
        })));
        
        toast.success('GitHub authentication successful!');
        setAuthMethod('repo');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error('Authentication failed. Please check your token and try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAuthWithRepo = async () => {
    if (!repoUrl.trim()) {
      toast.error('Please enter a GitHub repository URL');
      return;
    }
    
    if (!repoUrl.includes('github.com')) {
      toast.error('Please enter a valid GitHub repository URL');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await connectRepo(repoUrl);
      navigate('/');
    } catch (error) {
      console.error('Repository connection error:', error);
      toast.error('Failed to connect to repository. Make sure you have authenticated with a token first.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (authMethod === 'token') {
        handleAuthWithToken();
      } else if (authMethod === 'repo') {
        handleAuthWithRepo();
      } else if (authMethod === 'local') {
        if (isRegistering) {
          handleRegister();
        } else {
          handleLocalLogin();
        }
      }
    }
  };
  
  const handleSelectRepo = (repoFullName: string) => {
    setRepoUrl(`https://github.com/${repoFullName}`);
  };
  
  const handleLocalLogin = () => {
    if (!email && !username) {
      toast.error('Please enter your email or username');
      return;
    }
    
    if (!password) {
      toast.error('Please enter your password');
      return;
    }
    
    // Find user by email or username
    const foundUser = localUsers.find(u => 
      (email && u.email.toLowerCase() === email.toLowerCase()) || 
      (username && u.username.toLowerCase() === username.toLowerCase())
    );
    
    if (!foundUser) {
      toast.error('User not found. Please register first.');
      return;
    }
    
    if (foundUser.password !== password) {
      toast.error('Incorrect password');
      return;
    }
    
    // Set user in auth store
    setUser({
      username: foundUser.username,
      email: foundUser.email,
      avatarUrl: ''
    });
    
    toast.success('Login successful!');
    
    // Direct to token input
    setAuthMethod('token');
    toast.info('Please enter your GitHub token to continue');
  };
  
  const handleRegister = () => {
    if (!email || !username || !password) {
      toast.error('Please fill all fields');
      return;
    }
    
    // Check if user already exists
    if (localUsers.some(u => 
      u.email.toLowerCase() === email.toLowerCase() || 
      u.username.toLowerCase() === username.toLowerCase()
    )) {
      toast.error('User with this email or username already exists');
      return;
    }
    
    // Add new user
    const newUsers = [...localUsers, { email, username, password }];
    setLocalUsers(newUsers);
    
    // Save to localStorage
    localStorage.setItem('slync-local-users', JSON.stringify(newUsers));
    
    // Export users as CSV
    exportUsersAsCSV(newUsers);
    
    toast.success('Registration successful! Your credentials have been saved locally and exported as CSV.');
    
    // Clear form and switch to login
    setIsRegistering(false);
  };
  
  const exportUsersAsCSV = (users: {email: string, username: string, password: string}[]) => {
    const csvContent = 'email,username,password\n' + 
      users.map(user => `"${user.email}","${user.username}","${user.password}"`).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'slync-users.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const renderAuthForm = () => {
    if (authMethod === 'local') {
      return (
        <div className="space-y-6">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-black/50 rounded-full border-2 border-matrix-primary/30">
              <User size={32} className="text-matrix-primary" />
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-center text-matrix-primary mb-6">
            {isRegistering ? 'Register Account' : 'Local Login'}
          </h2>
          
          {isRegistering && (
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
          )}
          
          <div>
            <label className="block text-matrix-primary/80 mb-2 flex items-center">
              <User size={16} className="mr-2" />
              {isRegistering ? 'Username' : 'Email or Username'}
            </label>
            <NeonInput
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isRegistering ? "Enter username" : "Enter email or username"}
              icon={<User size={18} />}
            />
          </div>
          
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
            onClick={isRegistering ? handleRegister : handleLocalLogin} 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : isRegistering ? 'Register' : 'Login'}
            {!isLoading && <ArrowRight size={16} className="ml-2" />}
          </NeonButton>
          
          <div className="text-center">
            <button 
              className="text-matrix-primary/70 hover:text-matrix-primary text-sm"
              onClick={() => setIsRegistering(!isRegistering)}
            >
              {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
            </button>
          </div>
        </div>
      );
    } else if (authMethod === 'token') {
      return (
        <div className="space-y-6">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-black/50 rounded-full border-2 border-matrix-primary/30">
              <Github size={32} className="text-matrix-primary" />
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-center text-matrix-primary mb-6">
            GitHub Authentication
          </h2>
          
          {user && (
            <div className="matrix-glass p-4 rounded-md mb-4">
              <p className="text-matrix-primary/70 mb-2">Logged in as:</p>
              <p className="neon-text font-mono">{user.username}</p>
              <p className="text-matrix-primary/70 text-sm">{user.email}</p>
            </div>
          )}
          
          <div>
            <label className="block text-matrix-primary/80 mb-2 flex items-center">
              <Github size={16} className="mr-2" />
              GitHub Personal Access Token
            </label>
            <NeonInput
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your GitHub token"
              icon={<Github size={18} />}
            />
            <p className="text-matrix-primary/60 text-sm mt-2">
              Token requires <code className="bg-black/40 px-1 rounded">repo</code> scope
            </p>
          </div>
          
          <NeonButton 
            onClick={handleAuthWithToken} 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Authenticating...' : 'Continue with Token'}
            {!isLoading && <ArrowRight size={16} className="ml-2" />}
          </NeonButton>
          
          <div className="flex justify-between">
            <NeonButton 
              onClick={() => setAuthMethod('local')}
              className="flex-1"
              secondary
            >
              Back to Login
            </NeonButton>
          </div>
          
          <div className="mt-6 pt-4 border-t border-matrix-primary/20">
            <h3 className="text-matrix-primary/90 font-bold mb-2">How to get a GitHub token:</h3>
            <ol className="list-decimal list-inside text-matrix-primary/70 text-sm space-y-1">
              <li>Go to GitHub Settings → Developer settings → <a 
                href="https://github.com/settings/tokens" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-matrix-primary underline"
              >Personal access tokens</a></li>
              <li>Click "Generate new token (classic)"</li>
              <li>Add a note like "SLYNC App"</li>
              <li>Set an expiration date (or "No expiration" for convenience)</li>
              <li>Select the <code className="bg-black/40 px-1 rounded">repo</code> scope (this is required)</li>
              <li>Click "Generate token" and copy it</li>
            </ol>
            <p className="text-red-400 mt-4 text-sm">
              <strong>Important:</strong> Save your token securely! GitHub will only show it once.
            </p>
          </div>
        </div>
      );
    } else {
      // Repo connection UI
      return (
        <div className="space-y-6">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-black/50 rounded-full border-2 border-matrix-primary/30">
              <Github size={32} className="text-matrix-primary" />
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-center text-matrix-primary mb-6">
            Connect Repository
          </h2>
          
          <div className="matrix-glass p-4 rounded-md mb-4">
            <p className="text-matrix-primary/70 mb-2">Authenticated as:</p>
            <p className="neon-text font-mono">{user?.username}</p>
            <p className="text-matrix-primary/70 text-sm">{user?.email}</p>
          </div>
          
          <div>
            <label className="block text-matrix-primary/80 mb-2 flex items-center">
              <Github size={16} className="mr-2" />
              GitHub Repository URL
            </label>
            <NeonInput
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="https://github.com/username/repo"
              icon={<Github size={18} />}
            />
            
            {userRepos.length > 0 && (
              <div className="mt-4">
                <div className="max-h-40 overflow-y-auto matrix-glass p-2 rounded">
                  {userRepos.map((repo, index) => (
                    <div 
                      key={index} 
                      className="p-2 hover:bg-matrix-primary/10 rounded cursor-pointer flex items-center"
                      onClick={() => handleSelectRepo(repo.full_name)}
                    >
                      <Github size={14} className="mr-2 text-matrix-primary/70" />
                      <span className="text-matrix-primary text-sm">{repo.full_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <NeonButton 
            onClick={handleAuthWithRepo} 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Connecting...' : 'Connect Repository'}
            {!isLoading && <ArrowRight size={16} className="ml-2" />}
          </NeonButton>
          
          <div className="flex justify-between">
            <NeonButton 
              onClick={() => setAuthMethod('token')}
              className="flex-1"
              secondary
            >
              Back to Auth Options
            </NeonButton>
          </div>
        </div>
      );
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
            <p className="text-matrix-primary/70">Sync your data with GitHub</p>
          </div>
          
          <div className="matrix-card">
            {renderAuthForm()}
            
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

export default Authentication;
