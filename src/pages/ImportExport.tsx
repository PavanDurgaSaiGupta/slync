
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Upload, Download, ArrowLeft, FileText, Book, CheckSquare } from 'lucide-react';
import { toast } from 'sonner';

import NeonButton from '@/components/NeonButton';
import GlitchText from '@/components/GlitchText';
import MatrixRain from '@/components/MatrixRain';
import { useTheme } from '@/hooks/useTheme';

const ImportExport = () => {
  const [importType, setImportType] = useState<'bookmarks' | 'notes' | 'todos'>('bookmarks');
  const [exportType, setExportType] = useState<'bookmarks' | 'notes' | 'todos' | 'all'>('all');
  const [importFile, setImportFile] = useState<File | null>(null);
  
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { repo, user, saveToRepo, getDirectoryContents, getFileContent } = useAuthStore();
  
  if (!user) {
    navigate('/authentication');
    return null;
  }
  
  if (!repo) {
    navigate('/');
    toast.error('Please connect a repository first');
    return null;
  }
  
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImportFile(e.target.files[0]);
    }
  };
  
  const handleImport = async () => {
    if (!importFile) {
      toast.error('Please select a file to import');
      return;
    }
    
    try {
      const content = await importFile.text();
      
      if (importType === 'bookmarks') {
        // Parse HTML bookmarks file
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        const bookmarks = doc.querySelectorAll('a');
        
        if (bookmarks.length === 0) {
          toast.error('No bookmarks found in file');
          return;
        }
        
        let imported = 0;
        
        for (const bookmark of bookmarks) {
          const url = bookmark.getAttribute('href');
          const title = bookmark.textContent || url || 'Unnamed Bookmark';
          
          if (url) {
            const fileName = `${new Date().toISOString().split('T')[0]}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 40)}.md`;
            
            const bookmarkContent = `---
title: "${title}"
url: ${url}
tags: [imported]
created_at: ${new Date().toISOString()}
---
Imported bookmark`;
            
            await saveToRepo(
              `bookmarks/${fileName}`,
              bookmarkContent,
              `[Matrix-App] Import bookmark: ${title}`
            );
            
            imported++;
          }
        }
        
        toast.success(`Imported ${imported} bookmarks`);
      } else {
        // For notes and todos, just import as plain text files
        const fileName = `${new Date().toISOString().split('T')[0]}-imported-${importFile.name.replace(/\.\w+$/, '')}.md`;
        
        const fileContent = `---
title: "Imported ${importType === 'notes' ? 'Note' : 'Todo'}"
${importType === 'todos' ? 'status: pending\npriority: medium' : 'tags: [imported]'}
created_at: ${new Date().toISOString()}
---
${content}`;
        
        await saveToRepo(
          `${importType}/${fileName}`,
          fileContent,
          `[Matrix-App] Import ${importType}: ${fileName}`
        );
        
        toast.success(`Imported ${importType} file successfully`);
      }
      
      setImportFile(null);
      
      // Reset the file input
      const fileInput = document.getElementById('import-file') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (err) {
      console.error('Error importing file:', err);
      toast.error('Failed to import file');
    }
  };
  
  const handleExport = async () => {
    try {
      toast.loading('Preparing export...');
      
      let exportContent = '';
      let fileName = '';
      
      if (exportType === 'all') {
        // Export all data as a single markdown file
        exportContent = `# Matrix Synapse Terminal Export\n\nExported on ${new Date().toLocaleString()}\n\n`;
        
        // Export bookmarks
        exportContent += '## Bookmarks\n\n';
        const bookmarks = await getDirectoryContents('bookmarks');
        for (const file of bookmarks) {
          if (file.type === 'file' && file.name.endsWith('.md')) {
            const result = await getFileContent(`bookmarks/${file.name}`);
            if (result) {
              exportContent += `### Bookmark: ${file.name}\n\n\`\`\`\n${result.content}\n\`\`\`\n\n`;
            }
          }
        }
        
        // Export todos
        exportContent += '## Todos\n\n';
        const todos = await getDirectoryContents('todos');
        for (const file of todos) {
          if (file.type === 'file' && file.name.endsWith('.md')) {
            const result = await getFileContent(`todos/${file.name}`);
            if (result) {
              exportContent += `### Todo: ${file.name}\n\n\`\`\`\n${result.content}\n\`\`\`\n\n`;
            }
          }
        }
        
        // Export notes
        exportContent += '## Notes\n\n';
        const notes = await getDirectoryContents('notes');
        for (const file of notes) {
          if (file.type === 'file' && file.name.endsWith('.md')) {
            const result = await getFileContent(`notes/${file.name}`);
            if (result) {
              exportContent += `### Note: ${file.name}\n\n\`\`\`\n${result.content}\n\`\`\`\n\n`;
            }
          }
        }
        
        fileName = `matrix-export-all-${new Date().toISOString().split('T')[0]}.md`;
      } else {
        // Export specific data type
        exportContent = `# Matrix Synapse Terminal ${exportType.charAt(0).toUpperCase() + exportType.slice(1)} Export\n\nExported on ${new Date().toLocaleString()}\n\n`;
        
        const files = await getDirectoryContents(exportType);
        for (const file of files) {
          if (file.type === 'file' && file.name.endsWith('.md')) {
            const result = await getFileContent(`${exportType}/${file.name}`);
            if (result) {
              exportContent += `## ${file.name}\n\n\`\`\`\n${result.content}\n\`\`\`\n\n`;
            }
          }
        }
        
        fileName = `matrix-export-${exportType}-${new Date().toISOString().split('T')[0]}.md`;
      }
      
      // Create download link
      const blob = new Blob([exportContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      
      URL.revokeObjectURL(url);
      toast.success('Export completed successfully');
    } catch (err) {
      console.error('Error exporting data:', err);
      toast.error('Failed to export data');
    }
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
          className="text-center mb-12"
        >
          <GlitchText text="Import / Export" variant="title" className="mb-4" />
          <p className="text-matrix-primary/80 max-w-lg mx-auto">
            Import data from external sources or export your Matrix data for backup or sharing.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="matrix-card"
          >
            <div className="flex items-center mb-6">
              <Upload size={24} className="text-matrix-primary mr-3" />
              <h2 className="text-xl text-matrix-primary font-bold">Import</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-matrix-primary mb-2">Import Type</label>
                <div className="flex border border-matrix-primary/30 rounded-md overflow-hidden">
                  <button 
                    className={`flex-1 py-2 ${importType === 'bookmarks' ? 'bg-matrix-primary text-black' : 'text-matrix-primary'}`}
                    onClick={() => setImportType('bookmarks')}
                  >
                    <Book size={16} className="inline mr-1" />
                    Bookmarks
                  </button>
                  <button 
                    className={`flex-1 py-2 ${importType === 'todos' ? 'bg-matrix-primary text-black' : 'text-matrix-primary'}`}
                    onClick={() => setImportType('todos')}
                  >
                    <CheckSquare size={16} className="inline mr-1" />
                    Todos
                  </button>
                  <button 
                    className={`flex-1 py-2 ${importType === 'notes' ? 'bg-matrix-primary text-black' : 'text-matrix-primary'}`}
                    onClick={() => setImportType('notes')}
                  >
                    <FileText size={16} className="inline mr-1" />
                    Notes
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-matrix-primary mb-2">File to Import</label>
                <div className="flex flex-col space-y-2">
                  <input
                    id="import-file"
                    type="file"
                    accept={importType === 'bookmarks' ? '.html' : '.txt,.md'}
                    onChange={handleImportFile}
                    className="hidden"
                  />
                  <label htmlFor="import-file" className="neon-button px-6 py-3 font-bold text-center cursor-pointer">
                    Select File
                  </label>
                  
                  {importFile && (
                    <p className="text-matrix-primary/80 text-sm">
                      Selected: {importFile.name}
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <p className="text-matrix-primary/70 text-sm mb-4">
                  {importType === 'bookmarks' ? (
                    'Import bookmarks from HTML file exported from Chrome, Firefox, or other browsers.'
                  ) : importType === 'todos' ? (
                    'Import todos from text files, one task per line.'
                  ) : (
                    'Import notes from text or markdown files.'
                  )}
                </p>
                
                <NeonButton 
                  onClick={handleImport}
                  disabled={!importFile}
                  className="w-full"
                >
                  Import {importType.charAt(0).toUpperCase() + importType.slice(1)}
                </NeonButton>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="matrix-card"
          >
            <div className="flex items-center mb-6">
              <Download size={24} className="text-matrix-primary mr-3" />
              <h2 className="text-xl text-matrix-primary font-bold">Export</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-matrix-primary mb-2">Export Type</label>
                <div className="flex flex-wrap border border-matrix-primary/30 rounded-md overflow-hidden">
                  <button 
                    className={`py-2 px-3 ${exportType === 'all' ? 'bg-matrix-primary text-black' : 'text-matrix-primary'}`}
                    onClick={() => setExportType('all')}
                  >
                    All Data
                  </button>
                  <button 
                    className={`py-2 px-3 ${exportType === 'bookmarks' ? 'bg-matrix-primary text-black' : 'text-matrix-primary'}`}
                    onClick={() => setExportType('bookmarks')}
                  >
                    <Book size={16} className="inline mr-1" />
                    Bookmarks
                  </button>
                  <button 
                    className={`py-2 px-3 ${exportType === 'todos' ? 'bg-matrix-primary text-black' : 'text-matrix-primary'}`}
                    onClick={() => setExportType('todos')}
                  >
                    <CheckSquare size={16} className="inline mr-1" />
                    Todos
                  </button>
                  <button 
                    className={`py-2 px-3 ${exportType === 'notes' ? 'bg-matrix-primary text-black' : 'text-matrix-primary'}`}
                    onClick={() => setExportType('notes')}
                  >
                    <FileText size={16} className="inline mr-1" />
                    Notes
                  </button>
                </div>
              </div>
              
              <div>
                <p className="text-matrix-primary/70 text-sm mb-4">
                  Export your data as Markdown files. This is useful for backup purposes or if you want to share your data with others.
                </p>
                
                <NeonButton 
                  onClick={handleExport}
                  className="w-full"
                >
                  Export {exportType === 'all' ? 'All Data' : (exportType.charAt(0).toUpperCase() + exportType.slice(1))}
                </NeonButton>
              </div>
              
              <div className="bg-matrix-background/80 p-4 rounded border border-matrix-primary/20">
                <h3 className="text-matrix-primary mb-2 text-sm font-bold">Export Format</h3>
                <p className="text-matrix-primary/70 text-sm">
                  Exports are generated as Markdown (.md) files containing all your data in a structured format. These files can be imported back into Matrix Synapse Terminal or used with other Markdown editors.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ImportExport;
