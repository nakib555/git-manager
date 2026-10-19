import React from 'react';
import { useAppContext } from '../../../AppContext';
import { BarChart2, TrendingUp, Code2, GitCommit } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const InsightsScreen: React.FC = () => {
  const { currentRepo, activeCommits, activeFiles } = useAppContext();

  // Real Day-of-Week commit velocity calculated from actual repository commits
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];
  activeCommits.forEach(c => {
    const d = new Date(c.timestamp || c.date);
    if (!isNaN(d.getTime())) {
      dayCounts[d.getDay()]++;
    }
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

  // Language composition calculation from actual active file tree
  const langCounts: Record<string, number> = {};
  activeFiles.forEach(f => {
    const ext = f.name.split('.').pop()?.toUpperCase() || 'OTHER';
    langCounts[ext] = (langCounts[ext] || 0) + 1;
  });

  const totalFiles = Math.max(1, activeFiles.length);
  const sortedLangs = Object.entries(langCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div className="px-4 py-4 space-y-6">
      <div>
        <h2 className="text-base font-semibold text-text-primary tracking-tight">Insights</h2>
        <p className="text-xs text-text-tertiary mt-0.5">
          Activity analytics and code composition for {currentRepo}
        </p>
      </div>

      {/* Commit Activity Chart - Pure Slate + Steel Blue (No purple gradients) */}
      <div className="bg-surface-1 border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={15} className="text-accent" />
            <span className="text-xs font-semibold text-text-primary">Commit Activity by Day</span>
          </div>
          <span className="text-xs font-mono text-accent font-bold tabular-nums">
            {activeCommits.length} commits analyzed
          </span>
        </div>

        <div className="h-36 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="mobileVelocity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="var(--color-text-tertiary)" fontSize={10} tickLine={false} />
              <YAxis stroke="var(--color-text-tertiary)" fontSize={10} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-surface-1)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '10px',
                  fontSize: '11px',
                  color: 'var(--color-text-primary)',
                }}
              />
              <Area
                type="monotone"
                dataKey="commits"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="url(#mobileVelocity)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Language Breakdown */}
      <div className="bg-surface-1 border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 size={15} className="text-accent" />
            <span className="text-xs font-semibold text-text-primary">File Type Composition</span>
          </div>
          <span className="text-xs font-mono text-text-tertiary tabular-nums">
            {activeFiles.length} files tracked
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full bg-surface-2 rounded-full overflow-hidden flex">
          {sortedLangs.map(([lang, count], idx) => {
            const colors = ['#3B82F6', '#3FB950', '#D29922', '#71717A'];
            const pct = Math.round((count / totalFiles) * 100);
            return (
              <div
                key={lang}
                style={{
                  width: `${pct}%`,
                  backgroundColor: colors[idx % colors.length],
                }}
                className="h-full"
                title={`${lang}: ${pct}%`}
              />
            );
          })}
        </div>

        {/* Legend with tabular numbers */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {sortedLangs.map(([lang, count], idx) => {
            const colors = ['#3B82F6', '#3FB950', '#D29922', '#71717A'];
            const pct = Math.round((count / totalFiles) * 100);
            return (
              <div key={lang} className="flex items-center justify-between text-xs font-mono tabular-nums">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: colors[idx % colors.length] }}
                  />
                  <span className="text-text-secondary truncate">{lang}</span>
                </div>
                <span className="text-text-tertiary font-medium">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const MobileInsights = InsightsScreen;
