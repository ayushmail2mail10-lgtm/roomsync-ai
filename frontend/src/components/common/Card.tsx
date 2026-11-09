import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

export interface CardProps extends HTMLMotionProps<'div'> {
  variant?: 'surface' | 'elevated' | 'glass' | 'neon' | 'cyan';
  isInteractive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'surface',
  isInteractive = false,
  padding = 'md',
  children,
  className = '',
  ...props
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  const variantStyles = {
    surface: 'bg-[#111722] border border-[#1E283A] shadow-xl',
    elevated: 'bg-[#161F2E] border border-[#2E3D56]/80 shadow-elevated',
    glass: 'bg-[#111722]/80 backdrop-blur-xl border border-[#1E283A]/90 shadow-glass',
    neon: 'bg-[#111722] border border-[#00F59B]/40 shadow-card-glow',
    cyan: 'bg-[#111722] border border-[#00F0FF]/40 shadow-card-glow-cyan',
  };

  const interactiveStyles = isInteractive
    ? 'card-interactive cursor-pointer hover:border-[#00F59B]/50'
    : '';

  return (
    <motion.div
      whileHover={isInteractive ? { y: -3, transition: { duration: 0.2 } } : undefined}
      className={`rounded-2xl overflow-hidden transition-colors ${variantStyles[variant]} ${paddingStyles[padding]} ${interactiveStyles} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`pb-4 border-b border-[#1E283A]/80 flex flex-col gap-1 ${className}`}>
    {children}
  </div>
);

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h3 className={`text-base font-bold text-[#F5F7FA] tracking-tight ${className}`}>
    {children}
  </h3>
);

export const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <p className={`text-xs text-[#929BAA] leading-relaxed ${className}`}>
    {children}
  </p>
);

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`pt-4 space-y-4 ${className}`}>
    {children}
  </div>
);

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`pt-4 border-t border-[#1E283A]/80 flex items-center justify-between gap-3 ${className}`}>
    {children}
  </div>
);
