import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';

export const DiffViewer = ({ patch, filename, isDark = false }: { patch: string; filename: string, isDark?: boolean }) => {
  if (!patch) return <div className="text-text-muted italic pl-2 p-2">Binary or empty file change.</div>;

  return (
    <div className="w-full text-[12px] md:text-sm font-mono relative overflow-hidden rounded-2xl border border-border bg-card">
      <div className="bg-main border-b border-border px-4 py-3 min-h-[48px] flex items-center justify-between text-text-muted">
         <span className="font-semibold text-text-main text-xs">{filename}</span>
      </div>
      <div className="w-full overflow-x-auto">
        <SyntaxHighlighter
          language="diff"
          style={isDark ? vscDarkPlus : vs}
          customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}
          wrapLines={true}
          lineProps={(lineNumber) => {
            const lines = patch.split('\n');
            const line = lines[lineNumber - 1];
            let style: React.CSSProperties = { display: 'block' };
            if (line) {
               if (line.startsWith('+')) {
                  style.backgroundColor = 'rgba(63, 185, 80, 0.14)';
                  style.color = '#3FB950';
                  style.borderLeft = '3px solid #3FB950';
               } else if (line.startsWith('-')) {
                  style.backgroundColor = 'rgba(248, 81, 73, 0.14)';
                  style.color = '#F85149';
                  style.borderLeft = '3px solid #F85149';
               } else if (line.startsWith('@@')) {
                  style.color = '#388BFD';
                  style.backgroundColor = 'rgba(56, 139, 253, 0.08)';
                  style.borderLeft = '3px solid rgba(56, 139, 253, 0.4)';
                  style.fontWeight = '600';
               }
            }
            return { style };
          }}
        >
          {patch}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};
