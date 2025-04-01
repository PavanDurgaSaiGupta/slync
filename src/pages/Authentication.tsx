
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Octokit } from 'octokit';
import { toast } from 'sonner';
import { 
  Github, 
  Lock, 
  User, 
  Mail,
  KeyRound,
  ArrowRight, 
  Code, 
  Plus,
  Search,
  Info
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
  
  // Regular authentication
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI state
  const [authMethod, setAuthMethod] = useState<'token' | 'repo'>('token');
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [createNewRepo, setCreateNewRepo] = useState(false);
  const [newRepoName, setNewRepoName] = useState('');
  const [userRepos, setUserRepos] = useState<{name: string, full_name: string}[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { setToken: setAuthToken, setUser, user, connectRepo } = useAuthStore();
  const navigate = useNavigate();
  const { theme } = useTheme();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleGitHubAuth = async () => {
    setIsLoading(true);
    
    try {
      // In a real implementation, this would redirect to GitHub OAuth
      toast.info('Redirecting to GitHub for authentication...');
      
      // Simulate GitHub OAuth flow
      // In a real implementation, this would be handled by GitHub OAuth
      setTimeout(() => {
        // This is where we'd handle the OAuth callback
        // For now, just show a prompt for token
        const simulatedToken = prompt("Enter your GitHub token (simulation of OAuth):");
        if (simulatedToken) {
          handleAuthWithToken(simulatedToken);
        } else {
          setIsLoading(false);
          toast.error('Authentication cancelled');
        }
      }, 1500);
    } catch (error) {
      console.error('GitHub auth error:', error);
      toast.error('Failed to authenticate with GitHub');
      setIsLoading(false);
    }
  };

  const handleAuthWithToken = async (providedToken?: string) => {
    const tokenToUse = providedToken || token;
    
    if (!tokenToUse.trim()) {
      toast.error('Please enter a GitHub token');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    try {
      // Create Octokit instance with the token
      const octokit = new Octokit({ auth: tokenToUse });
      
      // Get user data to verify the token
      const { data } = await octokit.rest.users.getAuthenticated();
      
      if (data) {
        // Set user and token in auth store
        setUser({
          username: data.login,
          email: data.email || '',
          avatarUrl: data.avatar_url
        });
        setAuthToken(tokenToUse);
        
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
    if (createNewRepo) {
      if (!newRepoName.trim()) {
        toast.error('Please enter a repository name');
        return;
      }
      
      setIsLoading(true);
      
      try {
        // Create Octokit instance with the token
        const octokit = new Octokit({ auth: token });
        
        // Create the new repository
        const { data } = await octokit.rest.repos.createForAuthenticatedUser({
          name: newRepoName,
          description: 'Repository for Slync app data',
          auto_init: true
        });
        
        if (data) {
          // Connect to the new repository
          await connectRepo(data.html_url);
          navigate('/');
          toast.success('Repository created and connected successfully!');
        }
      } catch (error) {
        console.error('Repository creation error:', error);
        toast.error('Failed to create repository. Please try again.');
      } finally {
        setIsLoading(false);
      }
      
      return;
    }
    
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
  
  const handleLoginWithPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Email and password are required');
      return;
    }
    
    // Simulate login - in a real app, we would connect to a backend
    setUser({
      username: email.split('@')[0],
      email,
      avatarUrl: `https://avatars.dicebear.com/api/identicon/${email}.svg`
    });
    
    navigate('/');
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !email || !password) {
      toast.error('Username, email, and password are required');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (authMethod === 'token') {
        handleAuthWithToken();
      } else {
        handleAuthWithRepo();
      }
    }
  };
  
  const handleSelectRepo = (repoFullName: string) => {
    setRepoUrl(`https://github.com/${repoFullName}`);
  };
  
  const filteredRepos = userRepos.filter(repo => 
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const renderAuthForm = () => {
    if (authMethod === 'token') {
      if (user && token) {
        return (
          <div className="space-y-6">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-black/50 rounded-full border-2 border-matrix-primary/30">
                <User size={32} className="text-matrix-primary" />
              </div>
            </div>
            
            <div className="matrix-glass p-4 rounded-md">
              <p className="text-matrix-primary/70 mb-2">Authenticated as:</p>
              <p className="neon-text font-mono">{user.username}</p>
              <p className="text-matrix-primary/70 text-sm">{user.email}</p>
            </div>
            
            <div className="flex justify-between">
              <NeonButton 
                onClick={() => setAuthMethod('repo')}
                className="flex-1"
              >
                Connect Repository
              </NeonButton>
            </div>
          </div>
        );
      }
      
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
          
          <div className="flex mb-4">
            <button 
              className={`flex-1 py-2 px-4 ${authTab === 'login' ? 'border-b-2 border-matrix-primary text-matrix-primary' : 'text-matrix-primary/50'}`}
              onClick={() => setAuthTab('login')}
            >
              <span className="flex items-center justify-center text-sm">
                <KeyRound size={14} className="mr-1" />
                Sign In
              </span>
            </button>
            <button 
              className={`flex-1 py-2 px-4 ${authTab === 'register' ? 'border-b-2 border-matrix-primary text-matrix-primary' : 'text-matrix-primary/50'}`}
              onClick={() => setAuthTab('register')}
            >
              <span className="flex items-center justify-center text-sm">
                <Plus size={14} className="mr-1" />
                Register
              </span>
            </button>
          </div>
          
          {authTab === 'login' ? (
            <form onSubmit={handleLoginWithPassword} className="space-y-4">
              <div>
                <NeonInput
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail size={18} />}
                />
              </div>
              
              <div>
                <NeonInput
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<KeyRound size={18} />}
                />
              </div>
              
              <NeonButton type="submit" className="w-full">
                Sign In
                <ArrowRight size={16} className="ml-2" />
              </NeonButton>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <NeonInput
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  icon={<User size={18} />}
                />
              </div>
              
              <div>
                <NeonInput
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail size={18} />}
                />
              </div>
              
              <div>
                <NeonInput
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<KeyRound size={18} />}
                />
              </div>
              
              <div>
                <NeonInput
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  icon={<KeyRound size={18} />}
                />
              </div>
              
              <NeonButton type="submit" className="w-full">
                Register
                <ArrowRight size={16} className="ml-2" />
              </NeonButton>
            </form>
          )}
          
          <div className="relative flex items-center">
            <div className="flex-grow border-t border-matrix-primary/30"></div>
            <span className="flex-shrink mx-4 text-matrix-primary/60">OR</span>
            <div className="flex-grow border-t border-matrix-primary/30"></div>
          </div>
          
          <NeonButton 
            onClick={handleGitHubAuth} 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Authenticating...' : 'Continue with GitHub'}
            {!isLoading && <Github size={16} className="ml-2" />}
          </NeonButton>
          
          <div className="relative flex items-center">
            <div className="flex-grow border-t border-matrix-primary/30"></div>
            <span className="flex-shrink mx-4 text-matrix-primary/60">OR</span>
            <div className="flex-grow border-t border-matrix-primary/30"></div>
          </div>
          
          <div>
            <label htmlFor="github-token" className="block text-matrix-primary/80 mb-2 flex items-center">
              <Lock size={16} className="mr-2" />
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
            onClick={() => handleAuthWithToken()} 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Authenticating...' : 'Continue with Token'}
            {!isLoading && <ArrowRight size={16} className="ml-2" />}
          </NeonButton>
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
          
          <div className="flex mb-4">
            <button 
              className={`flex-1 py-2 px-4 ${!createNewRepo ? 'border-b-2 border-matrix-primary text-matrix-primary' : 'text-matrix-primary/50'}`}
              onClick={() => setCreateNewRepo(false)}
            >
              <span className="flex items-center justify-center text-sm">
                <Github size={14} className="mr-1" />
                Connect Existing
              </span>
            </button>
            <button 
              className={`flex-1 py-2 px-4 ${createNewRepo ? 'border-b-2 border-matrix-primary text-matrix-primary' : 'text-matrix-primary/50'}`}
              onClick={() => setCreateNewRepo(true)}
            >
              <span className="flex items-center justify-center text-sm">
                <Plus size={14} className="mr-1" />
                Create New
              </span>
            </button>
          </div>
          
          {createNewRepo ? (
            <div>
              <label className="block text-matrix-primary/80 mb-2 flex items-center">
                <Plus size={16} className="mr-2" />
                New Repository Name
              </label>
              <NeonInput
                type="text"
                value={newRepoName}
                onChange={(e) => setNewRepoName(e.target.value)}
                placeholder="my-slync-repo"
              />
              <p className="text-matrix-primary/60 text-sm mt-2">
                A new public repository will be created
              </p>
            </div>
          ) : (
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
                  <div className="relative mb-2">
                    <NeonInput
                      type="text"
                      placeholder="Search your repositories"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      icon={<Search size={18} />}
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto matrix-glass p-2 rounded">
                    {filteredRepos.length > 0 ? (
                      filteredRepos.map((repo, index) => (
                        <div 
                          key={index} 
                          className="p-2 hover:bg-matrix-primary/10 rounded cursor-pointer flex items-center"
                          onClick={() => handleSelectRepo(repo.full_name)}
                        >
                          <Github size={14} className="mr-2 text-matrix-primary/70" />
                          <span className="text-matrix-primary text-sm">{repo.full_name}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center p-2 text-matrix-primary/50 text-sm">
                        No repositories found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <NeonButton 
            onClick={handleAuthWithRepo} 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Connecting...' : createNewRepo ? 'Create Repository' : 'Connect Repository'}
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
            <GlitchText text="Slync Terminal" variant="title" className="mb-2" />
            <p className="text-matrix-primary/70">Access granted only to authorized users</p>
          </div>
          
          <div className="matrix-card">
            {renderAuthForm()}
            
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
                <li>Add a note like "Slync Terminal"</li>
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

export default Authentication;
