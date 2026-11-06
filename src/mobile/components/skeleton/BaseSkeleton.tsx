import React from 'react';

export interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = 'h-4 w-full', style }) => {
  return (
    <div
      className={`ghost-shimmer rounded-lg bg-surface-2 ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
};

export const RepoCardSkeleton: React.FC = () => {
  return (
    <div className="bg-surface-1 border border-border/80 rounded-2xl p-4 space-y-3 ghost-shimmer shadow-xs">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <Skeleton className="h-3.5 w-4/5" />
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <Skeleton className="h-3 w-20" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-3 w-14" />
        </div>
      </div>
    </div>
  );
};

export const CommitCardSkeleton: React.FC = () => {
  return (
    <div className="bg-surface-1 border border-border rounded-xl p-3.5 flex items-start gap-3 ghost-shimmer">
      <Skeleton className="w-8 h-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-3/4" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="w-14 h-6 rounded-md shrink-0" />
    </div>
  );
};
