import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism';

export const DiffViewer = ({ patch, filename }: { patch: string; filename: string; isDark?: boolean }) => {
  if (!patch) return <div className="text-text-muted italic pl-2 p-2">Binary or empty file change.</div>;

  return (
    <div className="w-full text-[12px] md:text-sm font-mono relative overflow-hidden rounded-2xl border border-border bg-card">
      <div className="bg-surface-2 border-b border-border px-4 py-3 min-h-[48px] flex items-center justify-between text-text-secondary">
        <span className="font-semibold text-text-primary text-xs">{filename}</span>
      </div>
      <div className="w-full overflow-x-auto bg-surface-1">
        <SyntaxHighlighter
          language="diff"
          style={vs}
          customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}
          wrapLines={true}
          lineProps={(lineNumber) => {
            const lines = patch.split('\n');
            const line = lines[lineNumber - 1];
            const style: React.CSSProperties = { display: 'block' };
            if (line) {
              if (line.startsWith('+')) {
                style.backgroundColor = 'rgba(26, 127, 55, 0.12)';
                style.color = '#1A7F37';
                style.borderLeft = '3px solid #1A7F37';
              } else if (line.startsWith('-')) {
                style.backgroundColor = 'rgba(207, 34, 46, 0.12)';
                style.color = '#CF222E';
                style.borderLeft = '3px solid #CF222E';
              } else if (line.startsWith('@@')) {
                style.color = '#0969DA';
                style.backgroundColor = 'rgba(9, 105, 218, 0.08)';
                style.borderLeft = '3px solid #0969DA';
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
