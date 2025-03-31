
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Octokit } from 'octokit';

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
}

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
      
      logout: () => set({ 
        user: null, 
        token: null,
        repo: null,
        octokit: null,
        error: null 
      }),
      
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
            
          } catch (e) {
            console.error('Error connecting to repository:', e);
            set({ 
              error: 'Repository not found or access denied',
              isLoading: false
            });
          }
        } catch (e) {
          console.error('Error in connectRepo:', e);
          set({ 
            error: e instanceof Error ? e.message : 'Failed to connect to repository',
            isLoading: false
          });
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
                  message: `[Matrix-App] Initialize ${folderPath} folder`,
                  content: Buffer.from(' ').toString('base64'),
                });
                console.log(`Created folder '${folderPath}'`);
              } catch (createErr) {
                console.error(`Error creating folder '${folderPath}':`, createErr);
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
            
            // If data is an array, it means we got a directory instead of a file
            if (!Array.isArray(data)) {
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
            content: Buffer.from(content).toString('base64'),
            sha, // Include SHA if updating an existing file
          });
          
          set({ isLoading: false });
          return;
        } catch (e) {
          console.error('Error in saveToRepo:', e);
          set({ 
            error: e instanceof Error ? e.message : 'Failed to save to repository',
            isLoading: false
          });
        }
      },
    }),
    {
      name: 'matrix-auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token,
        repo: state.repo
      }),
    }
  )
);
