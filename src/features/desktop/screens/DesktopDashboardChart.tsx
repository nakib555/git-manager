import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface DesktopDashboardChartProps {
  data: Array<{ name: string; commits: number; prs: number }>;
}

export const DesktopDashboardChart: React.FC<DesktopDashboardChartProps> = ({ data }) => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="commitsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#388BFD" stopOpacity={0.35}/>
              <stop offset="95%" stopColor="#388BFD" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="prsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2EA043" stopOpacity={0.35}/>
              <stop offset="95%" stopColor="#2EA043" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.4} />
          <XAxis 
            dataKey="name" 
            stroke="var(--color-text-muted)" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            stroke="var(--color-text-muted)" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false} 
            allowDecimals={false} 
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'var(--color-surface-1)',
              borderColor: 'var(--color-border)',
              borderRadius: '0.75rem',
              fontSize: '11px',
              color: 'var(--color-text-primary)',
            }}
          />
          <Area 
            type="monotone" 
            dataKey="commits" 
            name="Commits" 
            stroke="#388BFD" 
            strokeWidth={2} 
            fillOpacity={1} 
            fill="url(#commitsGrad)" 
          />
          <Area 
            type="monotone" 
            dataKey="prs" 
            name="Pull Requests" 
            stroke="#2EA043" 
            strokeWidth={2} 
            fillOpacity={1} 
            fill="url(#prsGrad)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
