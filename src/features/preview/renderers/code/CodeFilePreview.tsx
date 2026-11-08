import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  Copy,
  Check,
  Search,
  ChevronDown,
  ChevronUp,
  WrapText,
  Type,
  FileCode,
  FileText,
  AlignLeft,
  X,
} from 'lucide-react';
import { formatBytes } from '../../utils/formatters';

interface CodeFilePreviewProps {
  content: string;
  language: string;
  fileName: string;
}

// Map extensions to Prism language identifiers
function normalizeLanguage(lang: string, fileName: string): string {
  const l = (lang || '').toLowerCase().trim();
  const name = (fileName || '').toLowerCase().trim();

  if (name === 'dockerfile') return 'docker';
  if (name === 'makefile') return 'makefile';
  if (name.startsWith('.env')) return 'bash';

  const map: Record<string, string> = {
    js: 'javascript',
    jsx: 'jsx',
    ts: 'typescript',
    tsx: 'tsx',
    py: 'python',
    rb: 'ruby',
    sh: 'bash',
    bash: 'bash',
    zsh: 'bash',
    json: 'json',
    jsonc: 'json',
    yaml: 'yaml',
    yml: 'yaml',
    toml: 'toml',
    html: 'html',
    htm: 'html',
    xml: 'xml',
    css: 'css',
    scss: 'scss',
    less: 'less',
    md: 'markdown',
    markdown: 'markdown',
    sql: 'sql',
    rs: 'rust',
    go: 'go',
    java: 'java',
    kt: 'kotlin',
    c: 'c',
    cpp: 'cpp',
    h: 'c',
    cs: 'csharp',
    php: 'php',
    swift: 'swift',
    dart: 'dart',
    txt: 'text',
    text: 'text',
    log: 'text',
  };

  return map[l] || (l ? l : 'text');
}

