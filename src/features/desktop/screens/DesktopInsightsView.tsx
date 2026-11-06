import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, AreaChart, Area } from 'recharts';
import { useAppContext } from '../../../AppContext';
import { getLanguageColor } from '../utils/desktopUtils';

export const DesktopInsightsView: React.FC = () => {
  const { activeLanguages, activeCommits, activePRs } = useAppContext();
  const commitCount = activeCommits.length;
  const contributorsCount = new Set(activeCommits.map(c => c.author)).size;
  const mergedCount = activePRs.filter(p => p.status === 'Merged').length;

  const pieData = Object.entries(activeLanguages).map(([name, val]) => ({
    name,
    value: val as number,
    color: getLanguageColor(name)
  })).sort((a, b) => b.value - a.value);

  const displayPie = pieData.length > 4 
    ? [...pieData.slice(0, 3), { name: 'Others', value: pieData.slice(3).reduce((acc, curr) => acc + curr.value, 0), color: '#262636' }]
    : pieData;

  const finalTotal = displayPie.reduce((acc, curr) => acc + curr.value, 0) || 1;

  const chartData = [
    { name: 'Mon', uv: Math.max(0, Math.floor(commitCount * 0.1)) },
    { name: 'Tue', uv: Math.max(0, Math.floor(commitCount * 0.25)) },
    { name: 'Wed', uv: Math.max(0, Math.floor(commitCount * 0.15)) },
    { name: 'Thu', uv: Math.max(0, Math.floor(commitCount * 0.3)) },
    { name: 'Fri', uv: Math.max(0, Math.floor(commitCount * 0.12)) },
    { name: 'Sat', uv: Math.max(0, Math.floor(commitCount * 0.05)) },
    { name: 'Sun', uv: Math.max(0, Math.floor(commitCount * 0.03)) }
  ];

  return (
    <div className="space-y-6 flex-1 overflow-y-auto pr-1 no-scrollbar pb-8">
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-card rounded-2xl p-6 border border-border flex flex-col justify-between">
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-2">Total Commits Logged</span>
          <span className="text-2xl font-extrabold text-text-main font-mono tabular-nums">{commitCount}</span>
        </div>
        <div className="bg-card rounded-2xl p-6 border border-border flex flex-col justify-between">
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-2">Contributors</span>
          <span className="text-2xl font-extrabold text-warning font-mono tabular-nums">{contributorsCount}</span>
        </div>
        <div className="bg-card rounded-2xl p-6 border border-border flex flex-col justify-between">
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-2">PRs Closed/Merged</span>
          <span className="text-2xl font-extrabold text-primary font-mono tabular-nums">{mergedCount}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl p-5 border border-border space-y-4">
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">LANGUAGE FRAMEWORK BREAKDOWN</span>
          {displayPie.length === 0 ? (
            <div className="text-xs text-text-muted text-center py-10">No language data compiled.</div>
          ) : (
            <div className="flex items-center justify-between gap-5">
              <div className="w-[140px] h-[140px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={displayPie} innerRadius={35} outerRadius={60} paddingAngle={2} dataKey="value" stroke="none">
                      {displayPie.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip cursor={false} contentStyle={{ backgroundColor: 'var(--card)', border: 'none', borderRadius: '12px', fontSize: '11px', color: 'var(--text-main)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="text-xs flex-1 space-y-2 max-w-[55%]">
                {displayPie.map(lang => (
                  <div key={lang.name} className="flex justify-between items-center text-text-main font-semibold">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: lang.color }} />
                      {lang.name}
                    </span>
                    <span className="text-text-muted">{Math.round((lang.value / finalTotal) * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-card rounded-2xl p-5 border border-border flex flex-col justify-between">
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block mb-4">COMMIT FREQUENCY RATIO</span>
          <div className="h-[140px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="insGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="uv" stroke="var(--color-accent)" strokeWidth={2} fillOpacity={1} fill="url(#insGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
