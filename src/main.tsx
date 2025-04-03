
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Set document title to SLYNC
document.title = "SLYNC";

createRoot(document.getElementById("root")!).render(<App />);
