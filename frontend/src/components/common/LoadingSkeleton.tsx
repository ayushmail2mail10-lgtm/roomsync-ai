import React from 'react';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
}) => {
  const variantStyles = {
    text: 'h-4 w-full rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
    card: 'h-48 w-full rounded-2xl',
  };

  return (
    <div
      className={`bg-gradient-to-r from-[#111722] via-[#1E283A] to-[#111722] bg-[length:200%_100%] animate-pulse ${variantStyles[variant]} ${className}`}
      aria-hidden="true"
    />
  );
};

export const CardSkeleton: React.FC = () => (
  <div className="p-5 rounded-2xl bg-[#111722] border border-[#1E283A] space-y-4">
    <div className="flex items-center gap-3">
      <Skeleton variant="circular" className="w-12 h-12" />
      <div className="space-y-2 flex-1">
        <Skeleton variant="text" className="w-2/3 h-4" />
        <Skeleton variant="text" className="w-1/3 h-3" />
      </div>
    </div>
    <Skeleton variant="text" className="w-full h-12" />
    <div className="flex gap-2">
      <Skeleton variant="rectangular" className="h-6 w-20" />
      <Skeleton variant="rectangular" className="h-6 w-24" />
    </div>
  </div>
);
