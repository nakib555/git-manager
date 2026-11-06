import React from 'react';
import { TrendingUp } from 'lucide-react';

interface DashboardVelocityCardProps {
  velocityData: { day: string; count: number }[];
  maxVelocity: number;
}

export const DashboardVelocityCard: React.FC<DashboardVelocityCardProps> = ({
  velocityData,
  maxVelocity,
}) => {
  return (
    <div className="bg-surface-1 border border-border rounded-xl p-4 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp size={15} className="text-accent" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
            7-Day Commit Velocity
          </h3>
        </div>
        <span className="text-[11px] font-mono text-emerald-500 font-semibold">
          +18% this week
        </span>
      </div>

      <div className="pt-2">
        <div className="flex items-end justify-between gap-2 h-20 px-1">
          {velocityData.map((item, i) => {
            const heightPct = Math.max(15, Math.round((item.count / maxVelocity) * 100));
            const isToday = i === velocityData.length - 1;
            return (
              <div key={item.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <span className="text-[9px] font-mono text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
                  {item.count}
                </span>
                <div className="w-full max-w-[28px] bg-surface-2 rounded-t-md overflow-hidden flex items-end h-full">
                  <div 
                    className={`w-full rounded-t-md transition-all duration-300 ${
                      isToday 
                        ? 'bg-text-primary' 
                        : 'bg-surface-3 group-hover:bg-accent/60'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
                <span className={`text-[10px] font-mono ${isToday ? 'font-bold text-text-primary' : 'text-text-tertiary'}`}>
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
