
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
