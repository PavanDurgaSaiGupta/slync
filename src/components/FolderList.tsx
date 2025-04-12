
import React from 'react';
import { motion } from 'framer-motion';
import { Folder, FolderPlus, Home } from 'lucide-react';

interface FolderListProps {
  folders: string[];
  currentFolder: string;
  onSelectFolder: (folder: string) => void;
  onClearFolder: () => void;
  onCreateFolder: () => void;
}

const FolderList: React.FC<FolderListProps> = ({ 
  folders, 
  currentFolder, 
  onSelectFolder, 
  onClearFolder, 
  onCreateFolder 
}) => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="matrix-card h-full"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-matrix-primary font-semibold">Folders</h3>
        <button 
          className="text-matrix-primary hover:text-matrix-primary/70 p-1 rounded-full hover:bg-matrix-primary/10 transition-colors"
          onClick={onCreateFolder}
          title="Create new folder"
        >
          <FolderPlus size={16} />
        </button>
      </div>
      
      <motion.div 
        className="space-y-2"
        variants={containerVariants}
      >
        <motion.div 
          variants={itemVariants}
          className={`p-2 rounded cursor-pointer flex items-center ${!currentFolder ? 'bg-matrix-primary/20' : 'hover:bg-matrix-primary/10'} transition-all duration-200`}
          onClick={onClearFolder}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <Home size={14} className="mr-2 text-matrix-primary/70" />
          <span className="text-matrix-primary text-sm">All Files</span>
        </motion.div>
        
        {folders.map((folder, index) => (
          <motion.div 
            key={index}
            variants={itemVariants}
            className={`p-2 rounded cursor-pointer flex items-center ${currentFolder === folder ? 'bg-matrix-primary/20' : 'hover:bg-matrix-primary/10'} transition-all duration-200`}
            onClick={() => onSelectFolder(folder)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <Folder size={14} className="mr-2 text-matrix-primary/70" />
            <span className="text-matrix-primary text-sm">{folder}</span>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default FolderList;
