import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, Copy, Check, Search } from 'lucide-react';

interface JsonTreePreviewProps {
  content: string;
}

export const JsonTreePreview: React.FC<JsonTreePreviewProps> = ({ content }) => {
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState('');
  const [collapsedKeys, setCollapsedKeys] = useState<Record<string, boolean>>({});

  const parsed = useMemo(() => {
    try {
      return { data: JSON.parse(content), error: null };
    } catch (e: any) {
      return { data: null, error: e.message };
    }
  }, [content]);

  const toggleCollapse = (path: string) => {
    setCollapsedKeys((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderValue = (val: any, path: string, depth: number = 0): React.ReactNode => {
    if (val === null) return <span className="text-rose-500 font-semibold">null</span>;
    if (typeof val === 'boolean') return <span className="text-amber-600 font-semibold">{String(val)}</span>;
    if (typeof val === 'number') return <span className="text-emerald-600 tabular-nums">{val}</span>;
    if (typeof val === 'string') return <span className="text-sky-700 font-normal">"{val}"</span>;

    const isArray = Array.isArray(val);
    const keys = Object.keys(val);
    const isCollapsed = collapsedKeys[path];

    return (
      <div className="pl-4 border-l border-border/60 my-0.5">
        <button
          type="button"
          onClick={() => toggleCollapse(path)}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-text-secondary hover:text-text-primary cursor-pointer select-none"
        >
          {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
          <span>{isArray ? `Array(${keys.length})` : `Object {${keys.length}}`}</span>
        </button>

        {!isCollapsed && (
          <div className="space-y-0.5 mt-0.5">
            {keys.map((k) => (
              <div key={k} className="flex items-start gap-1.5 text-xs font-mono">
                <span className="text-text-primary font-medium">{k}:</span>
                <div className="flex-1">{renderValue(val[k], `${path}.${k}`, depth + 1)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (parsed.error) {
    return (
      <div className="w-full h-full p-6 font-mono text-xs overflow-auto bg-surface-1">
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-600 mb-4">
          JSON Syntax Error: {parsed.error}
        </div>
        <pre className="whitespace-pre-wrap text-text-primary">{content}</pre>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-surface-1 overflow-hidden">
      <div className="px-4 py-2 border-b border-border bg-surface-2/40 flex items-center justify-between gap-4 shrink-0">
        <div className="relative max-w-xs w-full">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search JSON..."
            className="w-full bg-surface-1 border border-border rounded-lg pl-8 pr-2.5 py-1 text-xs text-text-primary outline-none focus:border-accent"
          />
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-surface-1 hover:bg-surface-2 border border-border rounded-lg text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
        >
          {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 font-mono text-xs">
        {renderValue(parsed.data, 'root')}
      </div>
    </div>
  );
};
