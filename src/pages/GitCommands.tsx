
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Terminal as TerminalIcon, ArrowLeft, Send } from 'lucide-react';
import { toast } from 'sonner';

import NeonButton from '@/components/NeonButton';
import NeonInput from '@/components/NeonInput';
import GlitchText from '@/components/GlitchText';
import MatrixRain from '@/components/MatrixRain';
import { useTheme } from '@/hooks/useTheme';

interface CommandResult {
  command: string;
  output: string;
  success: boolean;
  timestamp: Date;
}

const GitCommands: React.FC = () => {
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<CommandResult[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { repo, user, octokit } = useAuthStore();
  
  useEffect(() => {
    if (!user) {
      navigate('/authentication');
      return;
    }
    
    if (!repo) {
      navigate('/');
      toast.error('Please connect a repository first');
      return;
    }
    
    // Initial welcome message
    setHistory([
      {
        command: '',
        output: `Welcome to the Slync Git Terminal.\nConnected to repository: ${repo.owner}/${repo.name}\nType 'help' for available commands.`,
        success: true,
        timestamp: new Date()
      }
    ]);
  }, [repo, user, navigate]);
  
  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!command.trim() || isExecuting) return;
    
    const trimmedCommand = command.trim();
    setHistory(prev => [...prev, {
      command: trimmedCommand,
      output: "Executing...",
      success: true,
      timestamp: new Date()
    }]);
    setCommand('');
    setIsExecuting(true);
    
    try {
      const output = await executeCommand(trimmedCommand);
      setHistory(prev => [
        ...prev.slice(0, -1),
        {
          command: trimmedCommand,
          output,
          success: true,
          timestamp: new Date()
        }
      ]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      setHistory(prev => [
        ...prev.slice(0, -1),
        {
          command: trimmedCommand,
          output: `Error: ${errorMessage}`,
          success: false,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsExecuting(false);
    }
  };
  
  const executeCommand = async (cmd: string): Promise<string> => {
    if (!repo || !octokit) throw new Error("Not connected to a repository");
    
    const cmdLower = cmd.toLowerCase();
    const args = cmd.split(' ').slice(1);
    
    // Help command
    if (cmdLower === 'help') {
      return `
Available commands:
  - ls [path]             : List files in repository (default: root)
  - cat <file_path>       : View file content
  - create <path> <data>  : Create or update a file
  - mkdir <path>          : Create a directory
  - info                  : Show repository information
  - help                  : Show this help message
  - clear                 : Clear the terminal
`;
    }
    
    // Clear command
    if (cmdLower === 'clear') {
      setTimeout(() => setHistory([]), 0);
      return "";
    }
    
    // Show repo info
    if (cmdLower === 'info') {
      try {
        const { data } = await octokit.rest.repos.get({
          owner: repo.owner,
          repo: repo.name
        });
        
        return `
Repository: ${data.full_name}
Description: ${data.description || 'No description'}
Visibility: ${data.visibility}
Default branch: ${data.default_branch}
Created: ${new Date(data.created_at).toLocaleString()}
Last push: ${data.pushed_at ? new Date(data.pushed_at).toLocaleString() : 'Never'}
Size: ${data.size} KB
`;
      } catch (error) {
        throw new Error("Failed to fetch repository information");
      }
    }
    
    // List files
    if (cmdLower.startsWith('ls')) {
      const path = args.length > 0 ? args.join(' ') : '';
      
      try {
        const { data } = await octokit.rest.repos.getContent({
          owner: repo.owner,
          repo: repo.name,
          path,
        });
        
        if (!Array.isArray(data)) {
          return `Error: '${path}' is not a directory`;
        }
        
        const dirs = data.filter(item => item.type === 'dir').map(item => `📁 ${item.name}/`);
        const files = data.filter(item => item.type === 'file').map(item => `📄 ${item.name}`);
        
        return [
          `Directory: /${path}`,
          ...dirs,
          ...files
        ].join('\n');
      } catch (error) {
        throw new Error(`Failed to list directory: ${path}`);
      }
    }
    
    // Cat command (view file)
    if (cmdLower.startsWith('cat ')) {
      if (args.length === 0) {
        return "Usage: cat <file_path>";
      }
      
      const filePath = args.join(' ');
      
      try {
        const { data } = await octokit.rest.repos.getContent({
          owner: repo.owner,
          repo: repo.name,
          path: filePath,
        });
        
        if (Array.isArray(data)) {
          return `Error: '${filePath}' is a directory, not a file`;
        }
        
        // Check if data has content property and is a file
        if ('content' in data && data.type === 'file') {
          // Decode base64 content
          let content: string;
          try {
            content = atob(data.content.replace(/\n/g, ''));
          } catch (e) {
            throw new Error("Failed to decode file content");
          }
          return content;
        } else {
          return `Error: Could not read file content for ${filePath}`;
        }
      } catch (error) {
        throw new Error(`Failed to get file: ${filePath}`);
      }
    }
    
    // Create directory
    if (cmdLower.startsWith('mkdir ')) {
      if (args.length === 0) {
        return "Usage: mkdir <directory_path>";
      }
      
      const dirPath = args.join(' ');
      
      try {
        await octokit.rest.repos.createOrUpdateFileContents({
          owner: repo.owner,
          repo: repo.name,
          path: `${dirPath}/.gitkeep`,
          message: `[Slync] Create directory: ${dirPath}`,
          content: btoa(' ') // Base64 encoded space
        });
        
        return `Directory created: ${dirPath}`;
      } catch (error) {
        throw new Error(`Failed to create directory: ${dirPath}`);
      }
    }
    
    // Create or update file
    if (cmdLower.startsWith('create ')) {
      const parts = cmd.split(' ');
      if (parts.length < 3) {
        return "Usage: create <file_path> <content>";
      }
      
      const filePath = parts[1];
      const fileContent = parts.slice(2).join(' ');
      
      try {
        // Check if file exists to get its SHA
        let sha: string | undefined;
        try {
          const { data } = await octokit.rest.repos.getContent({
            owner: repo.owner,
            repo: repo.name,
            path: filePath,
          });
          
          if (!Array.isArray(data) && 'sha' in data) {
            sha = data.sha;
          }
        } catch (e) {
          // File doesn't exist, which is fine
        }
        
        await octokit.rest.repos.createOrUpdateFileContents({
          owner: repo.owner,
          repo: repo.name,
          path: filePath,
          message: `[Slync] ${sha ? 'Update' : 'Create'} file: ${filePath}`,
          content: btoa(fileContent), // Base64 encode content
          sha // Include SHA if updating existing file
        });
        
        return `File ${sha ? 'updated' : 'created'}: ${filePath}`;
      } catch (error) {
        throw new Error(`Failed to ${sha ? 'update' : 'create'} file: ${filePath}`);
      }
    }
    
    return `Command not found: ${cmd}\nType 'help' for available commands.`;
  };
  
  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString();
  };
  
  return (
    <div className="min-h-screen bg-matrix-background p-4">
      {theme.showCodeRain && <MatrixRain speed={theme.speed} />}
      
      <div className="container mx-auto max-w-5xl py-8">
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
            <TerminalIcon size={24} className="text-matrix-primary mr-3" />
            <GlitchText text="Git Terminal" variant="title" />
          </div>
          
          <div className="text-matrix-primary/60 text-sm">
            {repo ? `Connected to: ${repo.owner}/${repo.name}` : 'Not connected'}
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="matrix-glass rounded-md overflow-hidden"
        >
          <div className="flex items-center justify-between bg-black/30 px-4 py-2 border-b border-matrix-primary/30">
            <div className="flex items-center">
              <div className="flex space-x-2 mr-4">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="text-matrix-primary/70 text-sm font-mono">
                {user?.username}@slync-terminal:~
              </span>
            </div>
            <span className="text-matrix-primary/50 text-xs">git terminal</span>
          </div>
          
          <div className="terminal-output bg-black/60 h-96 p-4 overflow-auto font-mono text-sm">
            {history.map((item, index) => (
              <div key={index} className="mb-4">
                {item.command && (
                  <div className="flex">
                    <span className="text-green-400 mr-2">$</span>
                    <span className="text-matrix-primary">{item.command}</span>
                  </div>
                )}
                <div className={`whitespace-pre-wrap ml-4 ${item.success ? 'text-matrix-primary/90' : 'text-red-400'}`}>
                  {item.output}
                </div>
                {item.timestamp && (
                  <div className="text-right text-matrix-primary/40 text-xs mt-1">
                    {formatTimestamp(item.timestamp)}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <form onSubmit={handleCommandSubmit} className="bg-black/40 p-3 border-t border-matrix-primary/30">
            <div className="flex items-center">
              <span className="text-green-400 mr-2">$</span>
              <NeonInput
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="Type a git command..."
                className="bg-transparent border-none focus:shadow-none flex-grow py-2"
                onKeyDown={(e) => e.key === 'Enter' && handleCommandSubmit(e)}
              />
              <NeonButton
                type="submit"
                disabled={isExecuting || !command.trim()}
                className="ml-2"
              >
                <Send size={18} />
              </NeonButton>
            </div>
          </form>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.3 }}}
          className="mt-6 matrix-glass p-4 rounded-md"
        >
          <h3 className="text-matrix-primary font-bold mb-2">Quick Commands</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button 
              className="matrix-glass p-2 rounded text-sm text-matrix-primary/80 hover:text-matrix-primary hover:bg-matrix-primary/10"
              onClick={() => {
                setCommand('ls');
                setTimeout(() => handleCommandSubmit({ preventDefault: () => {} } as React.FormEvent), 100);
              }}
            >
              ls
            </button>
            <button 
              className="matrix-glass p-2 rounded text-sm text-matrix-primary/80 hover:text-matrix-primary hover:bg-matrix-primary/10"
              onClick={() => {
                setCommand('info');
                setTimeout(() => handleCommandSubmit({ preventDefault: () => {} } as React.FormEvent), 100);
              }}
            >
              info
            </button>
            <button 
              className="matrix-glass p-2 rounded text-sm text-matrix-primary/80 hover:text-matrix-primary hover:bg-matrix-primary/10"
              onClick={() => {
                setCommand('help');
                setTimeout(() => handleCommandSubmit({ preventDefault: () => {} } as React.FormEvent), 100);
              }}
            >
              help
            </button>
            <button 
              className="matrix-glass p-2 rounded text-sm text-matrix-primary/80 hover:text-matrix-primary hover:bg-matrix-primary/10"
              onClick={() => {
                setCommand('clear');
                setTimeout(() => handleCommandSubmit({ preventDefault: () => {} } as React.FormEvent), 100);
              }}
            >
              clear
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GitCommands;
