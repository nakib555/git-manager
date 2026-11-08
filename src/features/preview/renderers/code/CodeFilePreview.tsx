import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Search } from 'lucide-react';

interface CodeFilePreviewProps {
  content: string;
  language: string;
  fileName: string;
}

export const CodeFilePreview: React.FC<CodeFilePreviewProps> = ({
  content,
  language,
  fileName,
}) => {
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState('');

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = content ? content.split('\n').length : 0;

  return (
    <div className="w-full h-full flex flex-col bg-surface-1 overflow-hidden">
      <div className="px-4 py-2 border-b border-border bg-surface-2/40 flex items-center justify-between gap-4 shrink-0">
        <div className="relative max-w-xs w-full">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search code lines..."
            className="w-full bg-surface-1 border border-border rounded-lg pl-8 pr-2.5 py-1 text-xs text-text-primary outline-none focus:border-accent"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-text-tertiary tabular-nums">
            {lineCount} lines · {language}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-surface-1 hover:bg-surface-2 border border-border rounded-lg text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto text-xs font-mono">
        <SyntaxHighlighter
          language={language || 'text'}
          style={vs}
          showLineNumbers
          wrapLines
          customStyle={{
            margin: 0,
            padding: '16px',
            background: 'transparent',
            fontSize: '12px',
            lineHeight: '20px',
          }}
          lineNumberStyle={{
            minWidth: '3.2em',
            paddingRight: '1.2em',
            color: '#8A8D96',
            userSelect: 'none',
          }}
        >
          {content || '// Empty file'}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};
