
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Settings, ArrowLeft, Palette, Code, Zap, Lightbulb, Moon, Sun } from 'lucide-react';
import { toast } from 'sonner';

import NeonButton from '@/components/NeonButton';
import GlitchText from '@/components/GlitchText';
import MatrixRain from '@/components/MatrixRain';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import MatrixHoverCard from '@/components/MatrixHoverCard';
import { useTheme, ThemeType } from '@/hooks/useTheme';

const themeDescriptions = [
  {
    name: "Matrix Green",
    description: "The iconic green on black theme from the original Matrix."
  },
  {
    name: "Neo Blue",
    description: "Cool blue tones reminiscent of the digital world."
  },
  {
    name: "Cyber Pink",
    description: "Vibrant pink for a cyberpunk aesthetic."
  },
  {
    name: "Amber Gold",
    description: "Warm amber glow reminiscent of vintage terminals."
  },
  {
    name: "Purple Neon",
    description: "Rich purple hues for a futuristic feel."
  }
];

const Themes = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  
  const [showCodeRain, setShowCodeRain] = useState(theme.showCodeRain);
  const [enableCrtFlicker, setEnableCrtFlicker] = useState(theme.enableCrtFlicker || false);
  const [speed, setSpeed] = useState<ThemeType['speed']>(theme.speed);
  const [isDark, setIsDark] = useState(theme.isDark);
  
  const saveSettings = () => {
    setTheme({
      showCodeRain,
      enableCrtFlicker,
      speed,
      isDark
    });
    
    toast.success('Theme settings saved');
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };
  
  return (
    <div className="min-h-screen bg-matrix-background p-4">
      {showCodeRain && <MatrixRain speed={speed} />}
      
      <div className="container mx-auto max-w-4xl py-8">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 flex items-center text-matrix-primary hover:text-matrix-primary/70"
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Home
        </motion.button>
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div className="flex items-center">
            <Settings size={24} className="text-matrix-primary mr-3" />
            <GlitchText text="Themes & Settings" variant="title" />
          </div>
        </motion.div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          <motion.div variants={itemVariants} className="matrix-card">
            <h2 className="flex items-center text-xl text-matrix-primary font-bold mb-6">
              <Palette size={20} className="mr-2" />
              Color Themes
            </h2>
            
            <div className="mb-8">
              <p className="text-matrix-primary/70 mb-4">
                Select your preferred color theme for the Matrix Synapse Terminal interface:
              </p>
              
              <div className="flex justify-center mb-6">
                <ThemeSwitcher currentTheme={theme.themeNumber} onChange={(themeNumber) => setTheme({ themeNumber })} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {themeDescriptions.map((desc, index) => (
                  <div key={index} className={`col-span-1 border-2 rounded-md p-4 ${theme.themeNumber === index + 1 ? 'border-matrix-primary shadow-glow' : 'border-matrix-primary/30'}`}>
                    <h3 className="text-matrix-primary font-bold mb-2">{desc.name}</h3>
                    <p className="text-matrix-primary/70 text-sm">
                      {desc.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <h3 className="text-matrix-primary font-bold">Dark/Light Mode</h3>
              <div className="flex items-center space-x-2">
                <Sun size={16} className={`${!isDark ? 'text-matrix-primary' : 'text-matrix-primary/40'}`} />
                <div 
                  className={`w-12 h-6 rounded-full p-1 cursor-pointer ${isDark ? 'bg-matrix-primary' : 'bg-matrix-primary/30'}`}
                  onClick={() => setIsDark(!isDark)}
                >
                  <div 
                    className={`w-4 h-4 rounded-full transition-all ${isDark ? 'bg-black ml-6' : 'bg-matrix-primary/80 ml-0'}`}
                  />
                </div>
                <Moon size={16} className={`${isDark ? 'text-matrix-primary' : 'text-matrix-primary/40'}`} />
              </div>
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="matrix-card">
            <h2 className="flex items-center text-xl text-matrix-primary font-bold mb-6">
              <Code size={20} className="mr-2" />
              Matrix Rain Settings
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-matrix-primary font-bold mb-3">Background Animation</h3>
                
                <div className="flex items-center mb-6">
                  <div 
                    className={`w-12 h-6 rounded-full p-1 cursor-pointer ${showCodeRain ? 'bg-matrix-primary' : 'bg-matrix-primary/30'}`}
                    onClick={() => setShowCodeRain(!showCodeRain)}
                  >
                    <div 
                      className={`w-4 h-4 rounded-full transition-all ${showCodeRain ? 'bg-black ml-6' : 'bg-matrix-primary/80 ml-0'}`}
                    />
                  </div>
                  <span className="ml-3 text-matrix-primary/80">
                    {showCodeRain ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                
                <p className="text-matrix-primary/70 text-sm">
                  Toggle the falling code animation in the background. Disabling may improve performance on slower devices.
                </p>
              </div>
              
              <div>
                <h3 className="text-matrix-primary font-bold mb-3">Code Rain Speed</h3>
                
                <div className="flex items-center justify-between mb-6">
                  <button
                    className={`px-4 py-2 rounded-md ${speed === 'slow' ? 'bg-matrix-primary text-black' : 'bg-matrix-primary/20 text-matrix-primary'}`}
                    onClick={() => setSpeed('slow')}
                  >
                    Slow
                  </button>
                  
                  <button
                    className={`px-4 py-2 rounded-md ${speed === 'normal' ? 'bg-matrix-primary text-black' : 'bg-matrix-primary/20 text-matrix-primary'}`}
                    onClick={() => setSpeed('normal')}
                  >
                    Normal
                  </button>
                  
                  <button
                    className={`px-4 py-2 rounded-md ${speed === 'fast' ? 'bg-matrix-primary text-black' : 'bg-matrix-primary/20 text-matrix-primary'}`}
                    onClick={() => setSpeed('fast')}
                  >
                    Fast
                  </button>
                </div>
                
                <p className="text-matrix-primary/70 text-sm">
                  Adjust the speed of the falling code animation to your preference.
                </p>
              </div>
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="matrix-card">
            <h2 className="flex items-center text-xl text-matrix-primary font-bold mb-6">
              <Zap size={20} className="mr-2" />
              Visual Effects
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-matrix-primary font-bold mb-3">CRT Flicker Effect</h3>
                
                <div className="flex items-center mb-6">
                  <div 
                    className={`w-12 h-6 rounded-full p-1 cursor-pointer ${enableCrtFlicker ? 'bg-matrix-primary' : 'bg-matrix-primary/30'}`}
                    onClick={() => setEnableCrtFlicker(!enableCrtFlicker)}
                  >
                    <div 
                      className={`w-4 h-4 rounded-full transition-all ${enableCrtFlicker ? 'bg-black ml-6' : 'bg-matrix-primary/80 ml-0'}`}
                    />
                  </div>
                  <span className="ml-3 text-matrix-primary/80">
                    {enableCrtFlicker ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                
                <p className="text-matrix-primary/70 text-sm">
                  Toggle the CRT flicker effect on UI elements. May cause issues for people sensitive to flickering.
                </p>
              </div>
              
              <MatrixHoverCard
                trigger={
                  <div className={`matrix-card p-4 cursor-pointer ${enableCrtFlicker ? 'flicker-effect' : ''}`}>
                    <h3 className="text-matrix-primary font-bold mb-2">Hover for Preview</h3>
                    <p className="text-matrix-primary/70">
                      This card shows how the CRT flicker effect will appear.
                    </p>
                    <div className="flex justify-center mt-4">
                      <Lightbulb size={32} className="text-matrix-primary" />
                    </div>
                  </div>
                }
              >
                <div className="p-2">
                  <h4 className="text-matrix-primary font-bold mb-1">CRT Effect</h4>
                  <p className="text-matrix-primary/70 text-sm">
                    Creates a nostalgic retro terminal feel with subtle screen flicker
                  </p>
                </div>
              </MatrixHoverCard>
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="flex justify-center">
            <NeonButton onClick={saveSettings}>
              Save Settings
            </NeonButton>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Themes;
