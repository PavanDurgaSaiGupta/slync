
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
  lastSyncTime: Date | null;
  pendingChanges: boolean;
  
  // Actions
  setUser: (user: AuthState['user']) => void;
  setToken: (token: string) => void;
  setRepo: (repo: AuthState['repo']) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  setPendingChanges: (pending: boolean) => void;
  
  // GitHub Actions
  connectRepo: (repoUrl: string) => Promise<void>;
  createFolder: (folderPath: string) => Promise<void>;
  saveToRepo: (path: string, content: string, message: string) => Promise<void>;
  getFileContent: (path: string) => Promise<{ content: string; sha: string } | null>;
  getDirectoryContents: (path: string) => Promise<any[]>;
  syncChanges: () => Promise<void>;
}

// Helper function to safely encode content to base64
const safelyEncodeToBase64 = (str: string): string => {
  try {
    // For browser environments
    return btoa(unescape(encodeURIComponent(str)));
  } catch (e) {
    console.error('Error encoding to base64:', e);
    throw new Error('Failed to encode content to base64');
  }
};

// Helper function to decode base64 content safely
const safelyDecodeBase64 = (base64: string): string => {
  try {
    // For browser environments
    return decodeURIComponent(escape(atob(base64)));
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
      lastSyncTime: null,
      pendingChanges: false,
      
      setUser: (user) => set({ user }),
      setToken: (token) => {
        try {
          // Validate token format (basic check)
          if (!token || token.trim() === '') {
            throw new Error('Invalid token format');
          }
          
          // Create Octokit instance with the token
          const octokit = new Octokit({ auth: token });
          set({ token, octokit, error: null });
          
          // Verify token validity by making a test API call
          octokit.rest.users.getAuthenticated()
            .then((response) => {
              console.log('GitHub token verified successfully');
              
              // Get the user info from GitHub
              const githubUser = response.data;
              
              // Update user info if it doesn't exist
              if (!get().user) {
                set({
                  user: {
                    username: githubUser.login,
                    email: githubUser.email || 'github-user@example.com',
                    avatarUrl: githubUser.avatar_url
                  }
                });
              }
              
              toast.success('GitHub token verified successfully');
            })
            .catch((err) => {
              console.error('Error verifying GitHub token:', err);
              set({ token: null, octokit: null, error: 'Invalid GitHub token. Please check and try again.' });
              toast.error('Invalid GitHub token. Please check and try again.');
            });
        } catch (error) {
          console.error('Error setting GitHub token:', error);
          set({ error: 'Failed to set GitHub token' });
          toast.error('Failed to set GitHub token');
        }
      },
      setRepo: (repo) => set({ repo }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setPendingChanges: (pending) => set({ pendingChanges: pending }),
      
      logout: () => {
        toast.info('Logged out successfully');
        set({ 
          user: null, 
          token: null,
          repo: null,
          octokit: null,
          error: null,
          lastSyncTime: null,
          pendingChanges: false
        });
      },
      
      connectRepo: async (repoUrl: string) => {
        try {
          set({ isLoading: true, error: null });
          const { octokit, token } = get();
          
          if (!token || !octokit) {
            throw new Error('Not authenticated with GitHub. Please provide a valid token first.');
          }
          
          // Parse repo URL to extract owner and name
          // Format: https://github.com/username/repo
          const urlParts = repoUrl.split('/');
          const owner = urlParts[urlParts.length - 2];
          const name = urlParts[urlParts.length - 1].replace('.git', '');
          
          if (!owner || !name) {
            throw new Error('Invalid repository URL format. Expected: https://github.com/username/repo');
          }
          
          console.log(`Attempting to connect to repository: ${owner}/${name}`);
          
          // Verify the repo exists and user has access
          try {
            await octokit.rest.repos.get({
              owner,
              repo: name,
            });
            
            console.log(`Successfully connected to repository: ${owner}/${name}`);
            
            // Set the repo info
            const repoData = {
              owner,
              name,
              url: repoUrl
            };
            
            // Update state with repo info
            set({ 
              repo: repoData,
              isLoading: false,
              error: null
            });
            
            // Save to persistent storage
            console.log('Repository data set to state:', repoData);
            
            console.log('Starting initialization of repository structure...');
            
            // Initialize repository structure with all required folders
            const folders = [
              'bookmarks',
              'todos',
              'notes',
              'config',
              'collections',
              'attachments',
              'bookmarks/default',
              'notes/default',
              'todos/default'
            ];
            
            // Create all folders sequentially
            for (const folder of folders) {
              try {
                await get().createFolder(folder);
                console.log(`Created folder: ${folder}`);
              } catch (folderError) {
                console.warn(`Error creating folder ${folder}:`, folderError);
                // Continue with other folders even if one fails
              }
            }
            
            // Create README files for main sections
            try {
              await get().saveToRepo(
                'README.md',
                '# SLYNC: Personal Productivity Suite\n\nThis repository contains your synced productivity data.\n\n- `/bookmarks` - Your saved web links\n- `/todos` - Task lists and to-dos\n- `/notes` - Markdown notes and documentation\n- `/attachments` - Files attached to notes, todos, or bookmarks\n',
                '[Slync] Initialize repository structure'
              );
              
              await get().saveToRepo(
                'bookmarks/README.md',
                '# SLYNC Bookmarks\n\nThis directory contains your saved bookmarks organized in collections.\n',
                '[Slync] Initialize bookmarks structure'
              );
              
              await get().saveToRepo(
                'notes/README.md',
                '# SLYNC Notes\n\nThis directory contains your notes in Markdown format.\n',
                '[Slync] Initialize notes structure'
              );
              
              await get().saveToRepo(
                'todos/README.md',
                '# SLYNC Todo Lists\n\nThis directory contains your todo lists and tasks.\n',
                '[Slync] Initialize todos structure'
              );
              
              console.log('Created README files for main sections');
            } catch (readmeError) {
              console.warn('Error creating README files:', readmeError);
              // Continue even if README creation fails
            }
            
            toast.success('Repository connected and initialized successfully!');
            
            // Verify repo is properly set in state
            const currentRepo = get().repo;
            if (!currentRepo) {
              set({ error: 'Failed to save repository information' });
              throw new Error('Failed to save repository information');
            }
            
            // Setup auto-sync timer
            setupAutoSync();
            
            return;
            
          } catch (e) {
            console.error('Error connecting to repository:', e);
            set({ 
              repo: null,
              error: 'Repository not found or access denied. Check your token permissions.',
              isLoading: false
            });
            throw new Error('Repository not found or access denied. Check your token permissions.');
          }
        } catch (e) {
          console.error('Error in connectRepo:', e);
          set({ 
            error: e instanceof Error ? e.message : 'Failed to connect to repository',
            isLoading: false
          });
          throw e; // Propagate the error
        }
      },
      
      createFolder: async (folderPath: string) => {
        try {
          const { octokit, repo, token } = get();
          
          if (!token) {
            throw new Error('Not authenticated with GitHub. Please provide a valid token.');
          }
          
          if (!octokit || !repo) {
            throw new Error('Not connected to a repository');
          }
          
          console.log(`Attempting to create folder: ${folderPath}`);
          
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
                set({ pendingChanges: true });
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
          throw e;
        }
      },
      
      saveToRepo: async (path: string, content: string, message: string) => {
        try {
          set({ isLoading: true, error: null });
          const { octokit, repo, token } = get();
          
          if (!token) {
            throw new Error('Not authenticated with GitHub. Please provide a valid token.');
          }
          
          if (!octokit || !repo) {
            throw new Error('Not connected to a repository');
          }
          
          console.log(`Saving to repo: ${path}`);
          console.log(`Repository info: ${repo.owner}/${repo.name}`);
          
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
            console.log(`Creating new file at ${path}`);
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
          
          console.log(`Successfully saved to ${path}`);
          
          set({ 
            isLoading: false,
            pendingChanges: true
          });
          toast.success('Saved to repository successfully!');
          return;
        } catch (e) {
          console.error('Error in saveToRepo:', e);
          set({ 
            error: e instanceof Error ? e.message : 'Failed to save to repository',
            isLoading: false
          });
          throw new Error(e instanceof Error ? e.message : 'Failed to save to repository');
        }
      },
      
      getFileContent: async (path: string) => {
        try {
          set({ isLoading: true, error: null });
          const { octokit, repo, token } = get();
          
          if (!token) {
            throw new Error('Not authenticated with GitHub. Please provide a valid token.');
          }
          
          if (!octokit || !repo) {
            throw new Error('Not connected to a repository');
          }
          
          console.log(`Getting file content: ${path}`);
          console.log(`Repository info: ${repo.owner}/${repo.name}`);
          
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
              console.log(`File not found: ${path}`);
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
          return null;
        }
      },
      
      getDirectoryContents: async (path: string) => {
        try {
          set({ isLoading: true, error: null });
          const { octokit, repo, token } = get();
          
          if (!token) {
            throw new Error('Not authenticated with GitHub. Please provide a valid token.');
          }
          
          if (!octokit || !repo) {
            throw new Error('Not connected to a repository');
          }
          
          console.log(`Getting directory contents: ${path}`);
          console.log(`Repository info: ${repo.owner}/${repo.name}`);
          
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
              console.log(`Directory not found: ${path}, creating it...`);
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
          throw new Error(e instanceof Error ? e.message : `Failed to list contents from '${path}'`);
        }
      },
      
      syncChanges: async () => {
        const { pendingChanges, repo, octokit, token } = get();
        
        if (!pendingChanges || !repo || !octokit || !token) {
          return;
        }
        
        try {
          // In a real implementation, we would sync all pending changes here
          // For now, we'll just update the last sync time
          console.log('Syncing changes to GitHub repository...');
          
          // Mark changes as synced
          set({ 
            pendingChanges: false,
            lastSyncTime: new Date()
          });
          
          toast.success('Changes synced to GitHub successfully!');
        } catch (e) {
          console.error('Error syncing changes:', e);
          toast.error('Failed to sync changes to GitHub');
        }
      }
    }),
    {
      name: 'slync-auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token,
        repo: state.repo,
        lastSyncTime: state.lastSyncTime
      }),
    }
  )
);

