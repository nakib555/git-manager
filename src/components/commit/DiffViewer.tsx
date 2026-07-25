import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';

export const DiffViewer = ({ patch, filename, isDark = false }: { patch: string; filename: string, isDark?: boolean }) => {
  if (!patch) return <div className="text-text-muted italic pl-2 p-2">Binary or empty file change.</div>;

  return (
    <div className="w-full text-[12px] md:text-sm font-mono relative overflow-hidden rounded-lg border border-border bg-card">
      <div className="bg-main border-b border-border px-4 py-2 flex items-center justify-between text-text-muted">
         <span className="font-semibold text-text-main">{filename}</span>
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
                  style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
                  style.color = '#10B981';
                  style.borderLeft = '3px solid rgba(16, 185, 129, 0.6)';
               } else if (line.startsWith('-')) {
                  style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                  style.color = '#EF4444';
               } else if (line.startsWith('@@')) {
                  style.color = '#0EA5E9';
                  style.fontWeight = 'bold';
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
