
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Note } from '@/types/auth';

interface UseNotesProps {
  folder?: string;
}

export const useNotes = ({ folder }: UseNotesProps = {}) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load folders
  useEffect(() => {
    const loadFolders = async () => {
      try {
        const { data, error } = await supabase
          .from('folders')
          .select('id, name')
          .eq('type', 'note')
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
  }, []);

  // Load notes
  useEffect(() => {
    const loadNotes = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from('notes')
          .select('*')
          .order('updated_at', { ascending: false });

        if (folder) {
          // First get the folder ID
          const { data: folderData } = await supabase
            .from('folders')
            .select('id')
            .eq('name', folder)
            .eq('type', 'note')
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

    loadNotes();

    // Set up real-time subscription
    const subscription = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes'
        },
        () => {
          loadNotes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [folder]);

  const createNote = async (note: Omit<Note, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
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
          .single();

        if (existingFolder) {
          folder_id = existingFolder.id;
        } else {
          const { data: newFolder, error: folderError } = await supabase
            .from('folders')
            .insert({ name: folder, type: 'note' })
            .select()
            .single();

          if (folderError) throw folderError;
          folder_id = newFolder.id;
        }
      }

      const { data, error } = await supabase
        .from('notes')
        .insert({ ...note, folder_id })
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
    try {
      const { data, error } = await supabase
        .from('notes')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
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
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

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
    try {
      const { data, error } = await supabase
        .from('folders')
        .insert({ name, type: 'note' })
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
