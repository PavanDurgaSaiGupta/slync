
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Github, BookOpen, CheckSquare, FileText } from 'lucide-react';
import MatrixRain from '@/components/MatrixRain';
import GlitchText from '@/components/GlitchText';
import NeonButton from '@/components/NeonButton';
import { useTheme } from '@/hooks/useTheme';

const HowToUse: React.FC = () => {
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

  return (
    <div className="min-h-screen bg-matrix-background p-4">
      {theme.showCodeRain && <MatrixRain speed={theme.speed} />}
      
      <Link to="/" className="fixed top-4 left-4 flex items-center text-matrix-primary hover:text-matrix-primary/70 z-50">
        <ArrowLeft size={18} className="mr-2" />
        Back to Home
      </Link>
      
      <motion.div 
        className="container mx-auto max-w-4xl py-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="text-center mb-12">
          <GlitchText text="How to Use Matrix Synapse" variant="title" className="mb-4" />
          <p className="text-matrix-primary/70">A complete guide to using the Matrix Synapse application</p>
        </motion.div>
        
        <motion.div variants={itemVariants} className="matrix-card mb-8">
          <div className="flex items-center mb-4">
            <Github className="text-matrix-primary mr-3" />
            <h2 className="neon-text text-2xl font-semibold">GitHub Connection</h2>
          </div>
          <ol className="list-decimal list-inside space-y-4 text-matrix-primary/80 ml-4">
            <li>
              <span className="font-bold text-matrix-primary">Sign up/Login:</span> Create an account or login with your credentials.
            </li>
            <li>
              <span className="font-bold text-matrix-primary">Generate GitHub Token:</span> Go to GitHub Settings → 
              Developer Settings → Personal access tokens → Generate new token. 
              Select the <code className="bg-matrix-background/50 px-1 rounded">repo</code> scope.
            </li>
            <li>
              <span className="font-bold text-matrix-primary">Connect Repository:</span> On the home page, 
              paste your GitHub repository URL in the format: <code className="bg-matrix-background/50 px-1 rounded">https://github.com/username/repo</code>
            </li>
            <li>
              <span className="font-bold text-matrix-primary">Authorize:</span> Enter your GitHub token when prompted. 
              This will allow the application to create and modify files in your repository.
            </li>
          </ol>
        </motion.div>
        
        <motion.div variants={itemVariants} className="matrix-card mb-8">
          <div className="flex items-center mb-4">
            <BookOpen className="text-matrix-primary mr-3" />
            <h2 className="neon-text text-2xl font-semibold">Bookmarks</h2>
          </div>
          <ul className="list-disc list-inside space-y-4 text-matrix-primary/80 ml-4">
            <li>
              <span className="font-bold text-matrix-primary">Save Bookmarks:</span> Navigate to the Bookmarks page 
              and paste URLs to save them. Add optional tags and notes.
            </li>
            <li>
              <span className="font-bold text-matrix-primary">Sync Process:</span> Each bookmark is saved as a markdown file 
              in the <code className="bg-matrix-background/50 px-1 rounded">/bookmarks</code> folder of your connected repository.
            </li>
            <li>
              <span className="font-bold text-matrix-primary">Search & Filter:</span> Use the search bar to find bookmarks by title, URL, or tags.
            </li>
          </ul>
        </motion.div>
        
        <motion.div variants={itemVariants} className="matrix-card mb-8">
          <div className="flex items-center mb-4">
            <CheckSquare className="text-matrix-primary mr-3" />
            <h2 className="neon-text text-2xl font-semibold">To-Do Lists</h2>
          </div>
          <ul className="list-disc list-inside space-y-4 text-matrix-primary/80 ml-4">
            <li>
              <span className="font-bold text-matrix-primary">Create Tasks:</span> Add new tasks with title, description, and due date.
            </li>
            <li>
              <span className="font-bold text-matrix-primary">Task Storage:</span> All tasks are saved as markdown files 
              in the <code className="bg-matrix-background/50 px-1 rounded">/todos</code> folder with format: <code>YYYY-MM-DD-title.md</code>
            </li>
            <li>
              <span className="font-bold text-matrix-primary">Completion:</span> Check off completed tasks. This will update the 
              corresponding markdown file in your repository.
            </li>
          </ul>
        </motion.div>
        
        <motion.div variants={itemVariants} className="matrix-card mb-8">
          <div className="flex items-center mb-4">
            <FileText className="text-matrix-primary mr-3" />
            <h2 className="neon-text text-2xl font-semibold">Notes</h2>
          </div>
          <ul className="list-disc list-inside space-y-4 text-matrix-primary/80 ml-4">
            <li>
              <span className="font-bold text-matrix-primary">Create Notes:</span> Add notes with titles, content, and tags.
            </li>
            <li>
              <span className="font-bold text-matrix-primary">Note Storage:</span> Notes are saved as markdown files 
              in the <code className="bg-matrix-background/50 px-1 rounded">/notes</code> folder of your repository.
            </li>
            <li>
              <span className="font-bold text-matrix-primary">Formatting:</span> Use markdown syntax for rich formatting.
            </li>
          </ul>
        </motion.div>
        
        <motion.div variants={itemVariants} className="flex justify-center mt-8">
          <Link to="/">
            <NeonButton>Start Using Matrix Synapse</NeonButton>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HowToUse;
