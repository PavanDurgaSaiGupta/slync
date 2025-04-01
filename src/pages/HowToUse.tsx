
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Github, Book, CheckSquare, Terminal, Code, Download, Upload, Key } from 'lucide-react';

import NeonButton from '@/components/NeonButton';
import GlitchText from '@/components/GlitchText';
import MatrixRain from '@/components/MatrixRain';
import { useTheme } from '@/hooks/useTheme';

const HowToUse: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  
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
            <Code size={24} className="text-matrix-primary mr-3" />
            <GlitchText text="How to Use Slync" variant="title" />
          </div>
        </motion.div>
        
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="matrix-card"
          >
            <div className="flex items-start mb-4">
              <Key size={24} className="text-matrix-primary mr-3 mt-1" />
              <div>
                <h3 className="text-lg text-matrix-primary font-bold mb-2">Getting Started with GitHub</h3>
                <div className="space-y-4 text-matrix-primary/80">
                  <p>Slync uses GitHub to store and sync your data. Follow these steps to get started:</p>
                  
                  <div className="matrix-glass p-4 rounded-md">
                    <h4 className="font-bold text-matrix-primary mb-2">1. Create a GitHub Personal Access Token</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Go to <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-matrix-primary underline">GitHub Settings → Developer settings → Personal access tokens</a></li>
                      <li>Click "Generate new token (classic)"</li>
                      <li>Name your token (e.g., "Slync Terminal")</li>
                      <li>Under scopes, check the <code className="bg-black/40 px-1 rounded">repo</code> scope to allow full access to your repositories</li>
                      <li>Click "Generate token"</li>
                      <li><span className="text-red-400">Important:</span> Copy and save your token securely. GitHub will only show it once!</li>
                    </ol>
                  </div>
                  
                  <div className="matrix-glass p-4 rounded-md">
                    <h4 className="font-bold text-matrix-primary mb-2">2. Connect to Slync</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Enter your GitHub token on the Authentication page</li>
                      <li>You can then either:
                        <ul className="list-disc list-inside ml-6 mt-1">
                          <li>Connect to an existing repository by providing the URL</li>
                          <li>Create a new repository to store your data</li>
                        </ul>
                      </li>
                      <li>Once connected, Slync will automatically create the necessary folders and files in your repository</li>
                    </ol>
                  </div>
                  
                  <div className="matrix-glass p-4 rounded-md">
                    <h4 className="font-bold text-matrix-primary mb-2">3. Troubleshooting Connection Issues</h4>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                      <li>If you see "Not authenticated with GitHub", make sure your token has the correct <code className="bg-black/40 px-1 rounded">repo</code> scope</li>
                      <li>For existing repos, ensure you have write access to that repository</li>
                      <li>Try authenticating with your token first, then connecting to a repository</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="matrix-card h-full">
              <div className="flex items-center mb-4">
                <Book size={20} className="text-matrix-primary mr-2" />
                <h3 className="text-lg text-matrix-primary font-bold">Bookmarks</h3>
              </div>
              <p className="text-matrix-primary/80 text-sm mb-3">
                Save and organize your important links with tags for easy access.
              </p>
              <ul className="list-disc list-inside text-matrix-primary/70 text-sm space-y-1">
                <li>Create collections to organize bookmarks</li>
                <li>Add tags for improved searchability</li>
                <li>Add notes to your bookmarks</li>
                <li>Import/export bookmark data</li>
              </ul>
              <NeonButton className="mt-4 w-full" onClick={() => navigate('/bookmarks')}>
                Manage Bookmarks
              </NeonButton>
            </div>
            
            <div className="matrix-card h-full">
              <div className="flex items-center mb-4">
                <CheckSquare size={20} className="text-matrix-primary mr-2" />
                <h3 className="text-lg text-matrix-primary font-bold">To-Do Lists</h3>
              </div>
              <p className="text-matrix-primary/80 text-sm mb-3">
                Track your tasks with priority levels, due dates, and status.
              </p>
              <ul className="list-disc list-inside text-matrix-primary/70 text-sm space-y-1">
                <li>Assign priorities (low, medium, high)</li>
                <li>Set due dates with calendar integration</li>
                <li>Add detailed notes to tasks</li>
                <li>Filter and sort by various criteria</li>
              </ul>
              <NeonButton className="mt-4 w-full" onClick={() => navigate('/todos')}>
                Manage Tasks
              </NeonButton>
            </div>
            
            <div className="matrix-card h-full">
              <div className="flex items-center mb-4">
                <FileText size={20} className="text-matrix-primary mr-2" />
                <h3 className="text-lg text-matrix-primary font-bold">Notes</h3>
              </div>
              <p className="text-matrix-primary/80 text-sm mb-3">
                Write and organize notes with rich text formatting.
              </p>
              <ul className="list-disc list-inside text-matrix-primary/70 text-sm space-y-1">
                <li>Create and edit rich text notes</li>
                <li>Organize with tags and categories</li>
                <li>Format text with markdown support</li>
                <li>Import/export in various formats</li>
              </ul>
              <NeonButton className="mt-4 w-full" onClick={() => navigate('/notes')}>
                Access Notes
              </NeonButton>
            </div>
            
            <div className="matrix-card h-full">
              <div className="flex items-center mb-4">
                <Terminal size={20} className="text-matrix-primary mr-2" />
                <h3 className="text-lg text-matrix-primary font-bold">Git Commands</h3>
              </div>
              <p className="text-matrix-primary/80 text-sm mb-3">
                Execute Git commands and sync with your repository.
              </p>
              <ul className="list-disc list-inside text-matrix-primary/70 text-sm space-y-1">
                <li>Push files directly to GitHub</li>
                <li>View commit history and changes</li>
                <li>Manage repository content</li>
                <li>Execute common Git operations</li>
              </ul>
              <NeonButton className="mt-4 w-full" onClick={() => navigate('/git-terminal')}>
                Open Git Terminal
              </NeonButton>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
            className="matrix-card"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-full bg-matrix-primary/20 mr-3">
                <Github size={24} className="text-matrix-primary" />
              </div>
              <h3 className="text-lg text-matrix-primary font-bold">Data Synchronization</h3>
            </div>
            <p className="text-matrix-primary/80 mb-4">
              All your data is automatically synced with your GitHub repository. This means:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="matrix-glass p-3 rounded-md">
                <h4 className="font-bold text-matrix-primary mb-2 flex items-center">
                  <Download size={16} className="mr-2" /> Import Data
                </h4>
                <p className="text-sm text-matrix-primary/70">
                  Import your existing bookmarks, to-dos, and notes from various formats
                </p>
              </div>
              <div className="matrix-glass p-3 rounded-md">
                <h4 className="font-bold text-matrix-primary mb-2 flex items-center">
                  <Upload size={16} className="mr-2" /> Export Data
                </h4>
                <p className="text-sm text-matrix-primary/70">
                  Export your data in multiple formats for backup or sharing
                </p>
              </div>
            </div>
            <NeonButton className="mt-4 w-full" onClick={() => navigate('/import-export')}>
              Manage Import/Export
            </NeonButton>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
            className="text-center py-8"
          >
            <NeonButton onClick={() => navigate('/')}>
              Return to Main Terminal
            </NeonButton>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HowToUse;
