
import { User, Session } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
}

export interface Bookmark {
  id: string;
  user_id: string;
  title: string;
  url: string;
  description?: string;
  created_at: string;
  updated_at: string;
  folder_id?: string | null;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  folder_id?: string | null;
}

export interface TodoItem {
  id: string;
  user_id: string;
  content: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  folder_id?: string | null;
}

export interface Folder {
  id: string;
  user_id: string;
  name: string;
  type: 'bookmark' | 'note' | 'todo';
  created_at: string;
  updated_at: string;
}
