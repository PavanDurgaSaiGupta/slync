
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Github, BookOpen, CheckSquare, FileText, Settings, Upload, Download, Terminal, Info, Code } from 'lucide-react';
import { toast } from 'sonner';

import GlitchText from '@/components/GlitchText';
import NeonButton from '@/components/NeonButton';
import NeonInput from '@/components/NeonInput';
import MatrixRain from '@/components/MatrixRain';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { useTheme } from '@/hooks/useTheme';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const [repoUrl, setRepoUrl] = useState('');
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const { theme, setTheme } = useTheme();
  
  const { user, token, repo, connectRepo, logout, error, isLoading } = useAuthStore();
  
  useEffect(() => {
    if (!user && !token) {
      navigate('/authentication');
    }
  }, [user, token, navigate]);
  
  useEffect(() => {
    if (!user) return;
    
    const text = `Initializing... \nConnection established. \nWelcome back, ${user.username}. \nSystem ready.`;
    let index = 0;
    let timer: NodeJS.Timeout;
    
    const typeNextCharacter = () => {
      if (index < text.length) {
        setTypedText(prev => prev + text.charAt(index));
        index++;
        
        const delay = Math.random() * 50 + 30;
        timer = setTimeout(typeNextCharacter, delay);
      } else {
        setIsTyping(false);
      }
    };
    
    timer = setTimeout(typeNextCharacter, 500);
    
    return () => clearTimeout(timer);
  }, [user]);

  // Effect to show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleConnectRepo = async () => {
    if (!repoUrl) {
      toast.error("Please enter a repository URL");
      return;
    }
    
    if (!repoUrl.includes('github.com')) {
      toast.error("Please enter a valid GitHub repository URL");
      return;
    }
    
    try {
      toast.loading("Connecting to repository...");
      await connectRepo(repoUrl);
    } catch (e) {
      console.error("Error connecting to repository:", e);
      toast.error(e instanceof Error ? e.message : "Failed to connect to repository");
    }
  };
  
  const handleNavigation = (path: string) => {
    navigate(path);
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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
      
      <ThemeSwitcher 
        currentTheme={theme.themeNumber} 
        onChange={(themeNumber) => setTheme({ themeNumber })} 
      />
      
      {user && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={logout}
          className="fixed top-4 left-4 text-matrix-primary hover:text-matrix-primary/70 z-50"
        >
          Logout
        </motion.button>
      )}
      
      <AnimatePresence>
        {user && (
          <div className="container mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <div className="flex justify-center mb-4">
                <motion.div 
                  className="p-4 rounded-full border-2 border-matrix-primary shadow-glow"
                  animate={{ boxShadow: ['0 0 10px 2px var(--theme-primary)', '0 0 20px 5px var(--theme-primary)', '0 0 10px 2px var(--theme-primary)'] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Code size={40} className="text-matrix-primary" />
                </motion.div>
              </div>
              <GlitchText text="Slync Terminal" variant="title" className="mb-4" />
              <p className="text-matrix-primary/70 text-lg">
                Your digital sync navigator
              </p>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-4"
              >
                <NeonButton 
                  onClick={() => navigate('/how-to-use')}
                  className="inline-flex items-center"
                >
                  <Info size={16} className="mr-2" />
                  How to Use
                </NeonButton>
              </motion.div>
            </motion.div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-8"
              >
                <motion.div 
                  variants={itemVariants}
                  className="matrix-card h-full"
                >
                  <div className="flex items-center mb-4">
                    <Github className="text-matrix-primary mr-3" />
                    <h3 className="neon-text text-xl font-semibold">GitHub Repository Connection</h3>
                  </div>
                  
                  {repo ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      <div className="matrix-glass p-4 rounded-md">
                        <p className="text-matrix-primary/70 mb-2">Connected Repository:</p>
                        <p className="neon-text font-mono">{repo.owner}/{repo.name}</p>
                      </div>
                      
                      <p className="text-matrix-primary/80">
                        Your data is synced with this repository. Any changes you make will be automatically pushed.
                      </p>
                      
                      <div className="flex items-center space-x-2 text-matrix-primary/70 text-sm">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span>Repository connection active</span>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-matrix-primary/80 mb-4">
                        Paste your GitHub repository URL to connect and sync your data:
                      </p>
                      
                      <NeonInput
                        type="text"
                        placeholder="https://github.com/username/repo"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                      />
                      
                      <NeonButton 
                        onClick={handleConnectRepo} 
                        className="w-full" 
                        disabled={isLoading}
                      >
                        {isLoading ? 'Connecting...' : 'Connect Repository'}
                      </NeonButton>
                      
                      <p className="text-matrix-primary/60 text-sm mt-2">
                        Don't have a repository? <a href="https://github.com/new" target="_blank" rel="noopener noreferrer" className="underline">Create one</a> or use an existing one.
                      </p>
                    </div>
                  )}
                </motion.div>
              </motion.div>
              
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-8"
              >
                <motion.div 
                  variants={itemVariants}
                  className="matrix-card h-full"
                >
                  <div className="w-full h-full bg-black/60 rounded-md p-4 font-mono terminal-text">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex space-x-1">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <p className="text-xs text-matrix-primary/60">slync-terminal</p>
                    </div>
                    
                    <div className="border-t border-matrix-primary/20 pt-4">
                      <pre className="whitespace-pre-wrap">
                        {typedText}
                        {isTyping && (
                          <span className="animate-blink">_</span>
                        )}
                      </pre>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <NeonButton
                      className="w-full"
                      onClick={() => navigate(repo ? '/bookmarks' : '/how-to-use')}
                    >
                      {repo ? 'Continue Where You Left Off' : 'Learn How to Get Started'}
                    </NeonButton>
                  </div>
                </motion.div>
              </motion.div>
            </div>
            
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {[
                { icon: <BookOpen />, title: "Bookmarks", path: "/bookmarks", enabled: !!repo },
                { icon: <CheckSquare />, title: "To-Do List", path: "/todos", enabled: !!repo },
                { icon: <FileText />, title: "Notes", path: "/notes", enabled: !!repo },
                { icon: <Settings />, title: "Themes & Settings", path: "/themes", enabled: true },
                { icon: <Upload />, title: "Import", path: "/import-export", enabled: !!repo },
                { icon: <Download />, title: "Export", path: "/import-export", enabled: !!repo },
                { icon: <Terminal />, title: "Git Commands", path: "/git-terminal", enabled: !!repo },
                { icon: <Github />, title: "GitHub Sync", path: "/git-terminal", enabled: !!repo },
                { icon: <Info />, title: "How to Use", path: "/how-to-use", enabled: true },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className={`matrix-card cursor-pointer ${theme.enableCrtFlicker ? 'flicker-effect' : ''} ${!item.enabled ? 'opacity-50' : ''}`}
                  whileHover={{ scale: item.enabled ? 1.05 : 1 }}
                  whileTap={{ scale: item.enabled ? 0.95 : 1 }}
                  onClick={() => item.enabled && handleNavigation(item.path)}
                >
                  <div className="flex flex-col items-center justify-center h-full p-4">
                    <div className="text-matrix-primary text-3xl mb-3">
                      {item.icon}
                    </div>
                    <h3 className="neon-text text-lg">{item.title}</h3>
                    {!item.enabled && (
                      <p className="text-matrix-primary/50 text-xs mt-2">
                        Connect a repository first
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
