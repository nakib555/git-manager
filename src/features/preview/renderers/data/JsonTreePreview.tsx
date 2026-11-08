import React, { useState, useMemo } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Copy,
  Check,
  Search,
  Code2,
  FolderTree,
  Minimize2,
  Maximize2,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { CodeFilePreview } from '../code/CodeFilePreview';

interface JsonTreePreviewProps {
  content: string;
  fileName?: string;
  initialMode?: 'tree' | 'raw';
}

export const JsonTreePreview: React.FC<JsonTreePreviewProps> = ({
  content,
  fileName = 'data.json',
  initialMode = 'tree',
}) => {
  const [viewMode, setViewMode] = useState<'tree' | 'raw'>(initialMode);
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState('');
  const [collapsedKeys, setCollapsedKeys] = useState<Record<string, boolean>>({});
  const [formattedContent, setFormattedContent] = useState<string | null>(null);

  const parsed = useMemo(() => {
    try {
      const data = JSON.parse(content);
      return { data, error: null };
    } catch (e: any) {
      return { data: null, error: e.message || 'Invalid JSON syntax' };
    }
  }, [content]);

  // Active raw content (either user-formatted or original raw content)
  const activeRawContent = formattedContent !== null ? formattedContent : content;

  const toggleCollapse = (path: string) => {
    setCollapsedKeys((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const handleExpandAll = () => {
    setCollapsedKeys({});
  };

  const handleCollapseAll = () => {
    if (!parsed.data) return;
    const newCollapsed: Record<string, boolean> = {};
    const traverse = (val: any, path: string) => {
      if (val && typeof val === 'object') {
        newCollapsed[path] = true;
        Object.keys(val).forEach((k) => traverse(val[k], `${path}.${k}`));
      }
    };
    traverse(parsed.data, 'root');
    setCollapsedKeys(newCollapsed);
  };

  const handlePrettify = () => {
    try {
      const obj = JSON.parse(content);
      setFormattedContent(JSON.stringify(obj, null, 2));
    } catch (_) {}
  };

  const handleMinify = () => {
    try {
      const obj = JSON.parse(content);
      setFormattedContent(JSON.stringify(obj));
    } catch (_) {}
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(activeRawContent);
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

    // Filter match for search
    const hasSearch = Boolean(search.trim());
    const matchesSearch = !hasSearch || keys.some((k) => {
      const stringified = String(val[k]);
      return k.toLowerCase().includes(search.toLowerCase()) || stringified.toLowerCase().includes(search.toLowerCase());
    });

    if (hasSearch && !matchesSearch && depth > 0) {
      return null;
    }

    return (
      <div className="pl-4 border-l border-border/60 my-0.5">
        <button
          type="button"
          onClick={() => toggleCollapse(path)}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-text-secondary hover:text-text-primary cursor-pointer select-none py-0.5"
        >
          {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
          <span className="font-mono text-text-tertiary">
            {isArray ? `Array(${keys.length})` : `Object {${keys.length}}`}
          </span>
        </button>

        {!isCollapsed && (
          <div className="space-y-0.5 mt-0.5">
            {keys.map((k) => (
              <div key={k} className="flex items-start gap-1.5 text-xs font-mono">
                <span className="text-text-primary font-semibold select-all">{k}:</span>
                <div className="flex-1 min-w-0">{renderValue(val[k], `${path}.${k}`, depth + 1)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // If JSON parsing has errors, fallback to raw code view with an error banner
  if (parsed.error) {
    return (
      <div className="w-full h-full flex flex-col bg-surface-1 overflow-hidden">
        <div className="p-3 bg-rose-500/10 border-b border-rose-500/20 text-rose-700 text-xs flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-rose-600 shrink-0" />
            <span className="font-semibold">JSON Syntax Notice:</span>
            <span className="font-mono text-[11px]">{parsed.error}</span>
          </div>
          <span className="text-[10px] bg-rose-500/20 px-2 py-0.5 rounded font-mono font-medium">Viewing Raw</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <CodeFilePreview content={content} language="json" fileName={fileName} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-surface-1 overflow-hidden">
      {/* JSON Viewer Mode Header */}
      <div className="px-4 py-2 border-b border-border bg-surface-2/40 flex items-center justify-between gap-3 shrink-0 flex-wrap">
        {/* Left: View Mode Toggle Tabs [Tree View] / [Raw JSON] */}
        <div className="flex items-center gap-1 p-0.5 bg-surface-1 border border-border rounded-lg shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode('tree')}
            className={`flex items-center gap-1.5 h-6 px-2.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              viewMode === 'tree'
                ? 'bg-accent text-white shadow-2xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <FolderTree size={12} />
            <span>Tree View</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('raw')}
            className={`flex items-center gap-1.5 h-6 px-2.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              viewMode === 'raw'
                ? 'bg-accent text-white shadow-2xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Code2 size={12} />
            <span>Raw JSON</span>
          </button>
        </div>

        {/* Center / Search for tree view */}
        {viewMode === 'tree' ? (
          <div className="relative max-w-xs flex-1 min-w-[140px]">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter keys / values..."
              className="w-full bg-surface-1 border border-border rounded-lg pl-8 pr-2.5 py-1 text-xs text-text-primary outline-none focus:border-accent transition-colors"
            />
          </div>
        ) : null}

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 ml-auto">
          {viewMode === 'tree' ? (
            <>
              <button
                type="button"
                onClick={handleExpandAll}
                className="flex items-center gap-1 h-7 px-2 bg-surface-1 hover:bg-surface-2 border border-border rounded-md text-[11px] font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                title="Expand all nodes"
              >
                <Maximize2 size={11} />
                <span className="hidden sm:inline">Expand All</span>
              </button>
              <button
                type="button"
                onClick={handleCollapseAll}
                className="flex items-center gap-1 h-7 px-2 bg-surface-1 hover:bg-surface-2 border border-border rounded-md text-[11px] font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                title="Collapse all nodes"
              >
                <Minimize2 size={11} />
                <span className="hidden sm:inline">Collapse All</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handlePrettify}
                className="flex items-center gap-1 h-7 px-2 bg-surface-1 hover:bg-surface-2 border border-border rounded-md text-[11px] font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                title="Format JSON with 2-space indentation"
              >
                <Sparkles size={11} className="text-accent" />
                <span>Prettify</span>
              </button>
              <button
                type="button"
                onClick={handleMinify}
                className="flex items-center gap-1 h-7 px-2 bg-surface-1 hover:bg-surface-2 border border-border rounded-md text-[11px] font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                title="Compact / Minify JSON"
              >
                <Minimize2 size={11} />
                <span>Minify</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className={`flex items-center gap-1.5 h-7 px-2.5 bg-surface-1 hover:bg-surface-2 border border-border rounded-md text-xs font-medium text-text-secondary hover:text-text-primary transition-all cursor-pointer ${
              copied ? 'border-emerald-500/50 text-emerald-700 bg-emerald-500/10' : ''
            }`}
          >
            {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Main Canvas: Either Interactive Tree or Raw Code View */}
      <div className="flex-1 overflow-hidden relative">
        {viewMode === 'tree' ? (
          <div className="w-full h-full overflow-auto p-4 font-mono text-xs select-text">
            {renderValue(parsed.data, 'root')}
          </div>
        ) : (
          <CodeFilePreview
            content={activeRawContent}
            language="json"
            fileName={fileName}
          />
        )}
      </div>
    </div>
  );
};
