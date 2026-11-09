import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'surface' 
  | 'outline' 
  | 'ghost' 
  | 'warning' 
  | 'danger';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06080D] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 rounded-lg',
    md: 'text-xs font-semibold px-4 py-2.5 gap-2 rounded-xl',
    lg: 'text-sm font-bold px-6 py-3.5 gap-2.5 rounded-2xl',
  };

  const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-[#00F59B] text-[#06080D] font-bold hover:bg-[#05FFA1] shadow-neon-green hover:shadow-[0_0_25px_-2px_rgba(0,245,155,0.5)] focus-visible:ring-[#00F59B]',
    secondary: 'bg-[#00F0FF] text-[#06080D] font-bold hover:bg-[#38F8FF] shadow-neon-cyan hover:shadow-[0_0_25px_-2px_rgba(0,240,255,0.5)] focus-visible:ring-[#00F0FF]',
    surface: 'bg-[#111722] text-[#F5F7FA] border border-[#1E283A] hover:bg-[#161F2E] hover:border-[#00F59B]/50 hover:text-white shadow-sm focus-visible:ring-[#00F59B]',
    outline: 'bg-transparent text-[#F5F7FA] border border-[#1E283A] hover:border-[#00F59B] hover:text-[#00F59B] hover:bg-[#00F59B]/5 focus-visible:ring-[#00F59B]',
    ghost: 'bg-transparent text-[#929BAA] hover:text-[#F5F7FA] hover:bg-[#111722] focus-visible:ring-[#00F59B]',
    warning: 'bg-[#FFD600] text-[#06080D] font-bold hover:bg-[#FFE14D] shadow-neon-yellow hover:shadow-[0_0_25px_-2px_rgba(255,214,0,0.5)] focus-visible:ring-[#FFD600]',
    danger: 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 hover:border-rose-500/50 focus-visible:ring-rose-400',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <motion.button
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.01 }}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
};
