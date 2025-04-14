
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import GitHubSetup from '@/pages/GitHubSetup';
import Notes from '@/pages/Notes';
import Todos from '@/pages/Todos';
import Bookmarks from '@/pages/Bookmarks';
import HowToUse from '@/pages/HowToUse';
import NotFound from '@/pages/NotFound';
import Themes from '@/pages/Themes';
import ImportExport from '@/pages/ImportExport';
import GitCommands from '@/pages/GitCommands';

import { ThemeProvider } from '@/hooks/useTheme';
import { AuthProvider } from '@/contexts/AuthContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Toaster richColors position="top-right" />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/github-setup" element={<GitHubSetup />} />
            <Route path="/notes/*" element={<Notes />} />
            <Route path="/todos/*" element={<Todos />} />
            <Route path="/bookmarks/*" element={<Bookmarks />} />
            <Route path="/how-to-use" element={<HowToUse />} />
            <Route path="/themes" element={<Themes />} />
            <Route path="/import-export" element={<ImportExport />} />
            <Route path="/git-commands" element={<GitCommands />} />
            {/* Add redirect from the old authentication page to the new auth page */}
            <Route path="/authentication" element={<Navigate to="/auth" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
