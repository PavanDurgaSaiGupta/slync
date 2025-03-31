
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Info, Github, Book, FileText, CheckSquare, Terminal, Download, Upload, ArrowLeft, Key } from 'lucide-react';
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
      description: "Connect to your GitHub repository to sync all your data. Matrix Synapse Terminal creates the necessary folders automatically."
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
        
        <motion.div className="text-center mb-12">
          <GlitchText text="How to Use Matrix Synapse Terminal" variant="title" className="mb-4" />
          <div className="flex justify-center mb-6">
            <Info size={24} className="text-matrix-primary mr-2" />
          </div>
          <p className="text-matrix-primary/80 max-w-2xl mx-auto">
            Matrix Synapse Terminal is your digital reality navigator, allowing you to sync and manage your data across multiple devices through GitHub integration.
          </p>
        </motion.div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-10"
        >
          <motion.section variants={itemVariants} className="matrix-card">
            <h2 className="text-xl font-bold text-matrix-primary mb-4">Getting Started</h2>
            <ol className="list-decimal list-inside space-y-4 text-matrix-primary/80">
              <li>
                <span className="font-bold">GitHub Authentication:</span>
                <p className="ml-6 mt-1">
                  There are two ways to authenticate with GitHub:
                </p>
                <ul className="ml-10 mt-2 space-y-3 list-disc">
                  <li className="mt-1">
                    <span className="font-bold text-matrix-primary">Personal Access Token (Recommended):</span>
                    <ol className="ml-4 mt-1 list-decimal">
                      <li>Visit GitHub Settings → Developer settings → <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-matrix-primary underline">Personal access tokens</a></li>
                      <li>Generate a new token with <code className="bg-black/40 px-1 rounded">repo</code> scope</li>
                      <li>Copy and paste the token in the Matrix Synapse Authentication page</li>
                    </ol>
                  </li>
                  <li>
                    <span className="font-bold text-matrix-primary">Using Repository URL:</span>
                    <p className="ml-4 mt-1">
                      On the Home page, enter your GitHub repository URL (e.g., <code className="bg-black/40 px-1 rounded">https://github.com/username/repo</code>) and click "Connect Repository". 
                      <br />
                      <span className="text-yellow-400 italic">Note: This requires you to already be authenticated with a personal access token.</span>
                    </p>
                  </li>
                </ul>
              </li>
              <li className="mt-4">
                <span className="font-bold">Required Repository Format:</span>
                <p className="ml-6 mt-1">
                  Enter your GitHub repository URL exactly as shown in the browser:
                </p>
                <code className="block bg-black/50 p-2 rounded mt-1 font-mono text-sm ml-6">
                  https://github.com/username/repo
                </code>
                <p className="ml-6 mt-1">
                  The application will automatically create the necessary folders if they don't exist:
                </p>
                <code className="block bg-black/50 p-2 rounded mt-1 font-mono text-sm ml-6">
                  /bookmarks<br/>
                  /todos<br/>
                  /notes<br/>
                  /config
                </code>
              </li>
              <li>
                <span className="font-bold">Start Using Features:</span>
                <p className="ml-6 mt-1">
                  Once connected, you can use all features: Bookmarks, To-Do Lists, Notes, and more.
                </p>
              </li>
            </ol>
          </motion.section>
          
          <motion.section variants={itemVariants} className="matrix-card">
            <h2 className="text-xl font-bold text-matrix-primary mb-4">Troubleshooting GitHub Connection</h2>
            <div className="space-y-3 text-matrix-primary/80">
              <div>
                <h3 className="text-matrix-primary font-bold flex items-center"><Key size={16} className="mr-1" /> Authentication Issues:</h3>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Ensure your Personal Access Token has the <code className="bg-black/40 px-1 rounded">repo</code> scope enabled</li>
                  <li>For private repositories, you must use a token with appropriate permissions</li>
                  <li>Check that your token has not expired (tokens can have expiration dates)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-matrix-primary font-bold">Repository URL Format:</h3>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Use the exact format from your browser: <code className="bg-black/40 px-1 rounded">https://github.com/username/repo</code></li>
                  <li>Do not include .git extension unless it appears in your browser URL</li>
                  <li>Make sure the repository exists and you have appropriate permissions</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-matrix-primary font-bold">Common Error Messages:</h3>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>"Not authenticated with GitHub" - You need to enter your personal access token first</li>
                  <li>"Repository not found or access denied" - Check the URL and your permissions</li>
                  <li>"Failed to create folder" - Verify your token has write access to the repository</li>
                </ul>
              </div>
            </div>
          </motion.section>
          
          <motion.section variants={itemVariants}>
            <h2 className="text-xl font-bold text-matrix-primary mb-6">Features</h2>
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
            <h2 className="text-xl font-bold text-matrix-primary mb-4">Data Syncing</h2>
            <p className="text-matrix-primary/80 mb-4">
              All your data is synced with your GitHub repository in Markdown format:
            </p>
            <div className="bg-black/50 p-4 rounded font-mono text-sm text-matrix-primary/90">
              <p className="mb-2">Bookmark format:</p>
              <pre className="whitespace-pre-wrap">
{`---
title: "Example Site"
url: https://example.com
tags: [webdev, tools]
created_at: 2023-06-01T12:00:00Z
---
Your notes about this bookmark...`}
              </pre>
              
              <p className="mt-4 mb-2">Todo format:</p>
              <pre className="whitespace-pre-wrap">
{`---
title: "Complete project"
priority: high
due_date: 2023-07-15
status: pending
---
Task details and notes...`}
              </pre>
            </div>
          </motion.section>
          
          <motion.section variants={itemVariants} className="matrix-card">
            <h2 className="text-xl font-bold text-matrix-primary mb-4">Themes & Settings</h2>
            <p className="text-matrix-primary/80 mb-4">
              Personalize your experience with different color themes and settings:
            </p>
            <ul className="list-disc list-inside space-y-2 text-matrix-primary/80">
              <li>Choose from multiple color themes</li>
              <li>Adjust matrix code rain animation speed</li>
              <li>Enable/disable UI effects like CRT flicker</li>
              <li>Toggle matrix code background</li>
            </ul>
          </motion.section>
          
          <motion.div 
            variants={itemVariants} 
            className="flex justify-center mt-8"
          >
            <NeonButton onClick={() => navigate('/')}>
              Return to Terminal
            </NeonButton>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HowToUse;
