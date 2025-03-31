
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NeonButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  secondary?: boolean;
  className?: string;
  disabled?: boolean;
}

const NeonButton: React.FC<NeonButtonProps> = ({
  children,
  onClick,
  type = "button",
  secondary = false,
  className,
  disabled = false
}) => {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "neon-button px-6 py-3 font-bold",
        secondary ? "border-matrix-secondary/70 text-matrix-secondary" : "",
        disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-105",
        className
      )}
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
    >
      {children}
    </motion.button>
  );
};

export default NeonButton;
