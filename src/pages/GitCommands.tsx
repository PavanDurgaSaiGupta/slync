
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { 
  Terminal, 
  ArrowLeft, 
  Code, 
  Github, 
  File, 
  Folder, 
  RefreshCw, 
  Check, 
  AlertTriangle, 
  ChevronRight
} from 'lucide-react';

import GlitchText from '@/components/GlitchText';
import NeonInput from '@/components/NeonInput';
import NeonButton from '@/components/NeonButton';
import MatrixRain from '@/components/MatrixRain';
import { useTheme } from '@/hooks/useTheme';

interface FileItem {
  type: 'file' | 'dir' | 'symlink';
  name: string;
  path: string;
  sha?: string;
  size?: number;
  content?: string;
  encoding?: string;
}

const GitCommands: React.FC = () => {
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState('/');
  const [isLoading, setIsLoading] = useState(false);
  const [dirContents, setDirContents] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [fileContent, setFileContent] = useState('');
  
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { octokit, user, repo } = useAuthStore();
  
  useEffect(() => {
    if (repo) {
      fetchDirectoryContents('/');
    }
  }, [repo]);
  
  const fetchDirectoryContents = async (path: string) => {
    if (!octokit || !repo) {
      toast.error('Not authenticated or no repository connected');
      return;
    }
    
    setIsLoading(true);
    setCurrentPath(path);
    
    try {
      const response = await octokit.rest.repos.getContent({
        owner: repo.owner,
        repo: repo.name,
        path: path === '/' ? '' : path,
      });
      
      const contents = Array.isArray(response.data) ? response.data : [response.data];
      
      setDirContents(contents.map(item => ({
        type: item.type as 'file' | 'dir' | 'symlink',
        name: item.name,
        path: item.path,
        sha: item.sha,
        size: item.size,
        content: 'content' in item ? item.content : undefined,
        encoding: 'encoding' in item ? item.encoding : undefined
      })));
      
      addToOutput(`Changed directory to ${path}`);
    } catch (error) {
      console.error('Error fetching contents:', error);
      addToOutput(`Error: Could not fetch directory contents for ${path}`);
      toast.error(`Failed to fetch contents for ${path}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const viewFile = async (file: FileItem) => {
    if (!octokit || !repo) return;
    
    setIsLoading(true);
    setSelectedFile(file);
    
    try {
      if (file.content && file.encoding === 'base64') {
        // File already has content, decode it
        const decodedContent = atob(file.content);
        setFileContent(decodedContent);
        addToOutput(`Viewing file: ${file.path}`);
      } else {
        // Fetch file content
        const response = await octokit.rest.repos.getContent({
          owner: repo.owner,
          repo: repo.name,
          path: file.path,
        });
        
        if ('content' in response.data && 'encoding' in response.data) {
          const fileData = response.data;
          const decodedContent = fileData.encoding === 'base64' 
            ? atob(fileData.content) 
            : fileData.content;
          
          setFileContent(decodedContent);
          addToOutput(`Viewing file: ${file.path}`);
        } else {
          throw new Error('Invalid file data received');
        }
      }
    } catch (error) {
      console.error('Error viewing file:', error);
      setFileContent('');
      addToOutput(`Error: Could not view file ${file.path}`);
      toast.error(`Failed to view file ${file.path}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const navigateToPath = (path: string) => {
    if (path === '..') {
      const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
      fetchDirectoryContents(parentPath);
    } else if (path === '/') {
      fetchDirectoryContents('/');
    } else {
      fetchDirectoryContents(path);
    }
  };

  const addToOutput = (text: string) => {
    setOutput(prev => [...prev, text]);
  };
  
  const executeCommand = async () => {
    if (!command.trim()) return;
    
    const cmd = command.trim();
    addToOutput(`> ${cmd}`);
    setCommand('');
    
    if (!octokit || !repo) {
      addToOutput('Error: Not authenticated with GitHub or no repository connected');
      return;
    }
    
    if (cmd.startsWith('cd ')) {
      const path = cmd.substring(3);
      if (path === '..') {
        navigateToPath('..');
      } else if (path.startsWith('/')) {
        fetchDirectoryContents(path);
      } else {
        const newPath = currentPath === '/' 
          ? `/${path}` 
          : `${currentPath}/${path}`;
        fetchDirectoryContents(newPath);
      }
      return;
    }
    
    if (cmd === 'ls' || cmd === 'dir') {
      addToOutput(`Contents of ${currentPath}:`);
      dirContents.forEach(item => {
        addToOutput(`${item.type === 'dir' ? 'Directory' : 'File'}: ${item.name}`);
      });
      return;
    }
    
    if (cmd.startsWith('cat ') || cmd.startsWith('view ')) {
      const fileName = cmd.split(' ')[1];
      const file = dirContents.find(f => f.name === fileName && f.type === 'file');
      if (file) {
        viewFile(file);
      } else {
        addToOutput(`File not found: ${fileName}`);
      }
      return;
    }
    
    if (cmd === 'help') {
      addToOutput('Available commands:');
      addToOutput('cd <path> - Change directory');
      addToOutput('ls or dir - List contents of current directory');
      addToOutput('cat <file> or view <file> - View file contents');
      addToOutput('help - Show this help message');
      return;
    }
    
    addToOutput(`Unknown command: ${cmd}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand();
    }
  };
  
  const renderBreadcrumb = () => {
    const parts = currentPath.split('/').filter(Boolean);
    
    return (
      <div className="flex items-center text-sm text-matrix-primary/70 mb-4 overflow-x-auto">
        <span 
          className="cursor-pointer hover:text-matrix-primary"
          onClick={() => navigateToPath('/')}
        >
          root
        </span>
        
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            <ChevronRight size={14} className="mx-1" />
            <span 
              className="cursor-pointer hover:text-matrix-primary"
              onClick={() => {
                const path = '/' + parts.slice(0, index + 1).join('/');
                navigateToPath(path);
              }}
            >
              {part}
            </span>
          </React.Fragment>
        ))}
      </div>
    );
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
    <div className="min-h-screen bg-matrix-background p-4">
      {theme.showCodeRain && <MatrixRain speed={theme.speed} />}
      
      <div className="container mx-auto max-w-6xl py-8">
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
            <GlitchText text="Git Terminal" variant="title" />
          </div>
          
          <div className="flex items-center space-x-3">
            <NeonButton 
              onClick={() => fetchDirectoryContents(currentPath)}
              disabled={isLoading}
            >
              <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </NeonButton>
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-1 space-y-6"
          >
            <motion.div 
              variants={itemVariants}
              className="matrix-card"
            >
              <h3 className="text-lg text-matrix-primary font-bold mb-4">Repository Explorer</h3>
              
              {renderBreadcrumb()}
              
              <div className="max-h-96 overflow-y-auto pr-2">
                {currentPath !== '/' && (
                  <div 
                    className="flex items-center p-2 hover:bg-matrix-primary/10 rounded cursor-pointer"
                    onClick={() => navigateToPath('..')}
                  >
                    <Folder size={18} className="text-matrix-primary mr-2" />
                    <span className="text-matrix-primary">..</span>
                  </div>
                )}
                
                {isLoading ? (
                  <div className="flex justify-center items-center py-4">
                    <div className="animate-spin text-matrix-primary">
                      <RefreshCw size={24} />
                    </div>
                  </div>
                ) : (
                  dirContents.length > 0 ? (
                    dirContents
                      .sort((a, b) => {
                        // Directories first
                        if (a.type === 'dir' && b.type !== 'dir') return -1;
                        if (a.type !== 'dir' && b.type === 'dir') return 1;
                        // Then alphabetically
                        return a.name.localeCompare(b.name);
                      })
                      .map((item, index) => (
                        <div 
                          key={index}
                          className="flex items-center p-2 hover:bg-matrix-primary/10 rounded cursor-pointer"
                          onClick={() => item.type === 'dir' 
                            ? navigateToPath(`${currentPath === '/' ? '' : currentPath}/${item.name}`)
                            : viewFile(item)
                          }
                        >
                          {item.type === 'dir' ? (
                            <Folder size={18} className="text-matrix-primary mr-2" />
                          ) : (
                            <File size={18} className="text-matrix-primary mr-2" />
                          )}
                          <span className="text-matrix-primary">{item.name}</span>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-4 text-matrix-primary/60">
                      Directory is empty
                    </div>
                  )
                )}
              </div>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="matrix-card"
            >
              <h3 className="text-lg text-matrix-primary font-bold mb-4">Terminal</h3>
              
              <div className="bg-black/80 rounded p-3 font-mono text-sm text-matrix-primary h-64 overflow-y-auto mb-4">
                {output.map((line, index) => (
                  <div key={index} className="mb-1">
                    {line}
                  </div>
                ))}
              </div>
              
              <div className="flex items-center">
                <span className="text-matrix-primary mr-2">$</span>
                <NeonInput
                  type="text"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter command (try 'help')"
                  className="flex-grow"
                />
                <NeonButton onClick={executeCommand} className="ml-2">
                  Execute
                </NeonButton>
              </div>
            </motion.div>
          </motion.div>
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-2"
          >
            <motion.div 
              variants={itemVariants}
              className="matrix-card"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg text-matrix-primary font-bold">
                  {selectedFile ? (
                    <span className="flex items-center">
                      <Code size={20} className="mr-2" />
                      {selectedFile.name}
                    </span>
                  ) : (
                    "File Viewer"
                  )}
                </h3>
                
                {repo && (
                  <div className="flex items-center text-sm text-matrix-primary/70">
                    <Github size={16} className="mr-2" />
                    {repo.owner}/{repo.name}
                  </div>
                )}
              </div>
              
              {!repo ? (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                  <AlertTriangle size={48} className="text-matrix-primary/40 mb-4" />
                  <p className="text-matrix-primary/70 mb-2">No repository connected</p>
                  <p className="text-matrix-primary/50 text-sm">
                    Connect a GitHub repository on the home page to explore and interact with files.
                  </p>
                </div>
              ) : selectedFile ? (
                <div className="bg-black/80 rounded p-4 font-mono text-sm text-matrix-primary overflow-x-auto h-96">
                  <pre>{fileContent}</pre>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                  <File size={48} className="text-matrix-primary/40 mb-4" />
                  <p className="text-matrix-primary/70">Select a file to view its contents</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GitCommands;
