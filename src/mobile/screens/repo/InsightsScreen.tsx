import React from 'react';
import { useAppContext } from '../../../AppContext';
import { BarChart2, TrendingUp, Code2, GitCommit } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const InsightsScreen: React.FC = () => {
  const { currentRepo, activeCommits, activeFiles } = useAppContext();

  // Commit history chart data
  const chartData = [
    { name: 'Mon', commits: 3 },
    { name: 'Tue', commits: 7 },
    { name: 'Wed', commits: 4 },
    { name: 'Thu', commits: 9 },
    { name: 'Fri', commits: 6 },
    { name: 'Sat', commits: 2 },
    { name: 'Sun', commits: 5 },
  ];

  // Language composition calculation
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
          Activity telemetry and code composition for {currentRepo}
        </p>
      </div>

      {/* Commit Activity Chart - Pure Slate + Steel Blue (No purple gradients) */}
      <div className="bg-surface-1 border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={15} className="text-accent" />
            <span className="text-xs font-semibold text-text-primary">Weekly Commit Velocity</span>
          </div>
          <span className="text-xs font-mono text-accent font-bold">
            {activeCommits.length} total
          </span>
        </div>

        <div className="h-36 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="mobileVelocity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#388BFD" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#388BFD" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#8B949E" fontSize={10} tickLine={false} />
              <YAxis stroke="#8B949E" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#161B22',
                  border: '1px solid #30363D',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#F0F6FC',
                }}
              />
              <Area
                type="monotone"
                dataKey="commits"
                stroke="#388BFD"
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
          <span className="text-xs font-mono text-text-tertiary">
            {activeFiles.length} files tracked
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full bg-surface-2 rounded-full overflow-hidden flex">
          {sortedLangs.map(([lang, count], idx) => {
            const colors = ['#388BFD', '#3FB950', '#D29922', '#8B949E'];
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

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {sortedLangs.map(([lang, count], idx) => {
            const colors = ['#388BFD', '#3FB950', '#D29922', '#8B949E'];
            const pct = Math.round((count / totalFiles) * 100);
            return (
              <div key={lang} className="flex items-center justify-between text-xs font-mono">
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

// Aliases
export const MobileInsights = InsightsScreen;
