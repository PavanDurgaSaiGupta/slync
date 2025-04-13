
import React from 'react';
import { motion } from 'framer-motion';
import { Code } from 'lucide-react';
import GlitchText from '@/components/GlitchText';
import MatrixRain from '@/components/MatrixRain';
import { ThemeSettings } from '@/hooks/useTheme';

interface AuthLayoutProps {
  children: React.ReactNode;
  theme: ThemeSettings;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, theme }) => {
  return (
    <div className="min-h-screen bg-matrix-background">
      {theme.showCodeRain && <MatrixRain speed={theme.speed} />}
      
      <div className="container mx-auto px-4 h-screen flex flex-col items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <motion.div 
                className="p-4 rounded-full border-2 border-matrix-primary shadow-glow"
                animate={{ boxShadow: ['0 0 10px 2px var(--theme-primary)', '0 0 20px 5px var(--theme-primary)', '0 0 10px 2px var(--theme-primary)'] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Code size={40} className="text-matrix-primary" />
              </motion.div>
            </div>
            <GlitchText text="SLYNC" variant="title" className="mb-2" />
            <p className="text-matrix-primary/70">Sync your data with Supabase</p>
          </div>
          
          <div className="matrix-card">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
