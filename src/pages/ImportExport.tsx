
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, CheckSquare, FileText, Github } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

import MatrixRain from '@/components/MatrixRain';
import GlitchText from '@/components/GlitchText';
import { useTheme } from '@/hooks/useTheme';
import ImportExportManager from '@/components/ImportExportManager';

const ImportExport: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user, repo } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'notes' | 'todos' | 'bookmarks'>('notes');
  
  // These would come from your app state in a real implementation
  const [notesData, setNotesData] = useState<any>([]);
  const [todosData, setTodosData] = useState<any>([]);
  const [bookmarksData, setBookmarksData] = useState<any>([]);
  
  if (!user) {
    navigate('/authentication');
    return null;
  }
  
  if (!repo) {
    toast.error('Please connect a GitHub repository first');
    navigate('/');
    return null;
  }
  
  const handleImportNotes = (data: any) => {
    setNotesData(data);
    // In a real app, you would process and save this data
    toast.success('Notes imported successfully!');
  };
  
  const handleImportTodos = (data: any) => {
    setTodosData(data);
    // In a real app, you would process and save this data
    toast.success('Todos imported successfully!');
  };
  
  const handleImportBookmarks = (data: any) => {
    setBookmarksData(data);
    // In a real app, you would process and save this data
    toast.success('Bookmarks imported successfully!');
  };

  return (
    <div className="min-h-screen bg-matrix-background p-4">
      {theme.showCodeRain && <MatrixRain speed={theme.speed} />}
      
      <div className="container mx-auto max-w-5xl py-8">
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
          className="mb-8"
        >
          <GlitchText text="Import/Export Data" variant="title" />
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-matrix-primary/70 mt-4"
          >
            <p>Import data from external sources or export to various formats</p>
            <div className="flex items-center mt-2 text-sm">
              <Github size={14} className="mr-1" /> 
              Synced with <span className="font-mono ml-1 text-matrix-primary/90">{repo.owner}/{repo.name}</span>
            </div>
          </motion.div>
        </motion.div>
        
        <div className="flex mb-8 border-b border-matrix-primary/30">
          <button 
            className={`px-6 py-3 flex items-center ${activeTab === 'notes' ? 'border-b-2 border-matrix-primary text-matrix-primary' : 'text-matrix-primary/50'}`}
            onClick={() => setActiveTab('notes')}
          >
            <FileText size={18} className="mr-2" />
            Notes
          </button>
          <button 
            className={`px-6 py-3 flex items-center ${activeTab === 'todos' ? 'border-b-2 border-matrix-primary text-matrix-primary' : 'text-matrix-primary/50'}`}
            onClick={() => setActiveTab('todos')}
          >
            <CheckSquare size={18} className="mr-2" />
            To-Do Lists
          </button>
          <button 
            className={`px-6 py-3 flex items-center ${activeTab === 'bookmarks' ? 'border-b-2 border-matrix-primary text-matrix-primary' : 'text-matrix-primary/50'}`}
            onClick={() => setActiveTab('bookmarks')}
          >
            <BookOpen size={18} className="mr-2" />
            Bookmarks
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {activeTab === 'notes' && (
                <ImportExportManager 
                  type="notes" 
                  onImport={handleImportNotes}
                  data={notesData}
                />
              )}
              
              {activeTab === 'todos' && (
                <ImportExportManager 
                  type="todos" 
                  onImport={handleImportTodos}
                  data={todosData}
                />
              )}
              
              {activeTab === 'bookmarks' && (
                <ImportExportManager 
                  type="bookmarks" 
                  onImport={handleImportBookmarks}
                  data={bookmarksData}
                />
              )}
            </motion.div>
          </div>
          
          <div>
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="matrix-card"
            >
              <h3 className="text-matrix-primary text-lg font-bold mb-4">Format Guide</h3>
              
              {activeTab === 'notes' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-matrix-primary/90 font-semibold">.md (Markdown)</h4>
                    <p className="text-matrix-primary/70 text-sm">
                      Supports text formatting with Markdown syntax, including headings, lists, and code blocks.
                    </p>
                    <div className="bg-black/30 p-2 rounded mt-2 text-xs font-mono text-matrix-primary/80">
                      # Note Title<br />
                      tags: #work #important<br /><br />
                      This is the content of the note.
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-matrix-primary/90 font-semibold">.txt (Plain Text)</h4>
                    <p className="text-matrix-primary/70 text-sm">
                      Simple text format without special formatting.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-matrix-primary/90 font-semibold">.html (HTML)</h4>
                    <p className="text-matrix-primary/70 text-sm">
                      Rich text format with HTML formatting. Useful for notes with complex formatting.
                    </p>
                  </div>
                </div>
              )}
              
              {activeTab === 'todos' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-matrix-primary/90 font-semibold">.md (Markdown)</h4>
                    <p className="text-matrix-primary/70 text-sm">
                      Uses checkbox syntax for todo items.
                    </p>
                    <div className="bg-black/30 p-2 rounded mt-2 text-xs font-mono text-matrix-primary/80">
                      - [ ] Task 1<br />
                      - [x] Completed task<br />
                      - [ ] Task with due date (Due: 2023-05-15)
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-matrix-primary/90 font-semibold">.csv (Comma Separated Values)</h4>
                    <p className="text-matrix-primary/70 text-sm">
                      Spreadsheet format that works with Excel, Google Sheets, etc.
                    </p>
                    <div className="bg-black/30 p-2 rounded mt-2 text-xs font-mono text-matrix-primary/80">
                      Title,Completed,Due Date<br />
                      "Task 1",false,2023-05-15<br />
                      "Completed task",true,
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-matrix-primary/90 font-semibold">.ics (iCalendar)</h4>
                    <p className="text-matrix-primary/70 text-sm">
                      Calendar format that works with Google Calendar, Apple Calendar, etc.
                    </p>
                  </div>
                </div>
              )}
              
              {activeTab === 'bookmarks' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-matrix-primary/90 font-semibold">.json (JSON)</h4>
                    <p className="text-matrix-primary/70 text-sm">
                      Structured format that preserves collections, tags, and notes.
                    </p>
                    <div className="bg-black/30 p-2 rounded mt-2 text-xs font-mono text-matrix-primary/80">
                      {"{"}<br />
                      &nbsp;&nbsp;"collections": [<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;{"{"}<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name": "Development",<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"bookmarks": [<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{"{"}<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"title": "GitHub",<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"url": "https://github.com",<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"tags": ["dev", "code"]<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{"}"},<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;]<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;{"}"}<br />
                      &nbsp;&nbsp;]<br />
                      {"}"}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-matrix-primary/90 font-semibold">.html (HTML)</h4>
                    <p className="text-matrix-primary/70 text-sm">
                      Standard browser bookmark export format. Compatible with most browsers.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-matrix-primary/90 font-semibold">.csv (Comma Separated Values)</h4>
                    <p className="text-matrix-primary/70 text-sm">
                      Simple format for basic bookmark lists.
                    </p>
                    <div className="bg-black/30 p-2 rounded mt-2 text-xs font-mono text-matrix-primary/80">
                      Title,URL,Tags<br />
                      "GitHub","https://github.com","dev code"<br />
                      "Google","https://google.com","search"
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="matrix-card mt-6"
            >
              <h3 className="text-matrix-primary text-lg font-bold mb-4">GitHub Sync</h3>
              <p className="text-matrix-primary/70 mb-4">
                All your data is automatically synced with your connected GitHub repository. The data is organized in the following structure:
              </p>
              
              <div className="bg-black/30 p-3 rounded font-mono text-sm text-matrix-primary/80">
                repository/<br />
                ├── notes/            <span className="text-matrix-primary/50"># Markdown notes with tags</span><br />
                │&nbsp;&nbsp; ├── work/         <span className="text-matrix-primary/50"># Folders for organization</span><br />
                │&nbsp;&nbsp; └── personal/<br />
                ├── bookmarks/        <span className="text-matrix-primary/50"># JSON bookmark collections</span><br />
                │&nbsp;&nbsp; ├── dev.json<br />
                │&nbsp;&nbsp; └── personal.json<br />
                ├── todos/            <span className="text-matrix-primary/50"># Todo lists with priorities</span><br />
                │&nbsp;&nbsp; ├── work.md<br />
                │&nbsp;&nbsp; └── projects.md<br />
                └── config/           <span className="text-matrix-primary/50"># App configuration</span>
              </div>
              
              <p className="text-matrix-primary/60 text-sm mt-4">
                You can manually edit these files in your GitHub repository and sync them back to the app.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportExport;
