
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { CheckSquare, Plus, X, ArrowLeft, Search, Calendar, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import NeonButton from '@/components/NeonButton';
import NeonInput from '@/components/NeonInput';
import GlitchText from '@/components/GlitchText';
import MatrixRain from '@/components/MatrixRain';
import { useTheme } from '@/hooks/useTheme';

interface Todo {
  title: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  status: 'pending' | 'completed';
  notes: string;
  path: string;
  sha: string;
}

const Todos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Todo['priority']>('medium');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  
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
    
    loadTodos();
  }, [repo, user, navigate]);
  
  const loadTodos = async () => {
    if (!repo) return;
    
    try {
      const files = await getDirectoryContents('todos');
      const loadedTodos: Todo[] = [];
      
      for (const file of files) {
        if (file.type === 'file' && file.name.endsWith('.md')) {
          const result = await getFileContent(`todos/${file.name}`);
          if (result) {
            const { content, sha } = result;
            
            // Parse frontmatter
            const titleMatch = content.match(/title: "(.+?)"/);
            const priorityMatch = content.match(/priority: (\w+)/);
            const dueDateMatch = content.match(/due_date: (.+)/);
            const statusMatch = content.match(/status: (\w+)/);
            
            const notesContent = content.split('---').slice(2).join('---').trim();
            
            if (titleMatch && priorityMatch && statusMatch) {
              loadedTodos.push({
                title: titleMatch[1],
                priority: priorityMatch[1] as Todo['priority'],
                dueDate: dueDateMatch ? dueDateMatch[1] : undefined,
                status: statusMatch[1] as Todo['status'],
                notes: notesContent,
                path: `todos/${file.name}`,
                sha
              });
            }
          }
        }
      }
      
      setTodos(loadedTodos);
    } catch (err) {
      console.error('Error loading todos:', err);
      toast.error('Failed to load todos');
    }
  };
  
  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title) {
      toast.error('Title is required');
      return;
    }
    
    try {
      const fileName = `${new Date().toISOString().split('T')[0]}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
      
      const content = `---
title: "${title}"
priority: ${priority}
${dueDate ? `due_date: ${dueDate}` : ''}
status: pending
---
${notes}`;
      
      await saveToRepo(
        `todos/${fileName}`,
        content,
        `[Matrix-App] Add todo: ${title}`
      );
      
      setShowAddForm(false);
      setTitle('');
      setPriority('medium');
      setDueDate('');
      setNotes('');
      
      // Reload todos
      loadTodos();
    } catch (err) {
      console.error('Error adding todo:', err);
      toast.error('Failed to add todo');
    }
  };
  
  const toggleTodoStatus = async (todo: Todo) => {
    try {
      const newStatus = todo.status === 'pending' ? 'completed' : 'pending';
      
      // Update the content with the new status
      const result = await getFileContent(todo.path);
      if (!result) return;
      
      const updatedContent = result.content.replace(
        /status: \w+/,
        `status: ${newStatus}`
      );
      
      await saveToRepo(
        todo.path,
        updatedContent,
        `[Matrix-App] Update todo status: ${todo.title}`
      );
      
      // Update local state
      setTodos(todos.map(t => 
        t.path === todo.path ? { ...t, status: newStatus as Todo['status'] } : t
      ));
      
      toast.success(`Todo marked as ${newStatus}`);
    } catch (err) {
      console.error('Error updating todo status:', err);
      toast.error('Failed to update todo status');
    }
  };
  
  const priorityColorClass = (priority: Todo['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-matrix-primary';
    }
  };
  
  const filteredTodos = todos
    .filter(todo => 
      (filterStatus === 'all' || todo.status === filterStatus) &&
      (searchTerm === '' || todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       todo.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      // First by status (pending first)
      if (a.status !== b.status) {
        return a.status === 'pending' ? -1 : 1;
      }
      
      // Then by priority
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (a.priority !== b.priority) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      
      // Then by due date if available
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      
      return 0;
    });
  
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
            <CheckSquare size={24} className="text-matrix-primary mr-3" />
            <GlitchText text="To-Do List" variant="title" />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex border border-matrix-primary/30 rounded-md overflow-hidden">
              <button 
                className={`px-3 py-1 text-sm ${filterStatus === 'all' ? 'bg-matrix-primary text-black' : 'text-matrix-primary'}`}
                onClick={() => setFilterStatus('all')}
              >
                All
              </button>
              <button 
                className={`px-3 py-1 text-sm ${filterStatus === 'pending' ? 'bg-matrix-primary text-black' : 'text-matrix-primary'}`}
                onClick={() => setFilterStatus('pending')}
              >
                Pending
              </button>
              <button 
                className={`px-3 py-1 text-sm ${filterStatus === 'completed' ? 'bg-matrix-primary text-black' : 'text-matrix-primary'}`}
                onClick={() => setFilterStatus('completed')}
              >
                Completed
              </button>
            </div>
            
            <NeonInput
              type="text"
              placeholder="Search todos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search size={18} />}
            />
            
            <NeonButton onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? <X size={18} /> : <Plus size={18} />}
              {showAddForm ? 'Cancel' : 'Add Todo'}
            </NeonButton>
          </div>
        </motion.div>
        
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="matrix-card mb-8"
            onSubmit={handleAddTodo}
          >
            <h3 className="text-lg text-matrix-primary mb-4">Add New Todo</h3>
            <div className="space-y-4">
              <NeonInput
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-matrix-primary mb-2 text-sm">Priority</label>
                  <div className="flex border border-matrix-primary/30 rounded-md overflow-hidden">
                    <button 
                      type="button"
                      className={`flex-1 py-2 text-sm ${priority === 'low' ? 'bg-matrix-primary text-black' : 'text-matrix-primary'}`}
                      onClick={() => setPriority('low')}
                    >
                      Low
                    </button>
                    <button 
                      type="button"
                      className={`flex-1 py-2 text-sm ${priority === 'medium' ? 'bg-matrix-primary text-black' : 'text-matrix-primary'}`}
                      onClick={() => setPriority('medium')}
                    >
                      Medium
                    </button>
                    <button 
                      type="button"
                      className={`flex-1 py-2 text-sm ${priority === 'high' ? 'bg-matrix-primary text-black' : 'text-matrix-primary'}`}
                      onClick={() => setPriority('high')}
                    >
                      High
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-matrix-primary mb-2 text-sm">Due Date (Optional)</label>
                  <NeonInput
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    icon={<Calendar size={18} />}
                  />
                </div>
              </div>
              
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
                  Add Todo
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
          {filteredTodos.length > 0 ? (
            filteredTodos.map((todo, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className={`matrix-card ${todo.status === 'completed' ? 'opacity-60' : ''}`}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-start">
                  <div 
                    className={`w-6 h-6 rounded-md cursor-pointer flex items-center justify-center border-2 ${todo.status === 'completed' ? 'bg-matrix-primary/30 border-matrix-primary/50' : 'border-matrix-primary/80'}`}
                    onClick={() => toggleTodoStatus(todo)}
                  >
                    {todo.status === 'completed' && <CheckSquare size={14} className="text-matrix-primary" />}
                  </div>
                  
                  <div className="ml-4 flex-1">
                    <h3 className={`text-lg text-matrix-primary font-bold ${todo.status === 'completed' ? 'line-through' : ''}`}>
                      {todo.title}
                    </h3>
                    
                    <div className="flex flex-wrap gap-4 mt-2">
                      <div className="flex items-center">
                        <AlertCircle size={14} className={`${priorityColorClass(todo.priority)} mr-1`} />
                        <span className={`text-xs ${priorityColorClass(todo.priority)}`}>
                          {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)} Priority
                        </span>
                      </div>
                      
                      {todo.dueDate && (
                        <div className="flex items-center text-matrix-primary/70">
                          <Calendar size={14} className="mr-1" />
                          <span className="text-xs">{todo.dueDate}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-matrix-primary/70">
                        <Clock size={14} className="mr-1" />
                        <span className="text-xs">
                          {todo.status.charAt(0).toUpperCase() + todo.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    {todo.notes && (
                      <div className="mt-3 text-matrix-primary/80 text-sm border-t border-matrix-primary/20 pt-3">
                        {todo.notes}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div variants={itemVariants} className="text-center py-8">
              {searchTerm ? (
                <p className="text-matrix-primary/60">No todos match your search</p>
              ) : (
                <p className="text-matrix-primary/60">No todos added yet</p>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Todos;
