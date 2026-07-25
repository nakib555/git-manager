import React from 'react';

export const SkeletonDetails: React.FC<{ screen: string }> = ({ screen }) => {
  if (screen === 'files') {
    return (
      <div className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col h-[60vh] animate-pulse">
        {/* Breadcrumb Skeleton */}
        <div className="px-4 py-4 border-b border-border flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-border/60"></div>
          <div className="w-2 bg-border/40 h-3 rounded"></div>
          <div className="w-20 bg-border/60 h-3.5 rounded"></div>
          <div className="w-2 bg-border/40 h-3 rounded"></div>
          <div className="w-24 bg-border/45 h-3.5 rounded"></div>
        </div>
        {/* Pills Skeleton */}
        <div className="flex p-3 gap-2 border-b border-border bg-hover/10 overflow-x-auto no-scrollbar">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="px-4 py-2.5 rounded-full bg-border/50 border border-border/20 w-24 h-7 shrink-0"></div>
          ))}
        </div>
        {/* Code Content Area Skeleton */}
        <div className="flex-1 p-5 bg-hover/5 flex flex-col gap-3 font-mono">
          <div className="flex gap-4">
            <div className="w-4 bg-border/30 h-3 rounded text-right">1</div>
            <div className="w-[80%] bg-border/50 h-3 rounded"></div>
          </div>
          <div className="flex gap-4">
            <div className="w-4 bg-border/30 h-3 rounded text-right">2</div>
            <div className="w-[50%] bg-border/50 h-3 rounded"></div>
          </div>
          <div className="flex gap-4">
            <div className="w-4 bg-border/30 h-3 rounded text-right">3</div>
            <div className="w-[60%] bg-border/50 h-3 rounded"></div>
          </div>
          <div className="flex gap-4">
            <div className="w-4 bg-border/30 h-3 rounded text-right">4</div>
            <div className="w-[30%] bg-border/50 h-3 rounded"></div>
          </div>
          <div className="flex gap-4">
            <div className="w-4 bg-border/30 h-3 rounded text-right">5</div>
            <div className="w-[75%] bg-border/50 h-3 rounded"></div>
          </div>
          <div className="flex gap-4">
            <div className="w-4 bg-border/30 h-3 rounded text-right">6</div>
            <div className="w-[40%] bg-border/50 h-3 rounded"></div>
          </div>
          <div className="flex gap-4">
            <div className="w-4 bg-border/30 h-3 rounded text-right">7</div>
            <div className="w-[55%] bg-border/50 h-3 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'commits') {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        {/* Staging Button Card Skeleton */}
        <div className="flex justify-between items-center bg-card border border-border rounded-xl p-3.5">
          <div className="w-32 bg-border/50 h-3.5 rounded"></div>
          <div className="w-28 bg-border/60 h-8 rounded-xl"></div>
        </div>

        {/* Timeline Commits Skeleton */}
        <div className="pl-5 border-l-2 border-border/60 relative flex flex-col gap-7 pt-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="relative">
              {/* Timeline circle marker */}
              <div className="absolute -left-[27px] top-1.5 w-3 h-3 bg-main border-2 border-border/70 rounded-full z-10"></div>
              
              {/* Commit Hash badge skeleton */}
              <div className="w-20 bg-border/40 border border-border/20 h-6 rounded-lg mb-2"></div>
              
              {/* Commit Message skeleton */}
              <div className="w-[70%] bg-border/60 h-4 rounded mb-2.5"></div>
              
              {/* Commit Author and Meta skeleton */}
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-border/60"></div>
                  <div className="w-24 bg-border/50 h-3 rounded"></div>
                  <div className="w-12 bg-border/30 h-3 rounded"></div>
                </div>
                <div className="w-16 bg-border/60 h-3 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (screen === 'branches') {
    return (
      <div className="animate-pulse flex flex-col gap-4">
        {/* Search Bar Skeleton */}
        <div className="bg-card rounded-xl p-3.5 h-11 border border-border flex items-center gap-3">
          <div className="w-5 h-5 bg-border/50 rounded"></div>
          <div className="w-32 bg-border/40 h-3 rounded"></div>
        </div>
        {/* Branch main Card Skeleton */}
        <div className="flex justify-between items-center bg-card border border-border rounded-xl p-3.5">
          <div className="w-28 bg-border/50 h-3.5 rounded"></div>
          <div className="w-24 bg-border/60 h-8 rounded-xl"></div>
        </div>
        {/* Branch lists Skeleton */}
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-2 bg-card p-4 rounded-2xl border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-border/50 rounded"></div>
                  <div className="w-24 bg-border/60 h-3.5 rounded"></div>
                </div>
                {i === 1 && <div className="w-14 bg-border/40 h-5 rounded-full"></div>}
              </div>
              <div className="w-32 bg-border/40 h-3 rounded mt-0.5"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (screen === 'prs') {
    return (
      <div className="animate-pulse flex flex-col gap-4">
        {/* Tabs Skeleton */}
        <div className="flex border-b border-border gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="py-3.5 flex items-center gap-1.5 border-b-2 border-transparent w-20">
              <div className="w-10 bg-border/60 h-4 rounded"></div>
              <div className="w-6 bg-border/40 h-4.5 rounded-full"></div>
            </div>
          ))}
        </div>
        {/* Merge Button Card Skeleton */}
        <div className="flex justify-between items-center bg-card border border-border rounded-xl p-3.5">
          <div className="w-36 bg-border/50 h-3.5 rounded"></div>
          <div className="w-24 bg-border/60 h-8 rounded-xl"></div>
        </div>
        {/* PR List Skeleton */}
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-4 p-4 border border-border rounded-2xl bg-card">
              <div className="w-5 h-5 bg-border/50 rounded-full shrink-0 mt-0.5"></div>
              <div className="flex-1 flex flex-col gap-2">
                <div className="w-[75%] bg-border/60 h-4 rounded"></div>
                <div className="w-36 bg-border/40 h-3 rounded"></div>
                <div className="flex justify-between items-center mt-2">
                  <div className="w-5 h-5 rounded-full bg-border/50"></div>
                  <div className="w-14 bg-border/40 h-5 rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (screen === 'insights') {
    return (
      <div className="animate-pulse flex flex-col gap-4">
        {/* 3 Metric cards grid skeleton */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card rounded-2xl p-4 border border-border flex flex-col items-center text-center gap-1.5">
              <div className="w-10 bg-border/40 h-2.5 rounded"></div>
              <div className="w-8 bg-border/60 h-5 rounded mt-1"></div>
            </div>
          ))}
        </div>

        {/* Chart Card Skeleton */}
        <div className="bg-card rounded-2xl p-4 border border-border flex flex-col gap-3">
          <div className="w-24 bg-border/50 h-3 rounded"></div>
          <div className="h-[120px] bg-border/10 rounded-xl flex items-end p-2 gap-2">
            {[20, 45, 30, 80, 50, 65, 40, 90, 35, 75, 50, 60].map((h, i) => (
              <div 
                key={i} 
                className="flex-1 bg-border/25 rounded-t animate-pulse"
                style={{ height: `${h}%`, animationDelay: `${i * 75}ms` }}
              ></div>
            ))}
          </div>
        </div>

        {/* Languages breakdown skeleton */}
        <div className="bg-card rounded-2xl p-4 border border-border flex flex-col gap-3">
          <div className="w-20 bg-border/50 h-3 rounded mb-1"></div>
          <div className="flex items-center justify-between">
            {/* Donut skeleton */}
            <div className="w-[92px] h-[92px] rounded-full border-[14px] border-border/25 flex items-center justify-center shrink-0"></div>
            {/* Legend list skeleton */}
            <div className="flex-1 flex flex-col gap-2.5 max-w-[50%] mt-1 ml-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-border/50"></div>
                    <div className="w-14 bg-border/60 h-3 rounded"></div>
                  </div>
                  <div className="w-8 bg-border/40 h-3 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
