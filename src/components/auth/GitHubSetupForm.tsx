
import React, { useState, useEffect } from 'react';
import { Github, Link, ArrowRight, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Octokit } from 'octokit';
import NeonButton from '@/components/NeonButton';
import NeonInput from '@/components/NeonInput';
import { useAuthStore } from '@/store/authStore';

interface GitHubSetupFormProps {
  onComplete: () => void;
  onHelp: () => void;
  onBack?: () => void;
}

const GitHubSetupForm: React.FC<GitHubSetupFormProps> = ({ 
  onComplete, 
  onHelp,
  onBack
}) => {
  const [token, setToken] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [userRepos, setUserRepos] = useState<{name: string, full_name: string}[]>([]);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const { setToken: storeToken, user, connectRepo } = useAuthStore();

  const handleTokenAuth = async () => {
    if (!token.trim()) {
      toast.error('Please enter a GitHub token');
      setAuthError('Please enter a GitHub token');
      return;
    }

    setIsLoading(true);
    setAuthError(null);
    
    try {
      // Create Octokit instance with the token
      const octokit = new Octokit({ auth: token });
      
      // Get user data to verify the token
      const { data } = await octokit.rest.users.getAuthenticated();
      
      if (data) {
        // Set token in auth store
        storeToken(token);
        
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
        setStep(2);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      const errorMessage = 'Authentication failed. Please check your token and try again.';
      toast.error(errorMessage);
      setAuthError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleConnectRepo = async () => {
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
      toast.success('Repository connected successfully!');
      onComplete();
    } catch (error: any) {
      console.error('Repository connection error:', error);
      toast.error('Failed to connect to repository. Make sure you have the correct permissions.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRepo = (repoFullName: string) => {
    setRepoUrl(`https://github.com/${repoFullName}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (step === 1) {
        handleTokenAuth();
      } else if (step === 2) {
        handleConnectRepo();
      }
    }
  };

  if (step === 1) {
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
          
          {authError && (
            <p className="text-red-400 text-sm mt-2">
              {authError}
            </p>
          )}
        </div>
        
        <NeonButton 
          onClick={handleTokenAuth} 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Authenticating...' : 'Continue with Token'}
          {!isLoading && <ArrowRight size={16} className="ml-2" />}
        </NeonButton>
        
        {onBack && (
          <div className="flex justify-between">
            <NeonButton 
              onClick={onBack}
              className="flex-1"
              secondary
            >
              Back to Login
            </NeonButton>
          </div>
        )}
        
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
        
        <div className="mt-6">
          <NeonButton 
            onClick={onHelp} 
            secondary 
            className="w-full"
          >
            <Info size={16} className="mr-2" />
            How to Use This App
          </NeonButton>
        </div>
      </div>
    );
  } else {
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
          onClick={handleConnectRepo} 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Connecting...' : 'Connect Repository'}
          {!isLoading && <ArrowRight size={16} className="ml-2" />}
        </NeonButton>
        
        <div className="flex justify-between">
          <NeonButton 
            onClick={() => setStep(1)}
            className="flex-1"
            secondary
          >
            Back to Token Input
          </NeonButton>
        </div>
        
        <div className="mt-6">
          <NeonButton 
            onClick={onHelp} 
            secondary 
            className="w-full"
          >
            <Info size={16} className="mr-2" />
            How to Use This App
          </NeonButton>
        </div>
      </div>
    );
  }
};

export default GitHubSetupForm;
