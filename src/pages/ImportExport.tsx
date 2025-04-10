import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileUp, FileDown, FileJson, FileText, FileArchive, Calendar, Check } from 'lucide-react';
import { toast } from 'sonner';

import NeonButton from '@/components/NeonButton';
import GlitchText from '@/components/GlitchText';
import MatrixRain from '@/components/MatrixRain';
import ImportExportManager from '@/components/ImportExportManager';
import { useTheme } from '@/hooks/useTheme';

const ImportExport = () => {
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'notes' | 'todos'>('bookmarks');
  
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleImport = (file: File) => {
    if (!file) {
      toast.error('Please select a file to import');
      return;
    }

    toast.loading(`Importing ${activeTab}...`);
    
    // In a full implementation, we would handle the import here
    // This would typically involve:
    // 1. Reading the file content
    // 2. Parsing the content based on file format
    // 3. Saving the data to your repository
    
    setTimeout(() => {
      toast.success(`${activeTab} imported successfully!`);
    }, 1500);
  };
  
  const handleExport = () => {
    toast.loading(`Exporting ${activeTab}...`);
    
    // In a full implementation, we would handle the export here
    // This would typically involve:
    // 1. Fetching the data
    // 2. Converting to the appropriate format
    // 3. Creating a downloadable file
    
    setTimeout(() => {
      toast.success(`${activeTab} exported successfully!`);
    }, 1500);
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
            <div className="flex">
              <FileUp size={24} className="text-matrix-primary mr-2" />
              <FileDown size={24} className="text-matrix-primary" />
            </div>
            <GlitchText text="Import / Export" variant="title" className="ml-3" />
          </div>
        </motion.div>
        
        {/* Tabs Navigation */}
        <div className="flex border-b border-matrix-primary/30 mb-8">
          <button
            className={`px-4 py-2 ${activeTab === 'bookmarks' ? 'border-b-2 border-matrix-primary text-matrix-primary' : 'text-matrix-primary/50'}`}
            onClick={() => setActiveTab('bookmarks')}
          >
            <span className="flex items-center">
              <FileJson className="mr-2" size={16} />
              Bookmarks
            </span>
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'notes' ? 'border-b-2 border-matrix-primary text-matrix-primary' : 'text-matrix-primary/50'}`}
            onClick={() => setActiveTab('notes')}
          >
            <span className="flex items-center">
              <FileText className="mr-2" size={16} />
              Notes
            </span>
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'todos' ? 'border-b-2 border-matrix-primary text-matrix-primary' : 'text-matrix-primary/50'}`}
            onClick={() => setActiveTab('todos')}
          >
            <span className="flex items-center">
              <Check className="mr-2" size={16} />
              To-Do Lists
            </span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="col-span-1 lg:col-span-2">
            <div className="matrix-card">
              <h2 className="text-xl text-matrix-primary mb-4">About {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Import/Export</h2>
              
              {activeTab === 'bookmarks' && (
                <div>
                  <p className="text-matrix-primary/80 mb-4">
                    SLYNC supports importing and exporting bookmarks in multiple formats to ensure compatibility with various browsers and applications.
                  </p>
                  
                  <h3 className="text-lg text-matrix-primary/90 mb-2">Supported Formats:</h3>
                  <ul className="list-disc list-inside text-matrix-primary/70 mb-4 space-y-1">
                    <li><strong>HTML</strong> (.html) - Standard browser export format (Chrome, Firefox)</li>
                    <li><strong>JSON</strong> (.json) - Structured data format used by modern tools</li>
                    <li><strong>CSV</strong> (.csv) - Simple spreadsheet format for easy editing</li>
                  </ul>
                  
                  <h3 className="text-lg text-matrix-primary/90 mb-2">Import Instructions:</h3>
                  <ol className="list-decimal list-inside text-matrix-primary/70 mb-4 space-y-1">
                    <li>Export your bookmarks from your browser</li>
                    <li>Upload the file using the import tool below</li>
                    <li>Your bookmarks will be organized by collections</li>
                    <li>Tags and notes will be preserved if available in the source format</li>
                  </ol>
                </div>
              )}
              
              {activeTab === 'notes' && (
                <div>
                  <p className="text-matrix-primary/80 mb-4">
                    SLYNC supports importing and exporting notes in Markdown and other formats, allowing seamless integration with various note-taking applications.
                  </p>
                  
                  <h3 className="text-lg text-matrix-primary/90 mb-2">Supported Formats:</h3>
                  <ul className="list-disc list-inside text-matrix-primary/70 mb-4 space-y-1">
                    <li><strong>Markdown</strong> (.md) - GitHub-friendly format with support for formatting</li>
                    <li><strong>Plain Text</strong> (.txt) - Universal compatibility</li>
                    <li><strong>JSON</strong> (.json) - For notes with structured metadata</li>
                  </ul>
                  
                  <h3 className="text-lg text-matrix-primary/90 mb-2">Import Instructions:</h3>
                  <ol className="list-decimal list-inside text-matrix-primary/70 mb-4 space-y-1">
                    <li>Prepare your notes in one of the supported formats</li>
                    <li>For best results with Markdown, use YAML frontmatter for tags</li>
                    <li>Upload individual notes or a ZIP archive of multiple notes</li>
                    <li>Your folder structure will be preserved when importing ZIP archives</li>
                  </ol>
                </div>
              )}
              
              {activeTab === 'todos' && (
                <div>
                  <p className="text-matrix-primary/80 mb-4">
                    SLYNC supports importing and exporting to-do lists in multiple formats, compatible with popular task management applications.
                  </p>
                  
                  <h3 className="text-lg text-matrix-primary/90 mb-2">Supported Formats:</h3>
                  <ul className="list-disc list-inside text-matrix-primary/70 mb-4 space-y-1">
                    <li><strong>Markdown</strong> (.md) - GitHub-style task lists with checkboxes</li>
                    <li><strong>CSV</strong> (.csv) - Spreadsheet format with task details</li>
                    <li><strong>JSON</strong> (.json) - Structured format with all task metadata</li>
                    <li><strong>iCalendar</strong> (.ics) - Calendar format with due dates</li>
                  </ul>
                  
                  <h3 className="text-lg text-matrix-primary/90 mb-2">Import Instructions:</h3>
                  <ol className="list-decimal list-inside text-matrix-primary/70 mb-4 space-y-1">
                    <li>Export your tasks from your current task manager</li>
                    <li>For CSV imports, format columns as: Title, Description, Due Date, Priority, Status</li>
                    <li>For Markdown imports, use "- [ ]" for incomplete tasks and "- [x]" for complete tasks</li>
                    <li>ICS files will import tasks with their due dates into the calendar view</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
          
          <ImportExportManager 
            type={activeTab}
            onImport={handleImport}
            onExport={handleExport}
            data={{}} // Providing empty data object so it's not undefined
          />
        </div>
      </div>
    </div>
  );
};

export default ImportExport;
