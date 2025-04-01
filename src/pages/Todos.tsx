
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { CheckSquare, Plus, X, Calendar as CalendarIcon, ArrowLeft, Search, 
         Trash2, Edit2, Save, Clock, Tag, Check, Circle, CheckCircle, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO, isToday, isTomorrow, isThisWeek, addDays, isAfter } from 'date-fns';

import NeonButton from '@/components/NeonButton';
import NeonInput from '@/components/NeonInput';
import GlitchText from '@/components/GlitchText';
import MatrixRain from '@/components/MatrixRain';
import { useTheme } from '@/hooks/useTheme';

interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate: string | null;
  tags: string[];
  path: string;
  sha: string;
}

const priorityColors = {
  low: 'bg-blue-500/20 text-blue-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  high: 'bg-red-500/20 text-red-400',
};

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'blue-400' },
  { value: 'medium', label: 'Medium', color: 'yellow-400' },
  { value: 'high', label: 'High', color: 'red-400' },
];

const Todos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState<string>('');
  const [tags, setTags] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'tomorrow' | 'week' | 'overdue'>('all');
  
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
            const completedMatch = content.match(/completed: (true|false)/);
            const priorityMatch = content.match(/priority: (low|medium|high)/);
            const dueDateMatch = content.match(/due_date: (.+)/);
            const tagsMatch = content.match(/tags: \[(.*?)\]/);
            
            const description = content.split('---').slice(2).join('---').trim();
            
            if (titleMatch) {
              loadedTodos.push({
                id: file.name.replace('.md', ''),
                title: titleMatch[1],
                description,
                completed: completedMatch ? completedMatch[1] === 'true' : false,
                priority: priorityMatch ? priorityMatch[1] as 'low' | 'medium' | 'high' : 'medium',
                dueDate: dueDateMatch ? dueDateMatch[1] : null,
                tags: tagsMatch ? tagsMatch[1].split(',').map(tag => tag.trim()) : [],
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
      const tagList = tags.split(',').map(tag => tag.trim()).filter(Boolean);
      const fileName = `${new Date().toISOString().split('T')[0]}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
      
      const content = `---
title: "${title}"
completed: false
priority: ${priority}
due_date: ${dueDate || null}
tags: [${tagList.join(', ')}]
created_at: ${new Date().toISOString()}
---
${description}`;
      
      await saveToRepo(
        `todos/${fileName}`,
        content,
        `[Slync] Add todo: ${title}`
      );
      
      resetForm();
      toast.success('Todo added!');
      
      // Reload todos
      loadTodos();
    } catch (err) {
      console.error('Error adding todo:', err);
      toast.error('Failed to add todo');
    }
  };
  
  const handleUpdateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingTodo || !title) {
      toast.error('Title is required');
      return;
    }
    
    try {
      const tagList = tags.split(',').map(tag => tag.trim()).filter(Boolean);
      
      const content = `---
title: "${title}"
completed: ${editingTodo.completed}
priority: ${priority}
due_date: ${dueDate || null}
tags: [${tagList.join(', ')}]
updated_at: ${new Date().toISOString()}
---
${description}`;
      
      await saveToRepo(
        editingTodo.path,
        content,
        `[Slync] Update todo: ${title}`
      );
      
      resetForm();
      toast.success('Todo updated!');
      
      // Reload todos
      loadTodos();
    } catch (err) {
      console.error('Error updating todo:', err);
      toast.error('Failed to update todo');
    }
  };
  
  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setTitle(todo.title);
    setDescription(todo.description);
    setPriority(todo.priority);
    setDueDate(todo.dueDate || '');
    setTags(todo.tags.join(', '));
    setShowAddForm(true);
  };
  
  const handleToggleComplete = async (todo: Todo) => {
    try {
      const updatedTodo = { ...todo, completed: !todo.completed };
      
      const tagList = todo.tags.join(', ');
      
      const content = `---
title: "${todo.title}"
completed: ${!todo.completed}
priority: ${todo.priority}
due_date: ${todo.dueDate || null}
tags: [${tagList}]
updated_at: ${new Date().toISOString()}
---
${todo.description}`;
      
      await saveToRepo(
        todo.path,
        content,
        `[Slync] Mark todo as ${!todo.completed ? 'completed' : 'active'}: ${todo.title}`
      );
      
      // Update in the local state immediately
      setTodos(todos.map(t => t.id === todo.id ? updatedTodo : t));
      
      toast.success(`Marked "${todo.title}" as ${!todo.completed ? 'completed' : 'active'}`);
    } catch (err) {
      console.error('Error toggling todo:', err);
      toast.error('Failed to update todo');
    }
  };
  
  const resetForm = () => {
    setShowAddForm(false);
    setEditingTodo(null);
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
    setTags('');
  };
  
  const handleDeleteTodo = async (todo: Todo) => {
    if (!confirm('Are you sure you want to delete this todo?')) {
      return;
    }
    
    try {
      // In a real implementation, we would use GitHub API to delete the file
      // For now we'll just update the UI
      toast.success('Todo deleted!');
      setTodos(todos.filter(t => t.id !== todo.id));
      
      if (editingTodo?.id === todo.id) {
        resetForm();
      }
    } catch (err) {
      console.error('Error deleting todo:', err);
      toast.error('Failed to delete todo');
    }
  };
  
  // Filter todos based on search term, completion status, and time
  const filteredTodos = todos.filter(todo => {
    // Search filter
    const matchesSearch = searchTerm 
      ? todo.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        todo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        todo.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      : true;
    
    // Completion filter
    const matchesCompletion = 
      filter === 'all' ? true : 
      filter === 'completed' ? todo.completed : 
      !todo.completed;
    
    // Time filter
    let matchesTimeFilter = true;
    if (timeFilter !== 'all' && todo.dueDate) {
      const date = parseISO(todo.dueDate);
      
      switch(timeFilter) {
        case 'today':
          matchesTimeFilter = isToday(date);
          break;
        case 'tomorrow':
          matchesTimeFilter = isTomorrow(date);
          break;
        case 'week':
          matchesTimeFilter = isThisWeek(date, { weekStartsOn: 1 });
          break;
        case 'overdue':
          matchesTimeFilter = isAfter(new Date(), date);
          break;
      }
    } else if (timeFilter !== 'all' && !todo.dueDate) {
      matchesTimeFilter = false;
    }
    
    return matchesSearch && matchesCompletion && matchesTimeFilter;
  });
  
  const formatDueDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    
    try {
      const date = parseISO(dateStr);
      
      if (isToday(date)) {
        return 'Today';
      } else if (isTomorrow(date)) {
        return 'Tomorrow';
      } else {
        return format(date, 'MMM d, yyyy');
      }
    } catch (e) {
      return dateStr;
    }
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
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
            <GlitchText text="Matrix Todo" variant="title" />
          </div>
          
          <div className="flex items-center space-x-4">
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
            className="matrix-card mb-6"
            onSubmit={editingTodo ? handleUpdateTodo : handleAddTodo}
          >
            <h3 className="text-lg text-matrix-primary mb-4">
              {editingTodo ? 'Edit Todo' : 'Add New Todo'}
            </h3>
            <div className="space-y-4">
              <NeonInput
                type="text"
                placeholder="Todo Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-matrix-primary/80 mb-2 text-sm">Priority</label>
                  <div className="flex space-x-2">
                    {priorityOptions.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`px-3 py-1 rounded text-sm flex-1 ${priority === opt.value ? `bg-${opt.color}/30 text-${opt.color}` : 'bg-matrix-primary/10 text-matrix-primary/50'}`}
                        onClick={() => setPriority(opt.value as 'low' | 'medium' | 'high')}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-matrix-primary/80 mb-2 text-sm">Due Date</label>
                  <NeonInput
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    icon={<CalendarIcon size={18} />}
                  />
                </div>
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
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="neon-border bg-matrix-background/60 text-matrix-primary px-4 py-3 rounded-md outline-none focus:shadow-glow w-full h-32 resize-none"
                />
              </div>
              
              <div className="flex justify-end">
                <NeonButton type="submit">
                  <Save size={18} className="mr-2" />
                  {editingTodo ? 'Update Todo' : 'Save Todo'}
                </NeonButton>
              </div>
            </div>
          </motion.form>
        )}
        
        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6"
        >
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <span className="text-matrix-primary/70 text-sm">Status:</span>
            <div className="flex rounded-md overflow-hidden neon-border">
              <button 
                onClick={() => setFilter('all')}
                className={`px-3 py-1 text-sm ${filter === 'all' ? 'bg-matrix-primary/30 text-matrix-primary' : 'bg-matrix-primary/10 text-matrix-primary/50'}`}
              >
                All
              </button>
              <button 
                onClick={() => setFilter('active')}
                className={`px-3 py-1 text-sm ${filter === 'active' ? 'bg-matrix-primary/30 text-matrix-primary' : 'bg-matrix-primary/10 text-matrix-primary/50'}`}
              >
                Active
              </button>
              <button 
                onClick={() => setFilter('completed')}
                className={`px-3 py-1 text-sm ${filter === 'completed' ? 'bg-matrix-primary/30 text-matrix-primary' : 'bg-matrix-primary/10 text-matrix-primary/50'}`}
              >
                Completed
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <span className="text-matrix-primary/70 text-sm flex items-center">
              <CalendarIcon size={14} className="mr-1" />
              Due:
            </span>
            <div className="flex rounded-md overflow-hidden neon-border flex-wrap">
              <button 
                onClick={() => setTimeFilter('all')}
                className={`px-2 py-1 text-xs ${timeFilter === 'all' ? 'bg-matrix-primary/30 text-matrix-primary' : 'bg-matrix-primary/10 text-matrix-primary/50'}`}
              >
                All
              </button>
              <button 
                onClick={() => setTimeFilter('today')}
                className={`px-2 py-1 text-xs ${timeFilter === 'today' ? 'bg-matrix-primary/30 text-matrix-primary' : 'bg-matrix-primary/10 text-matrix-primary/50'}`}
              >
                Today
              </button>
              <button 
                onClick={() => setTimeFilter('tomorrow')}
                className={`px-2 py-1 text-xs ${timeFilter === 'tomorrow' ? 'bg-matrix-primary/30 text-matrix-primary' : 'bg-matrix-primary/10 text-matrix-primary/50'}`}
              >
                Tomorrow
              </button>
              <button 
                onClick={() => setTimeFilter('week')}
                className={`px-2 py-1 text-xs ${timeFilter === 'week' ? 'bg-matrix-primary/30 text-matrix-primary' : 'bg-matrix-primary/10 text-matrix-primary/50'}`}
              >
                This Week
              </button>
              <button 
                onClick={() => setTimeFilter('overdue')}
                className={`px-2 py-1 text-xs ${timeFilter === 'overdue' ? 'bg-red-500/30 text-red-400' : 'bg-matrix-primary/10 text-matrix-primary/50'}`}
              >
                Overdue
              </button>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {filteredTodos.length > 0 ? (
            filteredTodos.map((todo, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className={`matrix-card ${todo.completed ? 'opacity-70' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => handleToggleComplete(todo)}
                    className="mt-1 text-matrix-primary hover:text-matrix-primary/70"
                  >
                    {todo.completed ? 
                      <CheckCircle size={20} className="text-matrix-primary" /> : 
                      <Circle size={20} className="text-matrix-primary/50" />
                    }
                  </button>
                  
                  <div className="flex-grow">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <h3 className={`text-lg font-medium ${todo.completed ? 'text-matrix-primary/50 line-through' : 'text-matrix-primary'}`}>
                        {todo.title}
                      </h3>
                      
                      <div className="flex items-center space-x-3">
                        <span className={`text-xs px-2 py-0.5 rounded ${priorityColors[todo.priority]}`}>
                          {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
                        </span>
                        
                        {todo.dueDate && (
                          <span className="text-xs flex items-center text-matrix-primary/70">
                            <Clock size={12} className="mr-1" />
                            {formatDueDate(todo.dueDate)}
                          </span>
                        )}
                        
                        <div className="flex space-x-2">
                          <button 
                            className="text-matrix-primary hover:text-matrix-primary/70"
                            onClick={() => handleEditTodo(todo)}
                          >
                            <Edit2 size={14} />
                          </button>
                          
                          <button 
                            className="text-red-500/70 hover:text-red-500"
                            onClick={() => handleDeleteTodo(todo)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {todo.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {todo.tags.map((tag, tagIdx) => (
                          <span 
                            key={tagIdx} 
                            className="bg-matrix-primary/20 text-matrix-primary text-xs px-2 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {todo.description && (
                      <p className={`mt-2 text-sm ${todo.completed ? 'text-matrix-primary/40' : 'text-matrix-primary/70'}`}>
                        {todo.description}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              variants={itemVariants}
              className="matrix-card text-center py-12"
            >
              <CheckSquare size={40} className="mx-auto text-matrix-primary/30 mb-4" />
              
              {searchTerm || filter !== 'all' || timeFilter !== 'all' ? (
                <div className="space-y-2">
                  <p className="text-matrix-primary/60">No matching todos found</p>
                  <div className="flex justify-center">
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setFilter('all');
                        setTimeFilter('all');
                      }}
                      className="flex items-center text-matrix-primary text-sm hover:underline"
                    >
                      <Filter size={14} className="mr-1" />
                      Clear filters
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-matrix-primary/60">No todos yet</p>
                  <NeonButton 
                    onClick={() => setShowAddForm(true)}
                    className="mt-4"
                  >
                    <Plus size={18} className="mr-2" />
                    Add your first todo
                  </NeonButton>
                </>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Todos;
