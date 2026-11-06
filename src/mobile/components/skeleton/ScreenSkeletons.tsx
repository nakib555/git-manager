import React from 'react';
import { Skeleton, CommitCardSkeleton } from './BaseSkeleton';

export const FileTreeSkeleton: React.FC = () => {
  return (
    <div className="space-y-1.5 p-3">
      {[
        { indent: 12, width: 'w-24' },
        { indent: 28, width: 'w-32' },
        { indent: 28, width: 'w-28' },
        { indent: 12, width: 'w-36' },
        { indent: 28, width: 'w-40' },
        { indent: 28, width: 'w-20' },
        { indent: 44, width: 'w-32' },
        { indent: 12, width: 'w-28' },
      ].map((item, idx) => (
        <div key={idx} style={{ paddingLeft: `${item.indent}px` }} className="h-8 flex items-center gap-2">
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
          <Skeleton className="h-3.5 rounded" style={{ width: `${width}%` } as React.CSSProperties} />
        </div>
      ))}
    </div>
  );
};

export const CommitDetailSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 p-1">
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
      <div className="flex items-center gap-3">
        <Skeleton className="w-11 h-11 rounded-full shrink-0" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="w-20 h-3" />
          <Skeleton className="w-36 h-4" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-surface-1 border border-border rounded-xl p-3 space-y-2">
            <Skeleton className="w-10 h-3" />
            <Skeleton className="w-12 h-6" />
            <Skeleton className="w-14 h-2.5" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-12 rounded-xl" />
      </div>

      <div className="space-y-2">
        <Skeleton className="w-28 h-3 mb-2" />
        {[1, 2, 3].map((i) => (
          <CommitCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};
