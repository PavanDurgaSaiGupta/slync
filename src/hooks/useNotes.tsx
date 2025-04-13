
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Note } from '@/types/auth';
import { useAuth } from '@/contexts/AuthContext';

interface UseNotesProps {
  folder?: string;
}

export const useNotes = ({ folder }: UseNotesProps = {}) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Load folders
  useEffect(() => {
    const loadFolders = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('folders')
          .select('id, name')
          .eq('type', 'note')
          .eq('user_id', user.id)
          .order('name', { ascending: true });

        if (error) throw error;

        setFolders(data || []);
      } catch (err: any) {
        console.error('Error loading folders:', err);
        setError(err.message);
        toast.error('Failed to load folders');
      }
    };

    loadFolders();
  }, [user]);

  // Load notes
  useEffect(() => {
    const loadNotes = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        let query = supabase
          .from('notes')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

        if (folder) {
          // First get the folder ID
          const { data: folderData } = await supabase
            .from('folders')
            .select('id')
            .eq('name', folder)
            .eq('type', 'note')
            .eq('user_id', user.id)
            .single();

          if (folderData) {
            query = query.eq('folder_id', folderData.id);
          }
        }

        const { data, error } = await query;

        if (error) throw error;

        setNotes(data || []);
      } catch (err: any) {
        console.error('Error loading notes:', err);
        setError(err.message);
        toast.error('Failed to load notes');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadNotes();

      // Set up real-time subscription
      const subscription = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notes',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            loadNotes();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [folder, user]);

  const createNote = async (note: Omit<Note, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      toast.error('You must be logged in to create notes');
      return null;
    }
    
    try {
      // Check if we need to create a folder first
      let folder_id = note.folder_id;

      if (!folder_id && folder) {
        // Create or find the folder
        const { data: existingFolder } = await supabase
          .from('folders')
          .select('id')
          .eq('name', folder)
          .eq('type', 'note')
          .eq('user_id', user.id)
          .single();

        if (existingFolder) {
          folder_id = existingFolder.id;
        } else {
          const { data: newFolder, error: folderError } = await supabase
            .from('folders')
            .insert({ name: folder, type: 'note', user_id: user.id })
            .select()
            .single();

          if (folderError) throw folderError;
          folder_id = newFolder.id;
        }
      }

      const { data, error } = await supabase
        .from('notes')
        .insert({ 
          ...note, 
          folder_id,
          user_id: user.id 
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Note created successfully');
      return data;
    } catch (err: any) {
      console.error('Error creating note:', err);
      toast.error('Failed to create note');
      setError(err.message);
      return null;
    }
  };

  const updateNote = async (id: string, updates: Partial<Omit<Note, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!user) {
      toast.error('You must be logged in to update notes');
      return null;
    }
    
    try {
      const { data, error } = await supabase
        .from('notes')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      toast.success('Note updated successfully');
      return data;
    } catch (err: any) {
      console.error('Error updating note:', err);
      toast.error('Failed to update note');
      setError(err.message);
      return null;
    }
  };

  const deleteNote = async (id: string) => {
    if (!user) {
      toast.error('You must be logged in to delete notes');
      return false;
    }
    
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotes(notes.filter(note => note.id !== id));
      toast.success('Note deleted successfully');
      return true;
    } catch (err: any) {
      console.error('Error deleting note:', err);
      toast.error('Failed to delete note');
      setError(err.message);
      return false;
    }
  };

  const createFolder = async (name: string) => {
    if (!user) {
      toast.error('You must be logged in to create folders');
      return null;
    }
    
    try {
      const { data, error } = await supabase
        .from('folders')
        .insert({ name, type: 'note', user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      setFolders([...folders, data]);
      toast.success(`Folder "${name}" created successfully`);
      return data;
    } catch (err: any) {
      console.error('Error creating folder:', err);
      toast.error('Failed to create folder');
      setError(err.message);
      return null;
    }
  };

  return {
    notes,
    folders,
    isLoading,
    error,
    createNote,
    updateNote,
    deleteNote,
    createFolder
  };
};
