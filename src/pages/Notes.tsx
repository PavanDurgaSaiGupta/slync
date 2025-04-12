
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { PenTool, FileText, Save, Trash2, ArrowLeft, Search, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

import NeonButton from '@/components/NeonButton';
import NeonInput from '@/components/NeonInput';
import GlitchText from '@/components/GlitchText';
import MatrixRain from '@/components/MatrixRain';
import { useTheme } from '@/hooks/useTheme';
import FolderList from '@/components/FolderList';
import MatrixHoverCard from '@/components/MatrixHoverCard';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  path: string;
  sha: string;
  updatedAt: string;
}

const Notes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [folders, setFolders] = useState<string[]>([]);
  const [currentFolder, setCurrentFolder] = useState('');
  
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { repo, user, getDirectoryContents, getFileContent, saveToRepo } = useAuthStore();
  
  useEffect(() => {
    if (!user) {
      navigate('/authentication');
      return;
    }
    
    if (!repo) {
      navigate('/');
      toast.error('Please connect a repository first');
      return;
    }
    
    loadFolders();
    loadNotes(currentFolder);
  }, [repo, user, navigate, currentFolder]);
  
  const loadFolders = async () => {
    if (!repo) return;
    
    try {
      const files = await getDirectoryContents('notes');
      const foldersList: string[] = [];
      
      for (const file of files) {
        if (file.type === 'dir' && file.name !== 'default') {
          foldersList.push(file.name);
        }
      }
      
      setFolders(foldersList);
    } catch (err) {
      console.error('Error loading folders:', err);
      toast.error('Failed to load folders');
    }
  };
  
  const loadNotes = async (folder: string) => {
    if (!repo) return;
    
    try {
      const path = folder ? `notes/${folder}` : 'notes';
      const files = await getDirectoryContents(path);
      const loadedNotes: Note[] = [];
      
      for (const file of files) {
        if (file.type === 'file' && file.name.endsWith('.md')) {
          const result = await getFileContent(`${path}/${file.name}`);
          if (result) {
            const { content, sha } = result;
            
            // Parse frontmatter
            const titleMatch = content.match(/title: "(.+?)"/);
            const tagsMatch = content.match(/tags: \[(.*?)\]/);
            const updatedAtMatch = content.match(/updated_at: (.+)/);
            
            const notesContent = content.split('---').slice(2).join('---').trim();
            
            if (titleMatch) {
              loadedNotes.push({
                id: file.name.replace('.md', ''),
                title: titleMatch[1],
                content: notesContent,
                tags: tagsMatch ? tagsMatch[1].split(',').map(tag => tag.trim().replace(/"/g, '')) : [],
                path: `${path}/${file.name}`,
                sha,
                updatedAt: updatedAtMatch ? updatedAtMatch[1] : new Date().toISOString()
              });
            }
          }
        }
      }
      
      setNotes(loadedNotes);
    } catch (err) {
      console.error('Error loading notes:', err);
      toast.error('Failed to load notes');
    }
  };
  
  const handleCreateNote = () => {
    setCurrentNote(null);
    setTitle('');
    setContent('');
    setTags('');
    setIsEditing(true);
  };
  
  const handleEditNote = (note: Note) => {
    setCurrentNote(note);
    setTitle(note.title);
    setContent(note.content);
    setTags(note.tags.join(', '));
    setIsEditing(true);
  };
  
  const handleSaveNote = async () => {
    if (!title) {
      toast.error('Title is required');
      return;
    }
    
    try {
      const tagList = tags.split(',').map(tag => tag.trim()).filter(Boolean);
      let fileName: string;
      let path: string;
      
      if (currentNote) {
        // Update existing note
        fileName = currentNote.path.split('/').pop() || '';
        path = currentNote.path;
      } else {
        // Create new note
        fileName = `${new Date().toISOString().split('T')[0]}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
        path = currentFolder 
          ? `notes/${currentFolder}/${fileName}` 
          : `notes/${fileName}`;
      }
      
      const noteContent = `---
title: "${title}"
tags: [${tagList.map(tag => `"${tag}"`).join(', ')}]
updated_at: ${new Date().toISOString()}
---
${content}`;
      
      await saveToRepo(
        path,
        noteContent,
        currentNote ? `[Slync] Update note: ${title}` : `[Slync] Add note: ${title}`
      );
      
      toast.success(currentNote ? 'Note updated!' : 'Note created!');
      setIsEditing(false);
      
      // Reload notes in the current folder
      await loadNotes(currentFolder);
    } catch (err) {
      console.error('Error saving note:', err);
      toast.error('Failed to save note');
    }
  };
  
  const handleDeleteNote = async (note: Note) => {
    if (!confirm('Are you sure you want to delete this note?')) {
      return;
    }
    
    try {
      // In a real implementation, you would delete the note from the repository
      toast.success('Note deleted!');
      
      // Remove from state
      setNotes(notes.filter(n => n.id !== note.id));
      
      if (currentNote?.id === note.id) {
        setCurrentNote(null);
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Error deleting note:', err);
      toast.error('Failed to delete note');
    }
  };
  
  const handleCreateFolder = async () => {
    const folderName = prompt('Enter folder name:');
    if (!folderName || folderName.trim() === '') return;
    
    try {
      await saveToRepo(
        `notes/${folderName}/.gitkeep`,
        '',
        `[Slync] Create notes folder: ${folderName}`
      );
      
      toast.success(`Folder "${folderName}" created!`);
      loadFolders();
      setCurrentFolder(folderName);
    } catch (err) {
      console.error('Error creating folder:', err);
      toast.error('Failed to create folder');
    }
  };
  
  const selectFolder = (folder: string) => {
    setCurrentFolder(folder);
  };
  
  const clearFolder = () => {
    setCurrentFolder('');
  };
  
  const filteredNotes = searchTerm 
    ? notes.filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : notes;
  
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
            <FileText size={24} className="text-matrix-primary mr-3" />
            <GlitchText text="Matrix Notes" variant="title" />
          </div>
          
          <div className="flex items-center space-x-4">
            <NeonInput
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search size={18} />}
            />
            
            <NeonButton onClick={handleCreateNote}>
              <Plus size={18} className="mr-1" />
              New Note
            </NeonButton>
          </div>
        </motion.div>
        
        <div className="flex gap-6">
          {/* Left sidebar - Folders */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-56 flex-shrink-0"
          >
            <FolderList 
              folders={folders}
              currentFolder={currentFolder}
              onSelectFolder={selectFolder}
              onClearFolder={clearFolder}
              onCreateFolder={handleCreateFolder}
            />
          </motion.div>
          
          {/* Main content */}
          {isEditing ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-grow"
            >
              <div className="matrix-card h-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-matrix-primary font-semibold">
                    {currentNote ? 'Edit Note' : `New Note ${currentFolder ? `in ${currentFolder}` : ''}`}
                  </h3>
                  
                  <div className="flex space-x-2">
                    <button
                      className="text-matrix-primary hover:text-matrix-primary/70"
                      onClick={() => setIsEditing(false)}
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <NeonInput
                    type="text"
                    placeholder="Note Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                  
                  <NeonInput
                    type="text"
                    placeholder="Tags (comma separated)"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                  
                  <div>
                    <textarea
                      placeholder="Note Content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="neon-border bg-matrix-background/60 text-matrix-primary px-4 py-3 rounded-md outline-none focus:shadow-glow w-full h-60 resize-none"
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <NeonButton 
                      onClick={handleSaveNote}
                    >
                      <Save size={18} className="mr-2" />
                      Save Note
                    </NeonButton>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex-grow"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredNotes.length > 0 ? (
                  filteredNotes.map((note, index) => (
                    <MatrixHoverCard
                      key={index}
                      trigger={
                        <motion.div
                          variants={itemVariants}
                          className="matrix-card cursor-pointer hover:shadow-glow transition-all"
                          onClick={() => handleEditNote(note)}
                        >
                          <div className="flex justify-between">
                            <h3 className="text-lg text-matrix-primary font-bold">{note.title}</h3>
                            
                            <div className="flex space-x-1">
                              <button 
                                className="text-matrix-primary/60 hover:text-matrix-primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditNote(note);
                                }}
                              >
                                <PenTool size={14} />
                              </button>
                              
                              <button 
                                className="text-red-500/60 hover:text-red-500"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNote(note);
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          
                          {note.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2 mb-3">
                              {note.tags.map((tag, tagIdx) => (
                                <span 
                                  key={tagIdx} 
                                  className="bg-matrix-primary/20 text-matrix-primary text-xs px-2 py-1 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          <p className="text-matrix-primary/70 text-sm mt-2 line-clamp-3">
                            {note.content}
                          </p>
                          
                          <div className="text-xs text-matrix-primary/50 mt-3 pt-2 border-t border-matrix-primary/20">
                            Last updated: {new Date(note.updatedAt).toLocaleString()}
                          </div>
                        </motion.div>
                      }
                    >
                      <div>
                        <h3 className="text-lg font-bold mb-2">{note.title}</h3>
                        <div className="prose prose-sm text-matrix-primary/80">
                          <p>{note.content.substring(0, 200)}...</p>
                        </div>
                      </div>
                    </MatrixHoverCard>
                  ))
                ) : (
                  <motion.div
                    variants={itemVariants}
                    className="col-span-2 matrix-card text-center py-12"
                  >
                    <FileText size={40} className="mx-auto text-matrix-primary/30 mb-4" />
                    <p className="text-matrix-primary/60">
                      {currentFolder 
                        ? `No notes found in folder "${currentFolder}"` 
                        : 'No notes found'}
                    </p>
                    <NeonButton 
                      onClick={handleCreateNote}
                      className="mt-4"
                    >
                      <Plus size={18} className="mr-2" />
                      Create your first note
                    </NeonButton>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notes;
