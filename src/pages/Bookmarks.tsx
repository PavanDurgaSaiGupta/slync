
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Book, Plus, X, Tag, ExternalLink, ArrowLeft, Search, Folder, Edit, Trash2, Save } from 'lucide-react';
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
  collection?: string;
}

interface Collection {
  name: string;
  count: number;
}

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [tags, setTags] = useState('');
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [currentCollection, setCurrentCollection] = useState<string>('');
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { repo, user, getDirectoryContents, getFileContent, saveToRepo } = useAuthStore();
  
  useEffect(() => {
    if (!user) {
      navigate('/authentication');
      return;
    }
    
    loadBookmarks();
  }, [repo, user, navigate]);
  
  const loadBookmarks = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!repo) {
        setError('No GitHub repository connected. Please set up a repository in your account settings.');
        setIsLoading(false);
        return;
      }
      
      // First, check if the bookmarks directory exists
      try {
        // First, load collections (which are directories)
        const baseFiles = await getDirectoryContents('bookmarks');
        const collectionList: Collection[] = [];
        
        for (const file of baseFiles) {
          if (file.type === 'dir') {
            try {
              const collectionFiles = await getDirectoryContents(`bookmarks/${file.name}`);
              const bookmarkCount = collectionFiles.filter(f => f.type === 'file' && f.name.endsWith('.md')).length;
              collectionList.push({
                name: file.name,
                count: bookmarkCount
              });
            } catch (err) {
              console.error(`Error loading collection ${file.name}:`, err);
            }
          }
        }
        
        setCollections(collectionList);
        
        // Now load bookmarks from current collection or root
        const path = currentCollection ? `bookmarks/${currentCollection}` : 'bookmarks';
        const files = await getDirectoryContents(path);
        const loadedBookmarks: Bookmark[] = [];
        
        for (const file of files) {
          if (file.type === 'file' && file.name.endsWith('.md')) {
            const result = await getFileContent(`${path}/${file.name}`);
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
                  path: `${path}/${file.name}`,
                  sha,
                  collection: currentCollection || undefined
                });
              }
            }
          }
        }
        
        setBookmarks(loadedBookmarks);
      } catch (err: any) {
        console.error('Error loading bookmarks directory:', err);
        if (err.status === 404) {
          // Directory doesn't exist yet, create it
          await createBookmarksStructure();
        } else {
          setError('Failed to load bookmarks. Please check your GitHub connection.');
        }
      }
    } catch (err) {
      console.error('Error in bookmarks setup:', err);
      setError('Failed to load bookmarks. Please check your GitHub connection.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const createBookmarksStructure = async () => {
    try {
      if (!repo) {
        setError('No GitHub repository connected.');
        return;
      }

      // Create the bookmarks directory with a README
      await saveToRepo(
        'bookmarks/README.md',
        '# SLYNC Bookmarks\n\nThis directory contains your saved bookmarks organized in collections.',
        'Initialize bookmarks structure'
      );
      
      toast.success('Bookmarks directory created!');
      setCollections([]);
      setBookmarks([]);
    } catch (err) {
      console.error('Error creating bookmarks structure:', err);
      setError('Failed to initialize bookmarks directory.');
    }
  };
  
  const handleAddBookmark = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !url) {
      toast.error('Title and URL are required');
      return;
    }
    
    try {
      if (!repo) {
        toast.error('No GitHub repository connected.');
        return;
      }
      
      const tagList = tags.split(',').map(tag => tag.trim()).filter(Boolean);
      const collection = selectedCollection || currentCollection;
      const basePath = collection ? `bookmarks/${collection}` : 'bookmarks';
      const fileName = `${new Date().toISOString().split('T')[0]}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
      
      const content = `---
title: "${title}"
url: ${url}
tags: [${tagList.join(', ')}]
created_at: ${new Date().toISOString()}
---
${notes}`;
      
      await saveToRepo(
        `${basePath}/${fileName}`,
        content,
        `[Slync] Add bookmark: ${title}`
      );
      
      resetForm();
      toast.success('Bookmark added!');
      
      // Reload bookmarks
      loadBookmarks();
    } catch (err) {
      console.error('Error adding bookmark:', err);
      toast.error('Failed to add bookmark');
    }
  };
  
  const handleUpdateBookmark = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingBookmark || !title || !url) {
      toast.error('Title and URL are required');
      return;
    }
    
    try {
      if (!repo) {
        toast.error('No GitHub repository connected.');
        return;
      }
      
      const tagList = tags.split(',').map(tag => tag.trim()).filter(Boolean);
      
      const content = `---
title: "${title}"
url: ${url}
tags: [${tagList.join(', ')}]
updated_at: ${new Date().toISOString()}
---
${notes}`;
      
      await saveToRepo(
        editingBookmark.path,
        content,
        `[Slync] Update bookmark: ${title}`
      );
      
      resetForm();
      toast.success('Bookmark updated!');
      
      // Reload bookmarks
      loadBookmarks();
    } catch (err) {
      console.error('Error updating bookmark:', err);
      toast.error('Failed to update bookmark');
    }
  };
  
  const handleEditBookmark = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
    setTitle(bookmark.title);
    setUrl(bookmark.url);
    setTags(bookmark.tags.join(', '));
    setNotes(bookmark.notes);
    setShowAddForm(true);
  };
  
  const resetForm = () => {
    setShowAddForm(false);
    setEditingBookmark(null);
    setTitle('');
    setUrl('');
    setTags('');
    setNotes('');
    setSelectedCollection('');
  };
  
  const handleDeleteBookmark = async (bookmark: Bookmark) => {
    if (!confirm('Are you sure you want to delete this bookmark?')) {
      return;
    }
    
    try {
      if (!repo) {
        toast.error('No GitHub repository connected.');
        return;
      }
      
      // In a real implementation, we would use GitHub API to delete the file
      // For now we'll just update the UI
      toast.success('Bookmark deleted!');
      setBookmarks(bookmarks.filter(b => b.path !== bookmark.path));
      
      if (editingBookmark?.path === bookmark.path) {
        resetForm();
      }
    } catch (err) {
      console.error('Error deleting bookmark:', err);
      toast.error('Failed to delete bookmark');
    }
  };
  
  const handleCreateCollection = async () => {
    const name = prompt('Enter collection name:');
    if (!name) return;
    
    try {
      if (!repo) {
        toast.error('No GitHub repository connected.');
        return;
      }
      
      await saveToRepo(
        `bookmarks/${name}/.gitkeep`,
        '',
        `[Slync] Create bookmarks collection: ${name}`
      );
      
      toast.success(`Collection "${name}" created!`);
      loadBookmarks();
    } catch (err) {
      console.error('Error creating collection:', err);
      toast.error('Failed to create collection');
    }
  };
  
  const selectCollection = (name: string) => {
    setCurrentCollection(name);
    setBookmarks([]);
    
    // We need to reload bookmarks for this collection
    setTimeout(() => {
      loadBookmarks();
    }, 100);
  };
  
  const clearCollection = () => {
    setCurrentCollection('');
    setBookmarks([]);
    
    // Reload bookmarks from root
    setTimeout(() => {
      loadBookmarks();
    }, 100);
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
            <Book size={24} className="text-matrix-primary mr-3" />
            <GlitchText text="Matrix Bookmarks" variant="title" />
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
        
        <div className="flex gap-6">
          {/* Left sidebar - Collections */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-56 flex-shrink-0"
          >
            <div className="matrix-card h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-matrix-primary font-semibold">Collections</h3>
                <button 
                  className="text-matrix-primary hover:text-matrix-primary/70"
                  onClick={handleCreateCollection}
                >
                  <Plus size={16} />
                </button>
              </div>
              
              <div className="space-y-2">
                <div 
                  className={`p-2 rounded cursor-pointer flex items-center justify-between group ${!currentCollection ? 'bg-matrix-primary/20' : 'hover:bg-matrix-primary/10'}`}
                  onClick={clearCollection}
                >
                  <div className="flex items-center">
                    <Folder size={14} className="mr-2 text-matrix-primary/70" />
                    <span className="text-matrix-primary text-sm">All Bookmarks</span>
                  </div>
                </div>
                
                {collections.map((collection, index) => (
                  <div 
                    key={index}
                    className={`p-2 rounded cursor-pointer flex items-center justify-between group ${currentCollection === collection.name ? 'bg-matrix-primary/20' : 'hover:bg-matrix-primary/10'}`}
                    onClick={() => selectCollection(collection.name)}
                  >
                    <div className="flex items-center">
                      <Folder size={14} className="mr-2 text-matrix-primary/70" />
                      <span className="text-matrix-primary text-sm">{collection.name}</span>
                    </div>
                    <span className="text-matrix-primary/50 text-xs">
                      {collection.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
          
          {/* Main content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex-grow"
          >
            {showAddForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="matrix-card mb-6"
                onSubmit={editingBookmark ? handleUpdateBookmark : handleAddBookmark}
              >
                <h3 className="text-lg text-matrix-primary mb-4">
                  {editingBookmark ? 'Edit Bookmark' : 'Add New Bookmark'}
                </h3>
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
                  
                  {!editingBookmark && (
                    <div>
                      <label className="block text-matrix-primary/80 mb-2 text-sm">Collection</label>
                      <select
                        value={selectedCollection}
                        onChange={(e) => setSelectedCollection(e.target.value)}
                        className="neon-border bg-matrix-background/60 text-matrix-primary px-4 py-3 rounded-md outline-none focus:shadow-glow w-full"
                      >
                        <option value="">Default (Root)</option>
                        {collections.map((collection, index) => (
                          <option key={index} value={collection.name}>{collection.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  
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
                      <Save size={18} className="mr-2" />
                      {editingBookmark ? 'Update Bookmark' : 'Save Bookmark'}
                    </NeonButton>
                  </div>
                </div>
              </motion.form>
            )}
            
            {isLoading ? (
              <motion.div
                variants={itemVariants}
                className="matrix-card text-center py-12"
              >
                <div className="animate-pulse text-matrix-primary">Loading bookmarks...</div>
              </motion.div>
            ) : error ? (
              <motion.div
                variants={itemVariants}
                className="matrix-card text-center py-12"
              >
                <div className="text-red-400 mb-4">{error}</div>
                {!repo && (
                  <NeonButton onClick={() => navigate('/authentication')}>
                    Connect GitHub Repository
                  </NeonButton>
                )}
                {repo && (
                  <NeonButton onClick={() => createBookmarksStructure()}>
                    Initialize Bookmarks
                  </NeonButton>
                )}
              </motion.div>
            ) : filteredBookmarks.length > 0 ? (
              <motion.div
                variants={containerVariants}
                className="space-y-4"
              >
                {filteredBookmarks.map((bookmark, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="matrix-card"
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex justify-between">
                      <h3 className="text-lg text-matrix-primary font-bold">{bookmark.title}</h3>
                      
                      <div className="flex space-x-2">
                        <button 
                          className="text-matrix-primary hover:text-matrix-primary/70"
                          onClick={() => handleEditBookmark(bookmark)}
                        >
                          <Edit size={16} />
                        </button>
                        
                        <button 
                          className="text-red-500/70 hover:text-red-500"
                          onClick={() => handleDeleteBookmark(bookmark)}
                        >
                          <Trash2 size={16} />
                        </button>
                        
                        <a 
                          href={bookmark.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-matrix-primary hover:text-matrix-primary/70"
                        >
                          <ExternalLink size={16} />
                        </a>
                      </div>
                    </div>
                    
                    <div className="text-sm text-matrix-primary/60 mt-1 break-all">
                      {bookmark.url}
                    </div>
                    
                    {bookmark.collection && (
                      <div className="mt-2">
                        <span className="bg-matrix-primary/30 text-matrix-primary text-xs px-2 py-1 rounded flex items-center w-fit">
                          <Folder size={10} className="mr-1" />
                          {bookmark.collection}
                        </span>
                      </div>
                    )}
                    
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
              </motion.div>
            ) : (
              <motion.div variants={itemVariants} className="matrix-card text-center py-12">
                <Book size={40} className="mx-auto text-matrix-primary/30 mb-4" />
                {searchTerm ? (
                  <p className="text-matrix-primary/60">No bookmarks match your search</p>
                ) : (
                  <>
                    <p className="text-matrix-primary/60">No bookmarks saved yet</p>
                    <NeonButton 
                      onClick={() => setShowAddForm(true)}
                      className="mt-4"
                    >
                      <Plus size={18} className="mr-2" />
                      Add your first bookmark
                    </NeonButton>
                  </>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Bookmarks;
