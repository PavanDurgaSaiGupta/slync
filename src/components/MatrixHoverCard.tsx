
import React from 'react';
import { HoverCard, HoverCardTrigger, HoverCardContent } from './ui/hover-card';
import { motion } from 'framer-motion';

interface MatrixHoverCardProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

const MatrixHoverCard: React.FC<MatrixHoverCardProps> = ({ 
  trigger, 
  children, 
  side = "top",
  align = "center" 
}) => {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="matrix-page-effect">
          {trigger}
        </div>
      </HoverCardTrigger>
      <HoverCardContent 
        side={side} 
        align={align}
        className="matrix-glass border border-matrix-primary/30 p-4 z-50"
      >
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default MatrixHoverCard;
