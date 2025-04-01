
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Octokit } from 'octokit';
import { toast } from 'sonner';

interface AuthState {
  user: {
    username: string;
    email: string;
    avatarUrl: string;
  } | null;
  token: string | null;
  repo: {
    owner: string;
    name: string;
    url: string;
  } | null;
  octokit: Octokit | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: AuthState['user']) => void;
  setToken: (token: string) => void;
  setRepo: (repo: AuthState['repo']) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  
  // GitHub Actions
  connectRepo: (repoUrl: string) => Promise<void>;
  createFolder: (folderPath: string) => Promise<void>;
  saveToRepo: (path: string, content: string, message: string) => Promise<void>;
  getFileContent: (path: string) => Promise<{ content: string; sha: string } | null>;
  getDirectoryContents: (path: string) => Promise<any[]>;
}

// Helper function to safely encode content to base64
const safelyEncodeToBase64 = (str: string): string => {
  try {
    // For browser environments
    return btoa(encodeURIComponent(str));
  } catch (e) {
    console.error('Error encoding to base64:', e);
    throw new Error('Failed to encode content to base64');
  }
};

// Helper function to decode base64 content safely
const safelyDecodeBase64 = (base64: string): string => {
  try {
    // For browser environments
    return decodeURIComponent(atob(base64));
  } catch (e) {
    console.error('Error decoding base64:', e);
    return '';
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      repo: null,
      octokit: null,
      isLoading: false,
      error: null,
      
      setUser: (user) => set({ user }),
      setToken: (token) => {
        const octokit = token ? new Octokit({ auth: token }) : null;
        set({ token, octokit });
      },
      setRepo: (repo) => set({ repo }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      
      logout: () => {
        toast.info('Logged out successfully');
        set({ 
          user: null, 
          token: null,
          repo: null,
          octokit: null,
          error: null 
        });
      },
      
      connectRepo: async (repoUrl: string) => {
        try {
          set({ isLoading: true, error: null });
          const { octokit } = get();
          
          if (!octokit) {
            throw new Error('Not authenticated with GitHub');
          }
          
          // Parse repo URL to extract owner and name
          // Format: https://github.com/username/repo
          const urlParts = repoUrl.split('/');
          const owner = urlParts[urlParts.length - 2];
          const name = urlParts[urlParts.length - 1].replace('.git', '');
          
          // Verify the repo exists
          try {
            await octokit.rest.repos.get({
              owner,
              repo: name,
            });
            
            // Set the repo info
            set({ 
              repo: {
                owner,
                name,
                url: repoUrl
              },
              isLoading: false
            });
            
            // Initialize repository structure
            await get().createFolder('bookmarks');
            await get().createFolder('todos');
            await get().createFolder('notes');
            await get().createFolder('config');
            
            toast.success('Repository connected successfully!');
            
          } catch (e) {
            console.error('Error connecting to repository:', e);
            set({ 
              error: 'Repository not found or access denied',
              isLoading: false
            });
            toast.error('Repository not found or access denied');
          }
        } catch (e) {
          console.error('Error in connectRepo:', e);
          set({ 
            error: e instanceof Error ? e.message : 'Failed to connect to repository',
            isLoading: false
          });
          toast.error(e instanceof Error ? e.message : 'Failed to connect to repository');
        }
      },
      
      createFolder: async (folderPath: string) => {
        try {
          const { octokit, repo } = get();
          
          if (!octokit || !repo) {
            throw new Error('Not connected to a repository');
          }
          
          try {
            // Try to get the content first to check if it exists
            await octokit.rest.repos.getContent({
              owner: repo.owner,
              repo: repo.name,
              path: folderPath,
            });
            
            // If we get here, the folder exists
            console.log(`Folder '${folderPath}' already exists`);
          } catch (e) {
            // If we get a 404, the folder doesn't exist, so create it
            if (e instanceof Error && e.message.includes('Not Found')) {
              try {
                await octokit.rest.repos.createOrUpdateFileContents({
                  owner: repo.owner,
                  repo: repo.name,
                  path: `${folderPath}/.gitkeep`,
                  message: `[Slync] Initialize ${folderPath} folder`,
                  content: safelyEncodeToBase64(' '),
                });
                console.log(`Created folder '${folderPath}'`);
                toast.success(`Created folder '${folderPath}'`);
              } catch (createErr) {
                console.error(`Error creating folder '${folderPath}':`, createErr);
                toast.error(`Failed to create folder '${folderPath}'`);
                throw new Error(`Failed to create folder '${folderPath}'`);
              }
            } else {
              throw e;
            }
          }
        } catch (e) {
          console.error('Error in createFolder:', e);
          set({ 
            error: e instanceof Error ? e.message : `Failed to create folder '${folderPath}'`,
            isLoading: false
          });
        }
      },
      
      saveToRepo: async (path: string, content: string, message: string) => {
        try {
          set({ isLoading: true, error: null });
          const { octokit, repo } = get();
          
          if (!octokit || !repo) {
            throw new Error('Not connected to a repository');
          }
          
          let sha: string | undefined;
          
          // Check if the file already exists to get its SHA
          try {
            const { data } = await octokit.rest.repos.getContent({
              owner: repo.owner,
              repo: repo.name,
              path,
            });
            
            // Check if data is a single file or an array (directory)
            if (!Array.isArray(data) && 'sha' in data) {
              sha = data.sha;
            }
          } catch (e) {
            // File doesn't exist, which is fine
          }
          
          // Create or update the file
          await octokit.rest.repos.createOrUpdateFileContents({
            owner: repo.owner,
            repo: repo.name,
            path,
            message,
            content: safelyEncodeToBase64(content),
            sha, // Include SHA if updating an existing file
          });
          
          set({ isLoading: false });
          toast.success('Saved to repository successfully!');
          return;
        } catch (e) {
          console.error('Error in saveToRepo:', e);
          set({ 
            error: e instanceof Error ? e.message : 'Failed to save to repository',
            isLoading: false
          });
          toast.error(e instanceof Error ? e.message : 'Failed to save to repository');
        }
      },
      
      getFileContent: async (path: string) => {
        try {
          set({ isLoading: true, error: null });
          const { octokit, repo } = get();
          
          if (!octokit || !repo) {
            throw new Error('Not connected to a repository');
          }
          
          try {
            const { data } = await octokit.rest.repos.getContent({
              owner: repo.owner,
              repo: repo.name,
              path,
            });
            
            set({ isLoading: false });
            
            if (Array.isArray(data)) {
              throw new Error(`Path '${path}' is a directory, not a file`);
            }
            
            // Type guard to check if data has content property
            if (!Array.isArray(data) && 'content' in data && data.type === 'file') {
              // Decode base64 content
              const content = safelyDecodeBase64(data.content);
              return { content, sha: data.sha };
            } else {
              throw new Error(`File at '${path}' does not contain readable content`);
            }
          } catch (e) {
            if (e instanceof Error && e.message.includes('Not Found')) {
              return null; // File doesn't exist
            }
            throw e;
          }
        } catch (e) {
          console.error('Error in getFileContent:', e);
          set({ 
            error: e instanceof Error ? e.message : `Failed to get content from '${path}'`,
            isLoading: false
          });
          toast.error(e instanceof Error ? e.message : `Failed to get content from '${path}'`);
          return null;
        }
      },
      
      getDirectoryContents: async (path: string) => {
        try {
          set({ isLoading: true, error: null });
          const { octokit, repo } = get();
          
          if (!octokit || !repo) {
            throw new Error('Not connected to a repository');
          }
          
          try {
            const { data } = await octokit.rest.repos.getContent({
              owner: repo.owner,
              repo: repo.name,
              path: path === '/' ? '' : path,
            });
            
            set({ isLoading: false });
            
            // If data is not an array, it means we got a file instead of a directory
            if (!Array.isArray(data)) {
              throw new Error(`Path '${path}' is a file, not a directory`);
            }
            
            return data;
          } catch (e) {
            if (e instanceof Error && e.message.includes('Not Found')) {
              // Directory doesn't exist, create it and return empty array
              await get().createFolder(path);
              return []; 
            }
            throw e;
          }
        } catch (e) {
          console.error('Error in getDirectoryContents:', e);
          set({ 
            error: e instanceof Error ? e.message : `Failed to list contents from '${path}'`,
            isLoading: false
          });
          toast.error(e instanceof Error ? e.message : `Failed to list contents from '${path}'`);
          return [];
        }
      },
    }),
    {
      name: 'slync-auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token,
        repo: state.repo
      }),
    }
  )
);
