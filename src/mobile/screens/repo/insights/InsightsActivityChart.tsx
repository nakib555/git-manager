import React from 'react';
import { TrendingUp, GitCommit } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { EmptyState } from '../../../components/EmptyState';
import { GitCommitNode } from '../../../../types';

interface InsightsActivityChartProps {
  activeCommits: GitCommitNode[];
}

export const InsightsActivityChart: React.FC<InsightsActivityChartProps> = ({ activeCommits }) => {
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];
  activeCommits.forEach(c => {
    const d = new Date(c.timestamp || (c as any).date);
    if (!isNaN(d.getTime())) dayCounts[d.getDay()]++;
  });

  const chartData = [
    { name: 'Mon', commits: dayCounts[1] },
    { name: 'Tue', commits: dayCounts[2] },
    { name: 'Wed', commits: dayCounts[3] },
    { name: 'Thu', commits: dayCounts[4] },
    { name: 'Fri', commits: dayCounts[5] },
    { name: 'Sat', commits: dayCounts[6] },
    { name: 'Sun', commits: dayCounts[0] },
  ];

  return (
    <div className="bg-surface-1 border border-border rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp size={15} className="text-accent" />
          <span className="text-xs font-semibold text-text-primary">Commit Activity by Day</span>
        </div>
        <span className="text-xs font-mono text-accent font-bold tabular-nums">
          {activeCommits.length} commits analyzed
        </span>
      </div>

      {activeCommits.length === 0 ? (
        <EmptyState
          icon={GitCommit}
          title="No commit activity recorded"
          description="Create commits on this branch to visualize day-of-week velocity."
          compact
        />
      ) : (
        <div className="h-36 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="mobileVelocity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="var(--color-text-tertiary)" fontSize={10} tickLine={false} />
              <YAxis stroke="var(--color-text-tertiary)" fontSize={10} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-surface-1)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: 'var(--color-text-primary)',
                }}
              />
              <Area
                type="monotone"
                dataKey="commits"
                stroke="var(--color-accent)"
                strokeWidth={2}
                fill="url(#mobileVelocity)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