// Setup auto-sync timer to push changes to GitHub repository every minute
const setupAutoSync = () => {
  const syncInterval = 60 * 1000; // 1 minute
  
  setInterval(() => {
    const { syncChanges, pendingChanges, repo, token } = useAuthStore.getState();
    
    if (pendingChanges && repo && token) {
      console.log('Auto-syncing changes to GitHub repository...');
      syncChanges();
    }
  }, syncInterval);
};

// Initialize auto-sync if repository is already connected
const initStore = () => {
  const { repo, token, octokit } = useAuthStore.getState();
  
  // If we have a repo and token but no octokit, recreate it
  if (repo && token && !octokit) {
    console.log('Recreating Octokit instance from saved token');
    const newOctokit = new Octokit({ auth: token });
    useAuthStore.setState({ octokit: newOctokit });
    
    // If we have a repository, verify it's still accessible
    if (repo) {
      const verifyRepo = async () => {
        try {
          await newOctokit.rest.repos.get({
            owner: repo.owner,
            repo: repo.name,
          });
          console.log('Repository access verified on init');
        } catch (e) {
          console.error('Error verifying repository access:', e);
          // Clear repo info if we can't access it
          useAuthStore.setState({ 
            repo: null, 
            error: 'Lost access to repository. Please reconnect.' 
          });
          toast.error('Lost access to repository. Please reconnect.');
        }
      };
      
      verifyRepo();
    }
  }
  
  if (repo && token) {
    console.log('Initializing auto-sync for existing repository connection...');
    setupAutoSync();
  }
};

// Call initialization
initStore();
