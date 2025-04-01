
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Info, Github, Book, FileText, CheckSquare, Terminal, Download, Upload, ArrowLeft, Key, Code, ListChecks, FileCode } from 'lucide-react';
import GlitchText from '@/components/GlitchText';
import NeonButton from '@/components/NeonButton';
import MatrixRain from '@/components/MatrixRain';
import { useTheme } from '@/hooks/useTheme';

const HowToUse = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  
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

  const features = [
    {
      title: "GitHub Integration",
      icon: <Github />,
      description: "Connect to your GitHub repository to sync all your data. Slync creates the necessary folders automatically."
    },
    {
      title: "Bookmarks",
      icon: <Book />,
      description: "Save and organize your web bookmarks in Markdown format. Each bookmark includes metadata like title, URL, and tags."
    },
    {
      title: "Notes",
      icon: <FileText />,
      description: "Create and manage notes with Markdown support. All notes are saved to your connected repository."
    },
    {
      title: "To-Do List",
      icon: <CheckSquare />,
      description: "Track your tasks and manage your to-do items. Mark items as complete and organize by priority."
    },
    {
      title: "Git Commands",
      icon: <Terminal />,
      description: "Execute Git commands directly through the interface to manage your repository."
    },
    {
      title: "Import/Export",
      icon: <Upload />,
      description: "Import data from HTML bookmarks or export your data for backup or sharing."
    },
  ];

  return (
    <div className="min-h-screen bg-matrix-background p-4">
      {theme.showCodeRain && <MatrixRain speed={theme.speed} />}
      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto max-w-4xl py-8"
      >
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 flex items-center text-matrix-primary hover:text-matrix-primary/70"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={20} className="mr-2" />
          Back
        </motion.button>
        
        <motion.div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <motion.div 
              className="p-3 bg-black/50 rounded-full border-2 border-matrix-primary/40"
              animate={{ boxShadow: ['0 0 5px 1px var(--theme-primary)', '0 0 10px 3px var(--theme-primary)', '0 0 5px 1px var(--theme-primary)'] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Code size={32} className="text-matrix-primary" />
            </motion.div>
          </div>
          <GlitchText text="How to Use Slync" variant="title" className="mb-4" />
          <p className="text-matrix-primary/80 max-w-2xl mx-auto">
            Slync is your digital sync navigator, allowing you to sync and manage your data across multiple devices through GitHub integration.
          </p>
        </motion.div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          <motion.section variants={itemVariants} className="matrix-card">
            <h2 className="text-xl font-bold text-matrix-primary mb-4 flex items-center">
              <Key size={20} className="mr-2" />
              GitHub Authentication
            </h2>
            <div className="space-y-4">
              <div className="bg-black/40 p-4 rounded-md border border-matrix-primary/30">
                <h3 className="text-matrix-primary font-bold mb-2">Creating a GitHub Personal Access Token:</h3>
                <ol className="list-decimal list-inside text-matrix-primary/80 space-y-2">
                  <li>Go to GitHub Settings → Developer settings → <a 
                    href="https://github.com/settings/tokens" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-matrix-primary underline"
                  >Personal access tokens</a></li>
                  <li>Click "Generate new token" (classic)</li>
                  <li>Add a note like "Slync Terminal" to identify the token later</li>
                  <li>Set expiration as needed (or "No expiration")</li>
                  <li>Select the <code className="bg-black/40 px-1 rounded">repo</code> scope to allow full repository access</li>
                  <li>Click "Generate token" at the bottom of the page</li>
                  <li>Copy the generated token immediately (GitHub will only show it once!)</li>
                  <li>Paste the token in the Slync Authentication page</li>
                </ol>
              </div>
              
              <div className="bg-black/40 p-4 rounded-md border border-matrix-primary/30">
                <h3 className="text-matrix-primary font-bold mb-2">Connecting to an Existing Repository:</h3>
                <ol className="list-decimal list-inside text-matrix-primary/80 space-y-2">
                  <li>First authenticate with your GitHub token</li>
                  <li>Navigate to the Repository Connection tab</li>
                  <li>Enter your repository URL in the format: <code className="bg-black/40 px-1 rounded">https://github.com/username/repo</code></li>
                  <li>Click "Connect Repository"</li>
                  <li>Slync will automatically create necessary folders in your repository if they don't exist</li>
                </ol>
              </div>
              
              <div className="bg-black/40 p-4 rounded-md border border-matrix-primary/30">
                <h3 className="text-matrix-primary font-bold mb-2">Creating a New Repository:</h3>
                <ol className="list-decimal list-inside text-matrix-primary/80 space-y-2">
                  <li>Go to <a 
                    href="https://github.com/new" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-matrix-primary underline"
                  >GitHub Create Repository page</a></li>
                  <li>Enter a name for your new repository</li>
                  <li>Choose public or private visibility</li>
                  <li>Click "Create repository"</li>
                  <li>Copy the URL of your new repository</li>
                  <li>Paste it into Slync's Repository Connection field</li>
                </ol>
              </div>
            </div>
          </motion.section>
          
          <motion.section variants={itemVariants} className="matrix-card">
            <h2 className="text-xl font-bold text-matrix-primary mb-4 flex items-center">
              <Github size={20} className="mr-2" />
              Repository Structure
            </h2>
            <p className="text-matrix-primary/80 mb-4">
              Slync automatically creates the following folder structure in your repository:
            </p>
            <div className="bg-black/50 p-4 rounded-md font-mono text-sm text-matrix-primary/90">
              <pre>
{`repository/
├── bookmarks/      # Stores all your saved bookmarks
├── todos/          # Stores your to-do lists
├── notes/          # Stores your notes
└── config/         # Stores app configuration`}
              </pre>
            </div>
          </motion.section>
          
          <motion.section variants={itemVariants}>
            <h2 className="text-xl font-bold text-matrix-primary mb-4 flex items-center">
              <ListChecks size={20} className="mr-2" />
              Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div 
                  key={index} 
                  className="matrix-card"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start">
                    <div className="text-matrix-primary mr-4 mt-1">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-matrix-primary">{feature.title}</h3>
                      <p className="text-matrix-primary/80 text-sm mt-1">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
          
          <motion.section variants={itemVariants} className="matrix-card">
            <h2 className="text-xl font-bold text-matrix-primary mb-4 flex items-center">
              <FileCode size={20} className="mr-2" />
              Data Formats
            </h2>
            <p className="text-matrix-primary/80 mb-4">
              All your data is synced with your GitHub repository in Markdown format:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-black/50 p-3 rounded font-mono text-xs text-matrix-primary/90">
                <p className="mb-1 text-matrix-primary/70">Bookmark format:</p>
                <pre className="whitespace-pre-wrap overflow-x-auto">
{`---
title: "Example Site"
url: https://example.com
tags: [webdev, tools]
created_at: 2023-06-01T12:00:00Z
---
Your notes about this bookmark...`}
                </pre>
              </div>
              
              <div className="bg-black/50 p-3 rounded font-mono text-xs text-matrix-primary/90">
                <p className="mb-1 text-matrix-primary/70">Todo format:</p>
                <pre className="whitespace-pre-wrap overflow-x-auto">
{`---
title: "Complete project"
priority: high
due_date: 2023-07-15
status: pending
---
Task details and notes...`}
                </pre>
              </div>
            </div>
          </motion.section>
          
          <motion.section variants={itemVariants} className="matrix-card">
            <h2 className="text-xl font-bold text-matrix-primary mb-4">Troubleshooting</h2>
            <div className="space-y-4 text-matrix-primary/80">
              <div>
                <h3 className="text-matrix-primary font-bold">"Not authenticated with GitHub"</h3>
                <p className="ml-4 mt-1">Make sure you've entered your personal access token first before trying to connect to a repository.</p>
              </div>
              
              <div>
                <h3 className="text-matrix-primary font-bold">"Repository not found or access denied"</h3>
                <p className="ml-4 mt-1">Check that the repository URL is correct and that your token has access to it. For private repositories, make sure your token has the correct permissions.</p>
              </div>
              
              <div>
                <h3 className="text-matrix-primary font-bold">"Failed to create folder"</h3>
                <p className="ml-4 mt-1">Verify that your token has write access to the repository. The token must have the full "repo" scope.</p>
              </div>
            </div>
          </motion.section>
          
          <motion.div 
            variants={itemVariants} 
            className="flex justify-center mt-8"
          >
            <NeonButton onClick={() => navigate('/authentication')}>
              Get Started
            </NeonButton>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HowToUse;
