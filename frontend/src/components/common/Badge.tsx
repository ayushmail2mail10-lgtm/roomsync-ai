import React from 'react';
import { ShieldCheck, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export type BadgeVariant = 
  | 'green' 
  | 'cyan' 
  | 'yellow' 
  | 'warning'
  | 'neutral' 
  | 'verified'
  | 'danger'
  | 'outline';

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  children: React.ReactNode;
  icon?: 'shield' | 'sparkles' | 'check' | 'alert';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  children,
  icon,
  className = ''
}) => {
  const styles: Record<BadgeVariant, string> = {
    green: 'bg-[#00F59B]/10 text-[#00F59B] border-[#00F59B]/30',
    cyan: 'bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/30',
    yellow: 'bg-[#FFD600]/10 text-[#FFD600] border-[#FFD600]/30',
    warning: 'bg-[#FFD600]/10 text-[#FFD600] border-[#FFD600]/30',
    neutral: 'bg-[#161F2E] text-[#929BAA] border-[#1E283A] hover:text-[#F5F7FA]',
    verified: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    outline: 'bg-transparent text-[#929BAA] border-[#1E283A]',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.2 gap-1 rounded-md font-mono',
    md: 'text-xs px-2.5 py-0.5 gap-1.5 rounded-full font-medium',
  };

  return (
    <span className={`inline-flex items-center border select-none transition-colors ${styles[variant]} ${sizeStyles[size]} ${className}`}>
      {icon === 'shield' && <ShieldCheck className="w-3.5 h-3.5 text-[#00F59B] flex-shrink-0" />}
      {icon === 'sparkles' && <Sparkles className="w-3.5 h-3.5 text-[#00F0FF] flex-shrink-0" />}
      {icon === 'check' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
      {icon === 'alert' && <AlertCircle className="w-3.5 h-3.5 text-[#FFD600] flex-shrink-0" />}
      <span>{children}</span>
    </span>
  );
};
