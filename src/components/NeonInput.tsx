
import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface NeonInputProps {
  type: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  className?: string;
  required?: boolean;
  icon?: React.ReactNode;
  id?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const NeonInput: React.FC<NeonInputProps> = ({
  type,
  placeholder,
  value,
  onChange,
  name,
  className,
  required = false,
  icon,
  id,
  onKeyDown
}) => {
  return (
    <motion.div 
      className="relative"
      whileHover={{ scale: 1.02 }}
    >
      {icon && (
        <div className="absolute left-3 top-3 text-matrix-primary opacity-80">
          {icon}
        </div>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        name={name}
        id={id}
        onKeyDown={onKeyDown}
        required={required}
        className={cn(
          "neon-border bg-matrix-background/60 text-matrix-primary px-4 py-3 rounded-md outline-none focus:shadow-glow w-full",
          icon ? "pl-10" : "",
          className
        )}
      />
    </motion.div>
  );
};

export default NeonInput;
