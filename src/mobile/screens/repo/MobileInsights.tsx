import React from 'react';
import { useAppContext } from '../../../AppContext';
import { BarChart2, TrendingUp, Code2, GitCommit } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const MobileInsights: React.FC = () => {
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
        <h2 className="text-base font-semibold text-[#F4F4F5] tracking-tight">Insights</h2>
        <p className="text-xs text-[#71717A] mt-0.5">
          Activity telemetry and code composition for {currentRepo}
        </p>
      </div>

      {/* Commit Activity Chart */}
      <div className="bg-[#121214] border border-[#2A2A2E] rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={15} className="text-[#3B82F6]" />
            <span className="text-xs font-semibold text-[#F4F4F5]">Weekly Commit Velocity</span>
          </div>
          <span className="text-xs font-mono text-[#3B82F6] font-bold">
            {activeCommits.length} total
          </span>
        </div>

        <div className="h-36 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="mobileVelocity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#71717A" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#71717A" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A1A1D',
                  border: '1px solid #2A2A2E',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#F4F4F5',
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
      <div className="bg-[#121214] border border-[#2A2A2E] rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Code2 size={15} className="text-[#3B82F6]" />
          <span className="text-xs font-semibold text-[#F4F4F5]">File Extension Composition</span>
        </div>

        <div className="space-y-2 pt-1">
          {sortedLangs.map(([ext, count]) => {
            const percent = Math.round((count / totalFiles) * 100);
            return (
              <div key={ext} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#A1A1AA]">.{ext}</span>
                  <span className="text-[#F4F4F5] font-semibold">{percent}% ({count})</span>
                </div>
                <div className="w-full h-1.5 bg-[#1A1A1D] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#3B82F6] rounded-full"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
