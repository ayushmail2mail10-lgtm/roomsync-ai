import React from 'react';
import { motion } from 'motion/react';
import { Button, ButtonProps } from './Button';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: ButtonProps['variant'];
    icon?: React.ReactNode;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`p-8 sm:p-12 text-center rounded-2xl bg-[#111722]/60 border border-[#1E283A] flex flex-col items-center justify-center max-w-lg mx-auto ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-[#161F2E] border border-[#1E283A] text-[#00F59B] flex items-center justify-center mb-4 shadow-neon-green/10 shadow-lg">
        {icon}
      </div>

      <h4 className="text-base font-bold text-[#F5F7FA] tracking-tight mb-1">
        {title}
      </h4>

      <p className="text-xs text-[#929BAA] leading-relaxed max-w-sm mb-6">
        {description}
      </p>

      {action && (
        <Button
          variant={action.variant || 'primary'}
          onClick={action.onClick}
          leftIcon={action.icon}
        >
          {action.label}
        </Button>
      )}
    </motion.div>
  );
};
