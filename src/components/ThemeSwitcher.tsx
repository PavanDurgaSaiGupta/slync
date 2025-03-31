
import React from 'react';
import { motion } from 'framer-motion';
import { Palette } from 'lucide-react';

interface ThemeSwitcherProps {
  currentTheme: number;
  onChange: (themeNumber: number) => void;
}

const themeColors = [
  { primary: '#00FF44', secondary: '#0D7377' }, // Matrix default
  { primary: '#EFE9E0', secondary: '#0F9E99' }, // Soft Ivory & Tropical Teal
  { primary: '#FBA002', secondary: '#313B2F' }, // Bright Orange & Deep Olive Green
  { primary: '#8B5CF6', secondary: '#C4B5FD' }, // Purple vibes
  { primary: '#F97316', secondary: '#FDBA74' }, // Warm orange
  { primary: '#0EA5E9', secondary: '#BAE6FD' }, // Ocean blue
  { primary: '#10B981', secondary: '#A7F3D0' }, // Fresh green
  { primary: '#EC4899', secondary: '#FBCFE8' }, // Pink delight
  { primary: '#F43F5E', secondary: '#FECDD3' }, // Energetic red
  { primary: '#06B6D4', secondary: '#99F6E4' }, // Turquoise
  { primary: '#FBBF24', secondary: '#FDE68A' }, // Sunny yellow
  { primary: '#8B5CF6', secondary: '#DDD6FE' }, // Lavender
  { primary: '#14B8A6', secondary: '#5EEAD4' }, // Teal
  { primary: '#9333EA', secondary: '#D8B4FE' }, // Royal purple
];

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ currentTheme, onChange }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="matrix-glass p-3 rounded-full fixed top-4 right-4 z-50 flex items-center"
    >
      <Palette size={18} className="mr-2 text-matrix-primary" />
      
      <div className="flex space-x-1 overflow-x-auto max-w-[180px] p-1">
        {themeColors.map((theme, index) => (
          <motion.div
            key={index}
            className={`h-5 w-5 rounded-full cursor-pointer flex items-center justify-center ${currentTheme === index + 1 ? 'ring-2 ring-white' : ''}`}
            style={{ background: theme.primary }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange(index + 1)}
          >
            <div 
              className="h-2 w-2 rounded-full" 
              style={{ background: theme.secondary }}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ThemeSwitcher;
