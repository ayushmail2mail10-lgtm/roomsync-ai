import React from 'react';
import { motion } from 'motion/react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'warning' | 'white';
  label?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  label,
  className = ''
}) => {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  const colorMap = {
    primary: 'border-[#00F59B] border-t-transparent shadow-neon-green/20',
    secondary: 'border-[#00F0FF] border-t-transparent shadow-neon-cyan/20',
    warning: 'border-[#FFD600] border-t-transparent shadow-neon-yellow/20',
    white: 'border-[#F5F7FA] border-t-transparent',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 p-4 ${className}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
        className={`rounded-full ${sizeMap[size]} ${colorMap[color]}`}
        role="status"
        aria-label="Loading"
      />
      {label && (
        <p className="text-xs font-mono text-[#929BAA] tracking-wider animate-pulse">
          {label}
        </p>
      )}
    </div>
  );
};