export const CodeFilePreview: React.FC<CodeFilePreviewProps> = ({
  content,
  language,
  fileName,
}) => {
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState('');
  const [fontSize, setFontSize] = useState<number>(13);
  const [wrapLines, setWrapLines] = useState<boolean>(true);
  const [activeMatchIndex, setActiveMatchIndex] = useState<number>(0);
  const [mode, setMode] = useState<'standard' | 'reader'>('standard');

  const containerRef = useRef<HTMLDivElement>(null);

  const normalizedLang = useMemo(() => normalizeLanguage(language, fileName), [language, fileName]);
  const isPlainText = ['text', 'txt', 'log', 'plain'].includes(normalizedLang);

  const lines = useMemo(() => {
    return content ? content.split('\n') : [];
  }, [content]);

  const lineCount = lines.length;
  const charCount = content ? content.length : 0;
  const byteSize = useMemo(() => new TextEncoder().encode(content || '').length, [content]);

  // Search matches across lines
  const searchMatches = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    const matches: { line: number; index: number }[] = [];
    lines.forEach((lineText, idx) => {
      if (lineText.toLowerCase().includes(q)) {
        matches.push({ line: idx + 1, index: matches.length });
      }
    });
    return matches;
  }, [lines, search]);

  useEffect(() => {
    setActiveMatchIndex(0);
  }, [search]);

  const handleNextMatch = () => {
    if (searchMatches.length === 0) return;
    setActiveMatchIndex((prev) => (prev + 1) % searchMatches.length);
  };

  const handlePrevMatch = () => {
    if (searchMatches.length === 0) return;
    setActiveMatchIndex((prev) => (prev - 1 + searchMatches.length) % searchMatches.length);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cycleFontSize = () => {
    const sizes = [11, 12, 13, 14, 16];
    const nextIdx = (sizes.indexOf(fontSize) + 1) % sizes.length;
    setFontSize(sizes[nextIdx]);
  };

  // Custom high-contrast clean styling for Prism to avoid harsh colors
  const cleanPrismStyle = useMemo(() => {
    return {
      ...vs,
      'code[class*="language-"]': {
        ...vs['code[class*="language-"]'],
        fontFamily: "'JetBrains Mono', 'Geist Mono', ui-monospace, SFMono-Regular, monospace",
        fontSize: `${fontSize}px`,
        lineHeight: `${Math.round(fontSize * 1.65)}px`,
        color: '#1C1D21',
      },
      'pre[class*="language-"]': {
        ...vs['pre[class*="language-"]'],
        fontFamily: "'JetBrains Mono', 'Geist Mono', ui-monospace, SFMono-Regular, monospace",
        fontSize: `${fontSize}px`,
        lineHeight: `${Math.round(fontSize * 1.65)}px`,
        background: 'transparent',
        margin: 0,
        padding: '16px 20px',
      },
      keyword: { color: '#0969DA', fontWeight: '600' },
      string: { color: '#0A3069' },
      comment: { color: '#6E7781', fontStyle: 'italic' },
      function: { color: '#8250DF', fontWeight: '500' },
      number: { color: '#0550AE' },
      boolean: { color: '#CF222E', fontWeight: '600' },
      operator: { color: '#24292F' },
      punctuation: { color: '#57606A' },
      tag: { color: '#116329' },
      'attr-name': { color: '#0550AE' },
      'attr-value': { color: '#0A3069' },
    };
  }, [fontSize]);

  return (
    <div className="w-full h-full flex flex-col bg-surface-1 overflow-hidden select-text text-text-primary">
      {/* Professional Studio Toolbar */}
      <div className="px-4 py-2 border-b border-border bg-surface-2/40 flex items-center justify-between gap-3 shrink-0 flex-wrap">
        {/* Left: Search with matches */}
        <div className="flex items-center gap-2 max-w-sm w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search in file..."
              className="w-full bg-surface-1 border border-border rounded-lg pl-8 pr-16 py-1 text-xs text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent transition-colors"
            />
            {search && (
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <span className="text-[10px] text-text-tertiary tabular-nums mr-1">
                  {searchMatches.length > 0 ? `${activeMatchIndex + 1}/${searchMatches.length}` : '0'}
                </span>
                <button
                  type="button"
                  onClick={handlePrevMatch}
                  disabled={searchMatches.length === 0}
                  className="p-0.5 hover:bg-surface-2 rounded text-text-secondary disabled:opacity-30 cursor-pointer"
                  title="Previous match (Shift+Enter)"
                >
                  <ChevronUp size={11} />
                </button>
                <button
                  type="button"
                  onClick={handleNextMatch}
                  disabled={searchMatches.length === 0}
                  className="p-0.5 hover:bg-surface-2 rounded text-text-secondary disabled:opacity-30 cursor-pointer"
                  title="Next match (Enter)"
                >
                  <ChevronDown size={11} />
                </button>
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="p-0.5 hover:bg-surface-2 rounded text-text-tertiary hover:text-text-primary cursor-pointer"
                  title="Clear search"
                >
                  <X size={11} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Controls (Wrap, Font Size, Copy, Language Badge) */}
        <div className="flex items-center gap-2">
          {/* Plain Text Reader Mode Toggle */}
          {isPlainText && (
            <button
              type="button"
              onClick={() => setMode((m) => (m === 'standard' ? 'reader' : 'standard'))}
              className={`flex items-center gap-1 h-7 px-2 border rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                mode === 'reader'
                  ? 'bg-accent text-white border-accent'
                  : 'bg-surface-1 hover:bg-surface-2 border-border text-text-secondary hover:text-text-primary'
              }`}
              title="Toggle Editorial Reader Mode"
            >
              <AlignLeft size={12} />
              <span className="hidden sm:inline">{mode === 'reader' ? 'Reader' : 'Code'}</span>
            </button>
          )}

          {/* Word Wrap Toggle */}
          <button
            type="button"
            onClick={() => setWrapLines(!wrapLines)}
            className={`flex items-center gap-1 h-7 px-2 border rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
              wrapLines
                ? 'bg-surface-2 border-border text-text-primary'
                : 'bg-surface-1 hover:bg-surface-2 border-border text-text-secondary'
            }`}
            title={wrapLines ? 'Word wrap active (click to disable)' : 'Horizontal scroll active (click to wrap)'}
          >
            <WrapText size={12} />
            <span className="hidden sm:inline">{wrapLines ? 'Wrap' : 'No Wrap'}</span>
          </button>

          {/* Font Size Toggle */}
          <button
            type="button"
            onClick={cycleFontSize}
            className="flex items-center gap-1 h-7 px-2 bg-surface-1 hover:bg-surface-2 border border-border text-text-secondary hover:text-text-primary rounded-md text-[11px] font-medium transition-colors cursor-pointer"
            title="Cycle text font size"
          >
            <Type size={12} />
            <span className="tabular-nums">{fontSize}px</span>
          </button>

          {/* Copy Button */}
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

      {/* Editor & Content Canvas */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto relative font-mono text-xs focus:outline-none"
        style={{
          scrollBehavior: 'smooth',
        }}
      >
        {mode === 'reader' && isPlainText ? (
          /* Elegant Editorial Text Reader Mode */
          <div className="max-w-3xl mx-auto p-8 font-sans leading-relaxed text-text-primary text-[14px]">
            <div className="border-b border-border pb-4 mb-6 flex items-center justify-between text-xs text-text-tertiary font-mono">
              <span className="font-semibold text-text-primary">{fileName}</span>
              <span>{lineCount} lines · {formatBytes(byteSize)}</span>
            </div>
            <div className="whitespace-pre-wrap font-mono text-[13px] leading-6 select-text text-text-primary/95 bg-surface-2/20 p-6 rounded-xl border border-border/60">
              {content || '(Empty document)'}
            </div>
          </div>
        ) : (
          /* High-Definition Syntax Highlighting with Precision Line Numbers */
          <div className="w-full min-w-full inline-block">
            <SyntaxHighlighter
              language={normalizedLang}
              style={cleanPrismStyle}
              showLineNumbers
              wrapLines={wrapLines}
              customStyle={{
                margin: 0,
                padding: '16px 20px',
                background: 'transparent',
                fontSize: `${fontSize}px`,
                lineHeight: `${Math.round(fontSize * 1.65)}px`,
                fontFamily: "'JetBrains Mono', 'Geist Mono', ui-monospace, SFMono-Regular, monospace",
                minWidth: '100%',
              }}
              lineNumberStyle={{
                minWidth: '3.6em',
                paddingRight: '1.25em',
                marginRight: '1em',
                color: '#8A8D96',
                borderRight: '1px solid #EFEFED',
                userSelect: 'none',
                textAlign: 'right',
                display: 'inline-block',
              }}
            >
              {content || '// Empty file'}
            </SyntaxHighlighter>
          </div>
        )}
      </div>

      {/* Integrated Professional Status Footer */}
      <div className="px-4 py-1.5 border-t border-border bg-surface-2/50 flex items-center justify-between text-[11px] text-text-tertiary font-mono shrink-0 select-none">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-medium text-text-secondary">
            {isPlainText ? <FileText size={11} className="text-accent" /> : <FileCode size={11} className="text-accent" />}
            <span className="uppercase">{normalizedLang}</span>
          </span>
          <span className="text-border">·</span>
          <span className="tabular-nums">{lineCount} lines</span>
          <span className="text-border">·</span>
          <span className="tabular-nums">{charCount} characters</span>
          <span className="text-border">·</span>
          <span className="tabular-nums">{formatBytes(byteSize)}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline">UTF-8</span>
          <span className="text-border hidden sm:inline">·</span>
          <span className="hidden sm:inline">LF</span>
          <span className="text-border hidden sm:inline">·</span>
          <span className="tabular-nums">{fontSize}px</span>
        </div>
      </div>
    </div>
  );
};
