
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { FileText, Plus, X, ArrowLeft, Search, Tag, Calendar } from 'lucide-react';
import { toast } from 'sonner';

import NeonButton from '@/components/NeonButton';
import NeonInput from '@/components/NeonInput';
import GlitchText from '@/components/GlitchText';
import MatrixRain from '@/components/MatrixRain';
import { useTheme } from '@/hooks/useTheme';

interface Note {
  title: string;
  tags: string[];
  content: string;
  createdAt: string;
  path: string;
  sha: string;
}

const Notes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [content, setContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
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
    
    loadNotes();
  }, [repo, user, navigate]);
  
  const loadNotes = async () => {
    if (!repo) return;
    
    try {
      const files = await getDirectoryContents('notes');
      const loadedNotes: Note[] = [];
      
      for (const file of files) {
        if (file.type === 'file' && file.name.endsWith('.md')) {
          const result = await getFileContent(`notes/${file.name}`);
          if (result) {
            const { content: fileContent, sha } = result;
            
            // Parse frontmatter
            const titleMatch = fileContent.match(/title: "(.+?)"/);
            const tagsMatch = fileContent.match(/tags: \[(.*?)\]/);
            const dateMatch = fileContent.match(/created_at: (.+)/);
            
            const noteContent = fileContent.split('---').slice(2).join('---').trim();
            
            if (titleMatch) {
              loadedNotes.push({
                title: titleMatch[1],
                tags: tagsMatch ? tagsMatch[1].split(',').map(tag => tag.trim()) : [],
                content: noteContent,
                createdAt: dateMatch ? dateMatch[1] : new Date().toISOString(),
                path: `notes/${file.name}`,
                sha
              });
            }
          }
        }
      }
      
      // Sort notes by created date, newest first
      setNotes(loadedNotes.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (err) {
      console.error('Error loading notes:', err);
      toast.error('Failed to load notes');
    }
  };
  
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !content) {
      toast.error('Title and content are required');
      return;
    }
    
    try {
      const tagList = tags.split(',').map(tag => tag.trim()).filter(Boolean);
      const fileName = `${new Date().toISOString().split('T')[0]}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
      const currentDate = new Date().toISOString();
      
      const noteContent = `---
title: "${title}"
tags: [${tagList.join(', ')}]
created_at: ${currentDate}
---
${content}`;
      
      await saveToRepo(
        `notes/${fileName}`,
        noteContent,
        `[Matrix-App] Add note: ${title}`
      );
      
      setShowAddForm(false);
      setTitle('');
      setTags('');
      setContent('');
      
      // Reload notes
      loadNotes();
    } catch (err) {
      console.error('Error adding note:', err);
      toast.error('Failed to add note');
    }
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
            <FileText size={24} className="text-matrix-primary mr-3" />
            <GlitchText text="Notes" variant="title" />
          </div>
          
          <div className="flex items-center space-x-4">
            <NeonInput
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search size={18} />}
            />
            
            <NeonButton onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? <X size={18} /> : <Plus size={18} />}
              {showAddForm ? 'Cancel' : 'Add Note'}
            </NeonButton>
          </div>
        </motion.div>
        
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="matrix-card mb-8"
            onSubmit={handleAddNote}
          >
            <h3 className="text-lg text-matrix-primary mb-4">Add New Note</h3>
            <div className="space-y-4">
              <NeonInput
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              
              <NeonInput
                type="text"
                placeholder="Tags (comma separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                icon={<Tag size={18} />}
              />
              
              <div>
                <textarea
                  placeholder="Note content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="neon-border bg-matrix-background/60 text-matrix-primary px-4 py-3 rounded-md outline-none focus:shadow-glow w-full h-48 resize-none"
                  required
                />
              </div>
              
              <div className="flex justify-end">
                <NeonButton type="submit">
                  Save Note
                </NeonButton>
              </div>
            </div>
          </motion.form>
        )}
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {filteredNotes.length > 0 ? (
            filteredNotes.map((note, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="matrix-card"
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg text-matrix-primary font-bold">{note.title}</h3>
                  <div className="flex items-center text-sm text-matrix-primary/60">
                    <Calendar size={14} className="mr-1" />
                    <span>
                      {new Date(note.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
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
                
                <div className="mt-4 text-matrix-primary/90 border-t border-matrix-primary/20 pt-4 whitespace-pre-wrap">
                  {note.content}
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div variants={itemVariants} className="text-center py-8">
              {searchTerm ? (
                <p className="text-matrix-primary/60">No notes match your search</p>
              ) : (
                <p className="text-matrix-primary/60">No notes saved yet</p>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Notes;
