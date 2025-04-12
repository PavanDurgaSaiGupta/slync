import React from 'react';
import { motion } from 'framer-motion';
import { Palette } from 'lucide-react';

interface ThemeSwitcherProps {
  currentTheme: number;
  onChange: (themeNumber: number) => void;
}

const themeColors = [
  { primary: '#0CFC5C', secondary: '#0D7377', name: 'Matrix Green' }, // Matrix default
  { primary: '#5D80FE', secondary: '#1D3057', name: 'Neo Blue' }, // Neo Blue
  { primary: '#FF71C5', secondary: '#8C4573', name: 'Cyber Pink' }, // Cyber Pink
  { primary: '#ECDB54', secondary: '#8C7A28', name: 'Amber Gold' }, // Amber Gold
  { primary: '#9B87F5', secondary: '#433A68', name: 'Purple Neon' }, // Purple Neon
];

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ currentTheme, onChange }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="matrix-glass p-3 rounded-full fixed top-4 right-4 z-50 flex items-center"
    >
      <Palette size={18} className="mr-2 text-matrix-primary" />
      
      <div className="flex space-x-2 p-1">
        {themeColors.map((theme, index) => (
          <motion.div
            key={index}
            className="relative group"
          >
            <motion.div
              className={`h-6 w-6 rounded-full cursor-pointer flex items-center justify-center ${currentTheme === index + 1 ? 'ring-2 ring-white' : ''}`}
              style={{ background: theme.primary }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onChange(index + 1)}
            >
              <div 
                className="h-3 w-3 rounded-full" 
                style={{ background: theme.secondary }}
              />
            </motion.div>
            <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {theme.name}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ThemeSwitcher;
