import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Terminal, ArrowLeft, Play, XCircle } from 'lucide-react';
import { toast } from 'sonner';

import NeonButton from '@/components/NeonButton';
import GlitchText from '@/components/GlitchText';
import MatrixRain from '@/components/MatrixRain';
import { useTheme } from '@/hooks/useTheme';

interface CommandOutput {
  command: string;
  output: string;
  success: boolean;
  timestamp: string;
}

const GitCommands = () => {
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<CommandOutput[]>([]);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { repo, user, octokit } = useAuthStore();
  
  if (!user) {
    navigate('/authentication');
    return null;
  }
  
  if (!repo) {
    navigate('/');
    toast.error('Please connect a repository first');
    return null;
  }
  
  const executeCommand = async () => {
    if (!command.trim() || !octokit) return;
    
    setLoading(true);
    
    try {
      let output = '';
      const timestamp = new Date().toLocaleString();
      const cmd = command.trim().toLowerCase();
      
      // Parse the command
      if (cmd === 'help') {
        output = `
Available commands:
- help: Show this help message
- ls: List files in the repository root
- ls <path>: List files in the specified path
- cat <file>: Show the content of a file
- info: Show repository information
- status: Show repository status
- branches: List branches
- commits: Show recent commits
        `;
      } else if (cmd === 'ls' || cmd.startsWith('ls ')) {
        const path = cmd.startsWith('ls ') ? cmd.substring(3).trim() : '';
        
        try {
          const { data } = await octokit.rest.repos.getContent({
            owner: repo.owner,
            repo: repo.name,
            path
          });
          
          if (Array.isArray(data)) {
            output = data.map(item => `${item.type === 'dir' ? '[DIR] ' : ''}${item.name}`).join('\n');
          } else {
            output = 'Not a directory';
          }
        } catch (e) {
          output = `Error: ${e instanceof Error ? e.message : 'Path not found'}`;
        }
      } else if (cmd.startsWith('cat ')) {
        const path = cmd.substring(4).trim();
        
        try {
          const { data } = await octokit.rest.repos.getContent({
            owner: repo.owner,
            repo: repo.name,
            path
          });
          
          if (Array.isArray(data)) {
            output = 'Error: Path is a directory, not a file';
          } else if ('content' in data) {
            output = Buffer.from(data.content, 'base64').toString('utf-8');
          } else {
            output = 'Error: File does not contain readable content';
          }
        } catch (e) {
          output = `Error: ${e instanceof Error ? e.message : 'File not found'}`;
        }
      } else if (cmd === 'info') {
        const { data } = await octokit.rest.repos.get({
          owner: repo.owner,
          repo: repo.name
        });
        
        output = `
Repository: ${data.full_name}
Description: ${data.description || 'No description'}
Created: ${new Date(data.created_at).toLocaleString()}
Last Updated: ${new Date(data.updated_at).toLocaleString()}
Default Branch: ${data.default_branch}
Size: ${data.size} KB
Forks: ${data.forks_count}
Stars: ${data.stargazers_count}
Watchers: ${data.watchers_count}
        `;
      } else if (cmd === 'status') {
        // Get branch info
        const { data: branchData } = await octokit.rest.repos.getBranch({
          owner: repo.owner,
          repo: repo.name,
          branch: 'main'
        });
        
        // Get recent commits
        const { data: commitsData } = await octokit.rest.repos.listCommits({
          owner: repo.owner,
          repo: repo.name,
          per_page: 1
        });
        
        output = `
Current Branch: ${branchData.name}
Last Commit: ${commitsData[0]?.commit.message || 'No commits'}
Last Commit Date: ${commitsData[0]?.commit.author?.date ? new Date(commitsData[0].commit.author.date).toLocaleString() : 'N/A'}
Last Commit Author: ${commitsData[0]?.commit.author?.name || 'Unknown'}
        `;
      } else if (cmd === 'branches') {
        const { data } = await octokit.rest.repos.listBranches({
          owner: repo.owner,
          repo: repo.name
        });
        
        output = data.map(branch => branch.name).join('\n');
      } else if (cmd === 'commits') {
        const { data } = await octokit.rest.repos.listCommits({
          owner: repo.owner,
          repo: repo.name,
          per_page: 10
        });
        
        output = data.map(commit => 
          `${commit.sha.substring(0, 7)} - ${new Date(commit.commit.author?.date || '').toLocaleString()} - ${commit.commit.message}`
        ).join('\n');
      } else {
        output = `Command not found: ${command}. Type 'help' for available commands.`;
      }
      
      setHistory(prev => [
        ...prev, 
        { 
          command, 
          output: output.trim(), 
          success: !output.toLowerCase().includes('error'), 
          timestamp 
        }
      ]);
      setCommand('');
    } catch (err) {
      console.error('Error executing command:', err);
      setHistory(prev => [
        ...prev, 
        { 
          command, 
          output: `Error: ${err instanceof Error ? err.message : 'Failed to execute command'}`, 
          success: false,
          timestamp: new Date().toLocaleString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand();
    }
  };
  
  const clearHistory = () => {
    setHistory([]);
    toast.success('Command history cleared');
  };
  
  return (
    <div className="min-h-screen bg-matrix-background p-4">
      {theme.showCodeRain && <MatrixRain speed={theme.speed} />}
      
      <div className="container mx-auto max-w-4xl py-8">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 flex items-center text-matrix-primary hover:text-matrix-primary/70"
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Home
        </motion.button>
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div className="flex items-center">
            <Terminal size={24} className="text-matrix-primary mr-3" />
            <GlitchText text="Git Commands" variant="title" />
          </div>
          
          <div className="flex items-center space-x-4">
            <NeonButton onClick={clearHistory} secondary>
              <XCircle size={18} className="mr-2" />
              Clear History
            </NeonButton>
          </div>
        </motion.div>
        
        <div className="matrix-card p-6">
          <div className="bg-black/50 rounded-md p-4 font-mono text-sm text-matrix-primary min-h-64 max-h-96 overflow-auto mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex space-x-1">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <p className="text-xs text-matrix-primary/60">git@{repo.owner}/{repo.name}</p>
            </div>
            
            <div className="border-t border-matrix-primary/20 pt-4">
              {history.length === 0 ? (
                <p className="text-matrix-primary/60 italic">
                  Type 'help' to see available commands
                </p>
              ) : (
                history.map((entry, index) => (
                  <div key={index} className="mb-4">
                    <div className="flex">
                      <span className="text-matrix-primary/70 mr-2">$</span>
                      <span className="text-matrix-primary">{entry.command}</span>
                    </div>
                    <div className={`mt-1 mb-2 whitespace-pre-wrap ${entry.success ? 'text-matrix-primary/90' : 'text-red-400'}`}>
                      {entry.output}
                    </div>
                    <div className="text-xs text-matrix-primary/50">{entry.timestamp}</div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="flex items-center">
            <span className="text-matrix-primary/70 mr-2">$</span>
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type git command..."
              className="flex-1 bg-transparent border-none text-matrix-primary outline-none"
              disabled={loading}
            />
            <NeonButton 
              onClick={executeCommand} 
              disabled={loading || !command.trim()}
              secondary
            >
              <Play size={16} />
            </NeonButton>
          </div>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-matrix-primary/70 text-sm"
        >
          <h3 className="font-bold mb-2">Common Git Commands:</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <li><code>help</code> - Show available commands</li>
            <li><code>ls</code> - List files in repository root</li>
            <li><code>ls [path]</code> - List files in specified path</li>
            <li><code>cat [file]</code> - Show file content</li>
            <li><code>info</code> - Show repository info</li>
            <li><code>status</code> - Check repository status</li>
            <li><code>branches</code> - List all branches</li>
            <li><code>commits</code> - Show recent commits</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default GitCommands;
