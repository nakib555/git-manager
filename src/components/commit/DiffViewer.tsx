import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism';

export const DiffViewer = ({ patch, filename }: { patch: string; filename: string; isDark?: boolean }) => {
  if (!patch) return <div className="text-text-muted italic pl-2 p-2">Binary or empty file change.</div>;

  return (
    <div className="w-full text-[12px] md:text-sm font-mono relative overflow-hidden rounded-2xl border border-border bg-card code-measure">
      <div className="bg-surface-2 border-b border-border px-4 py-3 min-h-[48px] flex items-center justify-between text-text-secondary">
        <span className="font-semibold text-text-primary text-xs tracking-mono">{filename}</span>
      </div>
      <div className="w-full overflow-x-auto bg-surface-1 tabular-nums">
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
                style.backgroundColor = 'oklch(0.60 0.18 145 / 0.12)';
                style.color = 'var(--color-addition-oklch)';
                style.borderLeft = '3px solid var(--color-addition-oklch)';
              } else if (line.startsWith('-')) {
                style.backgroundColor = 'oklch(0.58 0.21 26 / 0.12)';
                style.color = 'var(--color-deletion-oklch)';
                style.borderLeft = '3px solid var(--color-deletion-oklch)';
              } else if (line.startsWith('@@')) {
                style.color = 'var(--color-accent-oklch)';
                style.backgroundColor = 'oklch(0.46 0.08 242 / 0.08)';
                style.borderLeft = '3px solid var(--color-accent-oklch)';
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
