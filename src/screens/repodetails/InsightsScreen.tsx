import React from 'react';
import { AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useAppContext } from '../../AppContext';

const getLanguageColor = (lang: string | null) => {
  if (!lang) return '#8F8F9D';
  const colors: Record<string, string> = {
    TypeScript: '#3178c6',
    JavaScript: '#f7df1e',
    Python: '#3572A5',
    Rust: '#DEA584',
    Swift: '#F05138',
    Go: '#00ADD8',
    Java: '#b07219',
    HTML: '#e34c26',
    CSS: '#563d7c',
  };
  return colors[lang] || '#8F8F9D';
};

export const InsightsScreen = () => {
  const { activeLanguages, activeCommits, activePRs } = useAppContext();

  const commitCount = activeCommits.length;
  const uniqueAuthors = new Set(activeCommits.map(c => c.author)).size;
  const mergedPRsCount = activePRs.filter(pr => pr.status === 'Merged').length;

  const pieData = Object.entries(activeLanguages).map(([name, val]) => ({
    name,
    value: val as number,
    color: getLanguageColor(name)
  })).sort((a, b) => b.value - a.value);

  const displayPie = pieData.length > 4 
    ? [...pieData.slice(0, 3), { name: 'Others', value: pieData.slice(3).reduce((acc, curr) => acc + curr.value, 0), color: '#262636' }]
    : pieData;

  const finalTotal = displayPie.reduce((acc, curr) => acc + curr.value, 0) || 1;

  const getCommitChartData = () => {
    const now = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const labels: string[] = [];
    const commitsData = [0, 0, 0, 0, 0, 0, 0];
    
    for(let i=6; i>=0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      labels.push(dayNames[d.getDay()]);
    }

    const parseTime = (timeStr: string) => {
      const n = new Date();
      if (!timeStr) return n.getTime();
      if (timeStr.includes('m ago')) return n.getTime() - (parseInt(timeStr) || 1) * 60 * 1000;
      if (timeStr.includes('h ago')) return n.getTime() - (parseInt(timeStr) || 1) * 60 * 60 * 1000;
      if (timeStr.includes('d ago')) return n.getTime() - (parseInt(timeStr) || 1) * 24 * 60 * 60 * 1000;
      return n.getTime();
    };
    
    activeCommits.forEach((c: any) => {
      const d = new Date(c.timestamp || parseTime(c.time));
      const daysAgo = Math.floor((now.getTime() - d.getTime()) / (24 * 60 * 60 * 1000));
      if (daysAgo < 7 && daysAgo >= 0) {
        commitsData[6 - daysAgo]++;
      }
    });

    return labels.map((label, idx) => ({
      name: label,
      uv: commitsData[idx]
    }));
  };

  const chartData = getCommitChartData();

  return (
    <>
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-card rounded-2xl p-3 border border-border flex flex-col items-center text-center">
          <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider mb-1">Commits</span>
          <span className="text-lg font-bold text-text-main">{commitCount}</span>
        </div>
        <div className="bg-card rounded-2xl p-3 border border-border flex flex-col items-center text-center">
          <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider mb-1">Contributors</span>
          <span className="text-lg font-bold text-warning">{uniqueAuthors}</span>
        </div>
        <div className="bg-card rounded-2xl p-3 border border-border flex flex-col items-center text-center">
          <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider mb-1">PRs Merged</span>
          <span className="text-lg font-bold text-text-main">{mergedPRsCount}</span>
        </div>
      </div>
      
      <div className="bg-card rounded-2xl p-4 mb-5 border border-border">
        <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Activity Overview</div>
        <div className="h-[120px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUvIns" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip cursor={false} contentStyle={{ backgroundColor: 'var(--card)', border: 'none', borderRadius: '8px', color: 'var(--text-main)', fontSize: '11px' }} itemStyle={{ color: 'var(--text-main)' }} />
              <Area type="monotone" dataKey="uv" name="Commits" stroke="#7C3AED" strokeWidth={2.5} fillOpacity={1} fill="url(#colorUvIns)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-4 border border-border">
        <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">Languages</div>
        {displayPie.length === 0 ? (
          <div className="text-xs text-text-muted text-center py-4">No language breakdown available.</div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="w-[100px] h-[100px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={displayPie} innerRadius={28} outerRadius={46} paddingAngle={0} dataKey="value" stroke="none">
                    {displayPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip cursor={false} contentStyle={{ backgroundColor: 'var(--card)', border: 'none', borderRadius: '8px', color: 'var(--text-main)', fontSize: '11px' }} itemStyle={{ color: 'var(--text-main)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-xs flex flex-col gap-2 w-[50%]">
              {displayPie.map(lang => (
                <div key={lang.name} className="flex justify-between items-center text-text-main/90 font-medium">
                  <span className="font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: lang.color }} />
                    {lang.name}
                  </span> 
                  <span className="text-text-muted font-bold">{Math.round((lang.value / finalTotal) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
