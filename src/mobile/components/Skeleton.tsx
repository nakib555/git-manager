import React from 'react';

interface SkeletonProps {
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

export const FileTreeSkeleton: React.FC = () => {
  return (
    <div className="space-y-1.5 p-3">
      {[
        { indent: 12, width: 'w-24', isDir: true },
        { indent: 28, width: 'w-32', isDir: false },
        { indent: 28, width: 'w-28', isDir: false },
        { indent: 12, width: 'w-36', isDir: true },
        { indent: 28, width: 'w-40', isDir: false },
        { indent: 28, width: 'w-20', isDir: false },
        { indent: 44, width: 'w-32', isDir: false },
        { indent: 12, width: 'w-28', isDir: false },
      ].map((item, idx) => (
        <div
          key={idx}
          style={{ paddingLeft: `${item.indent}px` }}
          className="h-8 flex items-center gap-2"
        >
          <Skeleton className="w-4 h-4 rounded shrink-0" />
          <Skeleton className={`h-3.5 ${item.width}`} />
        </div>
      ))}
    </div>
  );
};

export const CodeViewerSkeleton: React.FC = () => {
  return (
    <div className="p-4 space-y-2 font-mono">
      {[92, 45, 68, 85, 30, 74, 98, 55, 62, 88, 40, 78, 65, 50].map((width, idx) => (
        <div key={idx} className="flex items-center gap-3">
          <Skeleton className="w-6 h-3 rounded shrink-0 opacity-40" />
          <Skeleton
            className="h-3.5 rounded"
            style={{ width: `${width}%` } as React.CSSProperties}
          />
        </div>
      ))}
    </div>
  );
};

export const CommitDetailSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 p-1">
      {/* Changed files list skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-28" />
        <div className="border border-border rounded-xl bg-background divide-y divide-border overflow-hidden">
          {[1, 2].map((i) => (
            <div key={i} className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="w-4 h-4 rounded" />
                <Skeleton className="w-36 h-3.5" />
              </div>
              <Skeleton className="w-16 h-3.5" />
            </div>
          ))}
        </div>
      </div>

      {/* Diff box skeleton */}
      <div className="space-y-2 pt-2">
        <div className="flex justify-between">
          <Skeleton className="w-32 h-3" />
          <Skeleton className="w-16 h-3" />
        </div>
        <div className="rounded-xl border border-border bg-background p-3 space-y-2">
          <Skeleton className="w-full h-3.5" />
          <Skeleton className="w-3/4 h-3.5" />
          <Skeleton className="w-5/6 h-3.5" />
          <Skeleton className="w-2/3 h-3.5" />
        </div>
      </div>
    </div>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Profile header */}
      <div className="flex items-center gap-3">
        <Skeleton className="w-11 h-11 rounded-full shrink-0" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="w-20 h-3" />
          <Skeleton className="w-36 h-4" />
        </div>
      </div>

      {/* 3 Stats cards */}
      <div className="grid grid-cols-3 gap-2.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-surface-1 border border-border rounded-xl p-3 space-y-2">
            <Skeleton className="w-10 h-3" />
            <Skeleton className="w-12 h-6" />
            <Skeleton className="w-14 h-2.5" />
          </div>
        ))}
      </div>

      {/* 2 Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-12 rounded-xl" />
      </div>

      {/* Recent commits list */}
      <div className="space-y-2">
        <Skeleton className="w-28 h-3 mb-2" />
        {[1, 2, 3].map((i) => (
          <CommitCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};
