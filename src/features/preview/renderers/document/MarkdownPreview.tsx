import React, { useState } from 'react';
import { Eye, Code, CheckSquare, Square } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs, vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useAppContext } from '../../../../AppContext';

interface MarkdownPreviewProps {
  content: string;
  fileName: string;
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content, fileName }) => {
  const { theme } = useAppContext();
  const isDark = theme !== 'light';
  const [viewMode, setViewMode] = useState<'preview' | 'raw'>('preview');

  // Simple, safe Markdown to React renderer
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBuffer: string[] = [];
    let codeLang = '';

    lines.forEach((line, index) => {
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <div key={`code-${index}`} className="my-3 rounded-lg overflow-hidden border border-border bg-surface-2/40 text-xs">
              <SyntaxHighlighter
                language={codeLang || 'text'}
                style={isDark ? vscDarkPlus : vs}
                customStyle={{ margin: 0, padding: '12px', background: 'transparent' }}
              >
                {codeBuffer.join('\n')}
              </SyntaxHighlighter>
            </div>
          );
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
          codeLang = line.replace('```', '').trim();
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      if (line.startsWith('# ')) {
        elements.push(<h1 key={index} className="text-2xl font-bold text-text-primary mt-6 mb-3 pb-1 border-b border-border">{line.slice(2)}</h1>);
      } else if (line.startsWith('## ')) {
        elements.push(<h2 key={index} className="text-xl font-semibold text-text-primary mt-5 mb-2 pb-1 border-b border-border">{line.slice(3)}</h2>);
      } else if (line.startsWith('### ')) {
        elements.push(<h3 key={index} className="text-base font-semibold text-text-primary mt-4 mb-2">{line.slice(4)}</h3>);
      } else if (line.startsWith('> ')) {
        elements.push(<blockquote key={index} className="border-l-2 border-accent pl-3 text-text-secondary italic my-2 text-sm">{line.slice(2)}</blockquote>);
      } else if (line.startsWith('- [ ] ') || line.startsWith('* [ ] ')) {
        elements.push(
          <div key={index} className="flex items-center gap-2 text-sm text-text-primary my-1">
            <Square size={14} className="text-text-tertiary shrink-0" />
            <span>{line.slice(6)}</span>
          </div>
        );
      } else if (line.startsWith('- [x] ') || line.startsWith('* [x] ')) {
        elements.push(
          <div key={index} className="flex items-center gap-2 text-sm text-text-primary my-1 line-through text-text-secondary">
            <CheckSquare size={14} className="text-accent shrink-0" />
            <span>{line.slice(6)}</span>
          </div>
        );
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(<li key={index} className="ml-5 list-disc text-sm text-text-primary my-0.5">{line.slice(2)}</li>);
      } else if (line.trim() === '') {
        elements.push(<div key={index} className="h-2" />);
      } else {
        elements.push(<p key={index} className="text-sm text-text-primary leading-relaxed my-1.5">{line}</p>);
      }
    });

    return elements;
  };

  return (
    <div className="w-full h-full flex flex-col bg-surface-1">
      <div className="px-4 py-2 border-b border-border flex justify-end items-center gap-2 shrink-0 bg-surface-2/30">
        <div className="flex items-center bg-surface-2 p-0.5 rounded-lg border border-border">
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              viewMode === 'preview' ? 'bg-surface-1 text-text-primary shadow-xs' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Eye size={13} />
            <span>Preview</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('raw')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              viewMode === 'raw' ? 'bg-surface-1 text-text-primary shadow-xs' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Code size={13} />
            <span>Raw Source</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-4xl mx-auto w-full">
        {viewMode === 'preview' ? (
          <div className="space-y-1">{renderMarkdown(content)}</div>
        ) : (
          <pre className="font-mono text-xs text-text-primary whitespace-pre-wrap">{content}</pre>
        )}
      </div>
    </div>
  );
};
