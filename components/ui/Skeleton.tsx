
import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div
      className={cn(
        "animate-pulse bg-zinc-800/50 rounded-xl",
        className
      )}
    />
  );
};

export const DashboardSkeleton = () => (
  <div className="space-y-6 max-w-2xl mx-auto">
    <Skeleton className="h-48 w-full rounded-[2rem]" />
    <div className="space-y-4">
      <Skeleton className="h-40 w-full rounded-[2rem]" />
      <Skeleton className="h-40 w-full rounded-[2rem]" />
      <Skeleton className="h-40 w-full rounded-[2rem]" />
    </div>
  </div>
);
