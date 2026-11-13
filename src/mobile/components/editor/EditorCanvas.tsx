import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs, vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { getCodeLanguage } from '../../screens/repo/files/fileLanguageUtils';
import { useAppContext } from '../../../AppContext';

interface EditorCanvasProps {
  editorMode: 'edit' | 'preview';
  draftContent: string;
  filePath: string;
  wrapLines: boolean;
  lineNumbers: number[];
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  lineNumbersRef: React.RefObject<HTMLDivElement | null>;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onScroll: () => void;
}

export const EditorCanvas: React.FC<EditorCanvasProps> = ({
  editorMode,
  draftContent,
  filePath,
  wrapLines,
  lineNumbers,
  textareaRef,
  lineNumbersRef,
  onChange,
  onScroll,
}) => {
  const { theme } = useAppContext();
  const isDark = theme !== 'light';

  if (editorMode === 'edit') {
    return (
      <div className="flex-1 flex overflow-hidden relative font-mono text-xs bg-background">
        <div
          ref={lineNumbersRef}
          aria-hidden="true"
          className="w-12 py-3 bg-surface-1/50 border-r border-border text-text-tertiary text-right select-none overflow-hidden shrink-0 font-mono text-[11px] leading-[1.6]"
        >
          {lineNumbers.map((num) => (
            <div key={num} className="pr-2.5">
              {num}
            </div>
          ))}
        </div>

        <textarea
          ref={textareaRef}
          value={draftContent}
          onChange={onChange}
          onScroll={onScroll}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          wrap={wrapLines ? 'soft' : 'off'}
          className={`flex-1 p-3 bg-transparent text-text-primary outline-none resize-none font-mono text-[11px] leading-[1.6] overflow-auto focus:ring-0 ${
            wrapLines ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'
          }`}
          placeholder="// Enter file content..."
        />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-background text-xs font-mono relative p-2">
      <div className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-md bg-surface-2/90 backdrop-blur-xs border border-border text-[10px] text-text-tertiary font-mono uppercase tracking-wider">
        {getCodeLanguage(filePath)}
      </div>
      <SyntaxHighlighter
        language={getCodeLanguage(filePath)}
        style={isDark ? vscDarkPlus : vs}
        showLineNumbers={true}
        wrapLines={wrapLines}
        wrapLongLines={wrapLines}
        customStyle={{
          margin: 0,
          padding: '12px',
          backgroundColor: 'transparent',
          fontSize: '11px',
          lineHeight: '1.6',
          fontFamily: 'monospace',
          whiteSpace: wrapLines ? 'pre-wrap' : 'pre',
          wordBreak: wrapLines ? 'break-word' : 'normal',
        }}
        lineNumberStyle={{
          color: '#64748b',
          paddingRight: '12px',
          minWidth: '2.5rem',
          userSelect: 'none',
          opacity: 0.6,
        }}
      >
        {draftContent || '// Empty file'}
      </SyntaxHighlighter>
    </div>
  );
};
