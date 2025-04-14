
import React, { useState } from 'react';
import { Github, Link, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import NeonButton from '@/components/NeonButton';
import NeonInput from '@/components/NeonInput';
import { useAuthStore } from '@/store/authStore';

interface GitHubSetupProps {
  onComplete: () => void;
  isLoading: boolean;
}

const GitHubSetup: React.FC<GitHubSetupProps> = ({ onComplete, isLoading }) => {
  const [token, setToken] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [step, setStep] = useState(1);
  const [setupLoading, setSetupLoading] = useState(false);
  
  const { setToken: storeToken, connectRepo } = useAuthStore();

  const handleSetToken = async () => {
    if (!token.trim()) {
      toast.error('Please enter a valid GitHub token');
      return;
    }
    
    setSetupLoading(true);
    try {
      storeToken(token);
      toast.success('GitHub token set successfully');
      setStep(2);
    } catch (error: any) {
      toast.error(error.message || 'Failed to set GitHub token');
    } finally {
      setSetupLoading(false);
    }
  };

  const handleConnectRepo = async () => {
    if (!repoUrl.trim()) {
      toast.error('Please enter a valid GitHub repository URL');
      return;
    }
    
    setSetupLoading(true);
    try {
      await connectRepo(repoUrl);
      toast.success('Repository connected successfully');
      onComplete();
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect repository');
    } finally {
      setSetupLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center mb-6">
        <div className="p-3 bg-black/50 rounded-full border-2 border-matrix-primary">
          <Github size={32} className="text-matrix-primary" />
        </div>
      </div>
      
      <h2 className="text-xl font-bold text-center text-matrix-primary mb-6">
        Connect to GitHub
      </h2>
      
      {step === 1 ? (
        <div className="space-y-4">
          <p className="text-matrix-primary/80 text-sm mb-4">
            Enter your GitHub Personal Access Token to connect SLYNC to your GitHub account.
          </p>
          
          <div>
            <label className="block text-matrix-primary/80 mb-2 flex items-center">
              <Github size={16} className="mr-2" />
              GitHub Token
            </label>
            <NeonInput
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_..."
              icon={<Github size={18} />}
            />
            <p className="text-xs text-matrix-primary/60 mt-1">
              Need a token? 
              <a 
                href="https://github.com/settings/tokens/new" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-matrix-primary ml-1 hover:underline"
              >
                Create one here
              </a>
              . Ensure it has 'repo' scope.
            </p>
          </div>
          
          <NeonButton 
            onClick={handleSetToken}
            className="w-full"
            disabled={setupLoading || isLoading}
          >
            {setupLoading ? 'Processing...' : 'Continue'}
            {!setupLoading && <ArrowRight size={16} className="ml-2" />}
          </NeonButton>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-matrix-primary/80 text-sm mb-4">
            Enter your GitHub repository URL to store your SLYNC data.
          </p>
          
          <div>
            <label className="block text-matrix-primary/80 mb-2 flex items-center">
              <Link size={16} className="mr-2" />
              Repository URL
            </label>
            <NeonInput
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/username/repo"
              icon={<Link size={18} />}
            />
            <p className="text-xs text-matrix-primary/60 mt-1">
              Enter an existing repository URL or we'll create one for you.
            </p>
          </div>
          
          <NeonButton 
            onClick={handleConnectRepo}
            className="w-full"
            disabled={setupLoading || isLoading}
          >
            {setupLoading ? 'Connecting...' : 'Connect Repository'}
            {!setupLoading && <ArrowRight size={16} className="ml-2" />}
          </NeonButton>
        </div>
      )}
    </div>
  );
};

export default GitHubSetup;
