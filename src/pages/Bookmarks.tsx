
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Book, Plus, X, Tag, ExternalLink, ArrowLeft, Search } from 'lucide-react';
import { toast } from 'sonner';

import NeonButton from '@/components/NeonButton';
import NeonInput from '@/components/NeonInput';
import GlitchText from '@/components/GlitchText';
import MatrixRain from '@/components/MatrixRain';
import { useTheme } from '@/hooks/useTheme';

interface Bookmark {
  title: string;
  url: string;
  tags: string[];
  notes: string;
  path: string;
  sha: string;
}

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [tags, setTags] = useState('');
  const [notes, setNotes] = useState('');
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
    
    loadBookmarks();
  }, [repo, user, navigate]);
  
  const loadBookmarks = async () => {
    if (!repo) return;
    
    try {
      const files = await getDirectoryContents('bookmarks');
      const loadedBookmarks: Bookmark[] = [];
      
      for (const file of files) {
        if (file.type === 'file' && file.name.endsWith('.md')) {
          const result = await getFileContent(`bookmarks/${file.name}`);
          if (result) {
            const { content, sha } = result;
            
            // Parse frontmatter
            const titleMatch = content.match(/title: "(.+?)"/);
            const urlMatch = content.match(/url: (.+)/);
            const tagsMatch = content.match(/tags: \[(.*?)\]/);
            
            const notesContent = content.split('---').slice(2).join('---').trim();
            
            if (titleMatch && urlMatch) {
              loadedBookmarks.push({
                title: titleMatch[1],
                url: urlMatch[1],
                tags: tagsMatch ? tagsMatch[1].split(',').map(tag => tag.trim()) : [],
                notes: notesContent,
                path: `bookmarks/${file.name}`,
                sha
              });
            }
          }
        }
      }
      
      setBookmarks(loadedBookmarks);
    } catch (err) {
      console.error('Error loading bookmarks:', err);
      toast.error('Failed to load bookmarks');
    }
  };
  
  const handleAddBookmark = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !url) {
      toast.error('Title and URL are required');
      return;
    }
    
    try {
      const tagList = tags.split(',').map(tag => tag.trim()).filter(Boolean);
      const fileName = `${new Date().toISOString().split('T')[0]}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
      
      const content = `---
title: "${title}"
url: ${url}
tags: [${tagList.join(', ')}]
created_at: ${new Date().toISOString()}
---
${notes}`;
      
      await saveToRepo(
        `bookmarks/${fileName}`,
        content,
        `[Matrix-App] Add bookmark: ${title}`
      );
      
      setShowAddForm(false);
      setTitle('');
      setUrl('');
      setTags('');
      setNotes('');
      
      // Reload bookmarks
      loadBookmarks();
    } catch (err) {
      console.error('Error adding bookmark:', err);
      toast.error('Failed to add bookmark');
    }
  };
  
  const filteredBookmarks = searchTerm 
    ? bookmarks.filter(bookmark => 
        bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        bookmark.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        bookmark.notes.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : bookmarks;
  
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
            <Book size={24} className="text-matrix-primary mr-3" />
            <GlitchText text="Bookmarks" variant="title" />
          </div>
          
          <div className="flex items-center space-x-4">
            <NeonInput
              type="text"
              placeholder="Search bookmarks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search size={18} />}
            />
            
            <NeonButton onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? <X size={18} /> : <Plus size={18} />}
              {showAddForm ? 'Cancel' : 'Add Bookmark'}
            </NeonButton>
          </div>
        </motion.div>
        
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="matrix-card mb-8"
            onSubmit={handleAddBookmark}
          >
            <h3 className="text-lg text-matrix-primary mb-4">Add New Bookmark</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NeonInput
                  type="text"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                
                <NeonInput
                  type="text"
                  placeholder="URL"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
              </div>
              
              <NeonInput
                type="text"
                placeholder="Tags (comma separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                icon={<Tag size={18} />}
              />
              
              <div>
                <textarea
                  placeholder="Notes (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="neon-border bg-matrix-background/60 text-matrix-primary px-4 py-3 rounded-md outline-none focus:shadow-glow w-full h-32 resize-none"
                />
              </div>
              
              <div className="flex justify-end">
                <NeonButton type="submit">
                  Save Bookmark
                </NeonButton>
              </div>
            </div>
          </motion.form>
        )}
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {filteredBookmarks.length > 0 ? (
            filteredBookmarks.map((bookmark, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="matrix-card"
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex justify-between">
                  <h3 className="text-lg text-matrix-primary font-bold">{bookmark.title}</h3>
                  <a 
                    href={bookmark.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-matrix-primary hover:text-matrix-primary/70"
                  >
                    <ExternalLink size={18} />
                  </a>
                </div>
                
                <div className="text-sm text-matrix-primary/60 mt-1 break-all">
                  {bookmark.url}
                </div>
                
                {bookmark.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {bookmark.tags.map((tag, tagIdx) => (
                      <span 
                        key={tagIdx} 
                        className="bg-matrix-primary/20 text-matrix-primary text-xs px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                {bookmark.notes && (
                  <div className="mt-3 text-matrix-primary/80 text-sm border-t border-matrix-primary/20 pt-3">
                    {bookmark.notes}
                  </div>
                )}
              </motion.div>
            ))
          ) : (
            <motion.div variants={itemVariants} className="text-center py-8">
              {searchTerm ? (
                <p className="text-matrix-primary/60">No bookmarks match your search</p>
              ) : (
                <p className="text-matrix-primary/60">No bookmarks saved yet</p>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Bookmarks;
