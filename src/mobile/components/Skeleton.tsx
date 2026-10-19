import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = 'h-4 w-full' }) => {
  return (
    <div
      className={`animate-pulse rounded-lg bg-surface-2 ${className}`}
      aria-hidden="true"
    />
  );
};

export const RepoCardSkeleton: React.FC = () => {
  return (
    <div className="bg-surface-1 border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <Skeleton className="h-3.5 w-4/5" />
      <div className="flex items-center gap-4 pt-1">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
};

export const CommitCardSkeleton: React.FC = () => {
  return (
    <div className="bg-surface-1 border border-border rounded-xl p-3.5 flex items-start gap-3">
      <Skeleton className="w-8 h-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-3/4" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
};
