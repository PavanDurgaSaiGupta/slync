
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlitchTextProps {
  text: string;
  className?: string;
  variant?: 'title' | 'subtitle' | 'body';
}

const GlitchText: React.FC<GlitchTextProps> = ({ 
  text,
  className,
  variant = 'body'
}) => {
  const baseClasses = {
    title: "text-4xl md:text-5xl lg:text-6xl font-bold",
    subtitle: "text-xl md:text-2xl lg:text-3xl",
    body: "text-base"
  };

  // Animation for blinking elements
  const blink = {
    hidden: { opacity: 0.3 },
    visible: { opacity: 1 }
  };
  
  return (
    <motion.h1
      className={cn("neon-text relative inline-block", baseClasses[variant], className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {text}
      <motion.span
        className="absolute top-0 left-0 w-full h-full text-matrix-primary opacity-70"
        initial="hidden"
        animate="visible"
        variants={blink}
        transition={{ 
          repeat: Infinity, 
          repeatType: "reverse", 
          duration: 0.05,
          repeatDelay: Math.random() * 5 + 3
        }}
      >
        {text}
      </motion.span>
    </motion.h1>
  );
};

export default GlitchText;
