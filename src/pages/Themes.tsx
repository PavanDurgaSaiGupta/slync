
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Settings, ArrowLeft, Palette, Code, Zap, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

import NeonButton from '@/components/NeonButton';
import GlitchText from '@/components/GlitchText';
import MatrixRain from '@/components/MatrixRain';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { useTheme, ThemeType } from '@/hooks/useTheme';

const Themes = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  
  const [showCodeRain, setShowCodeRain] = useState(theme.showCodeRain);
  const [enableCrtFlicker, setEnableCrtFlicker] = useState(theme.enableCrtFlicker || false);
  const [speed, setSpeed] = useState<ThemeType['speed']>(theme.speed);
  
  const saveSettings = () => {
    setTheme({
      showCodeRain,
      enableCrtFlicker,
      speed
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
              
              <div className="flex flex-wrap gap-4 justify-center">
                <ThemeSwitcher currentTheme={theme.themeNumber} onChange={(themeNumber) => setTheme({ themeNumber })} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-3 md:col-span-1">
                <div className={`border-2 rounded-md p-4 ${theme.themeNumber === 1 ? 'border-matrix-primary shadow-glow' : 'border-matrix-primary/30'}`}>
                  <h3 className="text-matrix-primary font-bold mb-2">Matrix Classic</h3>
                  <p className="text-matrix-primary/70 text-sm">
                    The iconic green on black theme from the original Matrix.
                  </p>
                </div>
              </div>
              
              <div className="col-span-3 md:col-span-1">
                <div className={`border-2 rounded-md p-4 ${theme.themeNumber === 2 ? 'border-matrix-primary shadow-glow' : 'border-matrix-primary/30'}`}>
                  <h3 className="text-matrix-primary font-bold mb-2">Soft Ivory</h3>
                  <p className="text-matrix-primary/70 text-sm">
                    A softer contrast with ivory text on dark background.
                  </p>
                </div>
              </div>
              
              <div className="col-span-3 md:col-span-1">
                <div className={`border-2 rounded-md p-4 ${theme.themeNumber === 3 ? 'border-matrix-primary shadow-glow' : 'border-matrix-primary/30'}`}>
                  <h3 className="text-matrix-primary font-bold mb-2">Amber Alert</h3>
                  <p className="text-matrix-primary/70 text-sm">
                    Warm amber glow reminiscent of vintage terminals.
                  </p>
                </div>
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
              
              <div className={`matrix-card p-4 ${enableCrtFlicker ? 'flicker-effect' : ''}`}>
                <h3 className="text-matrix-primary font-bold mb-2">Preview</h3>
                <p className="text-matrix-primary/70">
                  This card shows how the CRT flicker effect will appear on hover.
                </p>
                <div className="flex justify-center mt-4">
                  <Lightbulb size={32} className="text-matrix-primary" />
                </div>
              </div>
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
