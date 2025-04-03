
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Bookmark, CheckSquare, Settings, Upload, Code, HelpCircle, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import GlitchText from '@/components/GlitchText';
import MatrixRain from '@/components/MatrixRain';
import { useTheme } from '@/hooks/useTheme';

const Index = () => {
  const { user, logout } = useAuthStore();
  const { theme } = useTheme();

  // Navigation items
  const navItems = [
    {
      title: 'Notes',
      icon: <FileText size={24} />,
      description: 'Manage your markdown notes with tags and folders',
      path: '/notes',
      color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
      iconColor: 'text-blue-400'
    },
    {
      title: 'Bookmarks',
      icon: <Bookmark size={24} />,
      description: 'Organize your links in curated collections',
      path: '/bookmarks',
      color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
      iconColor: 'text-purple-400'
    },
    {
      title: 'Todo Lists',
      icon: <CheckSquare size={24} />,
      description: 'Prioritize tasks with due dates and reminders',
      path: '/todos',
      color: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
      iconColor: 'text-green-400'
    },
    {
      title: 'Theme Settings',
      icon: <Settings size={24} />,
      description: 'Customize your Matrix terminal experience',
      path: '/themes',
      color: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30',
      iconColor: 'text-yellow-400'
    },
    {
      title: 'Import/Export',
      icon: <Upload size={24} />,
      description: 'Transfer data to and from other applications',
      path: '/import-export',
      color: 'from-red-500/20 to-orange-500/20 border-red-500/30',
      iconColor: 'text-red-400'
    },
    {
      title: 'Git Commands',
      icon: <Code size={24} />,
      description: 'Manage your repository with terminal-like interface',
      path: '/git-terminal',
      color: 'from-indigo-500/20 to-violet-500/20 border-indigo-500/30',
      iconColor: 'text-indigo-400'
    }
  ];

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
    <div className="min-h-screen bg-matrix-background">
      {theme.showCodeRain && <MatrixRain speed={theme.speed} />}
      
      <div className="container mx-auto px-4 py-12">
        <header className="mb-8 flex justify-between items-center">
          <GlitchText text="SLYNC" variant="title" />
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-matrix-primary/70">
                  {user.name || user.login}
                </span>
                <button 
                  onClick={logout}
                  className="text-matrix-primary hover:text-matrix-primary/70"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <Link to="/authentication" className="text-matrix-primary hover:text-matrix-primary/70">
                Login with GitHub
              </Link>
            )}
          </div>
        </header>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {navItems.map((item, index) => (
              <motion.div 
                key={index}
                variants={itemVariants}
              >
                <Link 
                  to={item.path}
                  className={`block h-full matrix-card transition-all border bg-gradient-to-br hover:shadow-glow ${item.color}`}
                >
                  <div className={`${item.iconColor} mb-4`}>
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-medium text-matrix-primary mb-2">
                    {item.title}
                  </h3>
                  <p className="text-matrix-primary/70">
                    {item.description}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
          
          <motion.div variants={itemVariants} className="mt-8 text-center">
            <Link 
              to="/how-to-use"
              className="inline-flex items-center text-matrix-primary/70 hover:text-matrix-primary"
            >
              <HelpCircle size={16} className="mr-2" />
              How to use SLYNC
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
