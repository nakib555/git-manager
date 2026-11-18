import React, { useMemo, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs, vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { WrapText } from 'lucide-react';
import { useAppContext } from '../../AppContext';
import { parseUnifiedDiff } from '../../features/desktop/utils/diffParser';

export const DiffViewer = ({ patch, filename, isDark }: { patch: string; filename: string; isDark?: boolean }) => {
  const { theme } = useAppContext();
  const darkActive = isDark ?? theme !== 'light';
  const [wrapLines, setWrapLines] = useState(false);

  const parsed = useMemo(() => parseUnifiedDiff(patch || ''), [patch]);

  if (!patch) return <div className="text-text-muted italic pl-2 p-2">Binary or empty file change.</div>;

  return (
    <div className="w-full text-[12px] md:text-sm font-mono relative overflow-hidden rounded-2xl border border-border bg-card">
      <div className="bg-surface-2 border-b border-border px-4 py-2.5 min-h-[44px] flex items-center justify-between gap-3 text-text-secondary">
        <span className="font-semibold text-text-primary text-xs tracking-mono truncate">{filename}</span>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 text-[11px] font-mono tabular-nums">
            <span className="text-addition-oklch font-semibold">+{parsed.additions}</span>
            <span className="text-deletion-oklch font-semibold">-{parsed.deletions}</span>
          </div>
          <button
            type="button"
            onClick={() => setWrapLines((prev) => !prev)}
            aria-pressed={wrapLines}
            title={wrapLines ? 'Disable line wrapping' : 'Wrap long lines'}
            className={`flex items-center gap-1 px-2 py-1 rounded-md border text-[11px] font-sans font-medium cursor-pointer transition-colors ${
              wrapLines
                ? 'bg-primary/10 border-primary/40 text-primary'
                : 'bg-surface-1 border-border text-text-muted hover:text-text-main'
            }`}
          >
            <WrapText size={12} />
            <span>Wrap</span>
          </button>
        </div>
      </div>
      <div className="w-full overflow-x-auto bg-surface-1 tabular-nums">
        <SyntaxHighlighter
          language="diff"
          style={darkActive ? vscDarkPlus : vs}
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: 'transparent',
            whiteSpace: wrapLines ? 'pre-wrap' : 'pre',
            wordBreak: wrapLines ? 'break-word' : 'normal',
          }}
          wrapLines={true}
          wrapLongLines={wrapLines}
          lineProps={(lineNumber) => {
            const parsedLine = parsed.lines[lineNumber - 1];
            const style: React.CSSProperties = { display: 'block' };
            if (parsedLine) {
              if (parsedLine.kind === 'add') {
                style.backgroundColor = 'oklch(0.60 0.18 145 / 0.12)';
                style.color = 'var(--color-addition-oklch)';
                style.borderLeft = '3px solid var(--color-addition-oklch)';
              } else if (parsedLine.kind === 'del') {
                style.backgroundColor = 'oklch(0.58 0.21 26 / 0.12)';
                style.color = 'var(--color-deletion-oklch)';
                style.borderLeft = '3px solid var(--color-deletion-oklch)';
              } else if (parsedLine.kind === 'hunk') {
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
