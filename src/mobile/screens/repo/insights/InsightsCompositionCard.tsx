import React from 'react';
import { Code2 } from 'lucide-react';
import { EmptyState } from '../../../components/EmptyState';

interface InsightsCompositionCardProps {
  activeFiles: any[];
}

export const InsightsCompositionCard: React.FC<InsightsCompositionCardProps> = ({ activeFiles }) => {
  const langCounts: Record<string, number> = {};
  activeFiles.forEach(f => {
    const ext = f.name?.split('.').pop()?.toUpperCase() || 'OTHER';
    langCounts[ext] = (langCounts[ext] || 0) + 1;
  });

  const totalFiles = Math.max(1, activeFiles.length);
  const sortedLangs = Object.entries(langCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const colors = ['#5E7896', '#3E7E55', '#9C7436', '#686973'];

  return (
    <div className="bg-surface-1 border border-border rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code2 size={15} className="text-accent" />
          <span className="text-xs font-semibold text-text-primary">File Type Composition</span>
        </div>
        <span className="text-xs font-mono text-text-tertiary tabular-nums">
          {activeFiles.length} files tracked
        </span>
      </div>

      {activeFiles.length === 0 ? (
        <EmptyState
          icon={Code2}
          title="No tracked files"
          description="File type composition will render once source files are tracked."
          compact
        />
      ) : (
        <>
          <div className="h-2 w-full bg-surface-2 rounded-xs overflow-hidden flex">
            {sortedLangs.map(([lang, count], idx) => {
              const pct = Math.round((count / totalFiles) * 100);
              return (
                <div
                  key={lang}
                  style={{ width: `${pct}%`, backgroundColor: colors[idx % colors.length] }}
                  className="h-full"
                  title={`${lang}: ${pct}%`}
                />
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {sortedLangs.map(([lang, count], idx) => {
              const pct = Math.round((count / totalFiles) * 100);
              return (
                <div key={lang} className="flex items-center justify-between text-xs font-mono tabular-nums">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="w-2 h-2 rounded-xs shrink-0"
                      style={{ backgroundColor: colors[idx % colors.length] }}
                    />
                    <span className="text-text-secondary truncate">{lang}</span>
                  </div>
                  <span className="text-text-tertiary font-medium">{pct}%</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
