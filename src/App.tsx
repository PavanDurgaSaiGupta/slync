
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";

// Pages
import Index from "./pages/Index";
import Authentication from "./pages/Authentication";
import HowToUse from "./pages/HowToUse";
import Bookmarks from "./pages/Bookmarks";
import Todos from "./pages/Todos";
import Notes from "./pages/Notes";
import Themes from "./pages/Themes";
import ImportExport from "./pages/ImportExport";
import GitCommands from "./pages/GitCommands";
import NotFound from "./pages/NotFound";

const App = () => {
  // Create a new QueryClient instance
  const queryClient = new QueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/authentication" element={<Authentication />} />
              <Route path="/how-to-use" element={<HowToUse />} />
              <Route path="/bookmarks" element={<Bookmarks />} />
              <Route path="/todos" element={<Todos />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/themes" element={<Themes />} />
              <Route path="/import-export" element={<ImportExport />} />
              <Route path="/git-terminal" element={<GitCommands />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
