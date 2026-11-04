import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAppContext } from '../../../AppContext';
import { 
  FileCode, X, Check, ArrowLeft, AlertTriangle, 
  Eye, Edit3, WrapText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CodeGutterBar } from './CodeGutterBar';
import { CommitSheet } from './CommitSheet';

const getCodeLanguage = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'json':
      return 'json';
    case 'css':
      return 'css';
    case 'html':
      return 'markup';
    case 'md':
      return 'markdown';
    case 'py':
      return 'python';
    case 'rs':
      return 'rust';
    case 'go':
      return 'go';
    case 'sh':
      return 'bash';
    case 'yml':
    case 'yaml':
      return 'yaml';
    case 'sql':
      return 'sql';
    default:
      return 'text';
  }
};

interface MobileFileEditorProps {
  filePath: string;
  initialContent: string;
  onClose: () => void;
  onCommitted: () => void;
}

export const MobileFileEditor: React.FC<MobileFileEditorProps> = ({
  filePath,
  initialContent,
  onClose,
  onCommitted,
}) => {
  const { 
    currentBranch, 
    activeBranches, 
    githubUser, 
    saveAndCommitFile 
  } = useAppContext();

  const [editorMode, setEditorMode] = useState<'edit' | 'preview'>('edit');
  const [draftContent, setDraftContent] = useState<string>(initialContent);
  const [history, setHistory] = useState<string[]>([initialContent]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [wrapLines, setWrapLines] = useState<boolean>(false);
  const [isCommitSheetOpen, setIsCommitSheetOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const isDirty = draftContent !== initialContent;

  // Real-time line changes calculation
  const diffStats = useMemo(() => {
    const origLines = initialContent.split('\n');
    const currLines = draftContent.split('\n');

    let additions = 0;
    let deletions = 0;

    if (currLines.length > origLines.length) {
      additions = currLines.length - origLines.length;
    } else if (origLines.length > currLines.length) {
      deletions = origLines.length - currLines.length;
    }

    // Check line-by-line modifications
    const minLen = Math.min(origLines.length, currLines.length);
    for (let i = 0; i < minLen; i++) {
      if (origLines[i] !== currLines[i]) {
        additions++;
        deletions++;
      }
    }

    if (isDirty && additions === 0 && deletions === 0) {
      additions = 1;
    }

    return { additions, deletions };
  }, [initialContent, draftContent, isDirty]);

  // Handle textarea changes & update history stack
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextVal = e.target.value;
    setDraftContent(nextVal);

    // Debounce history recording
    const newHistory = history.slice(0, historyIndex + 1);
    if (newHistory[newHistory.length - 1] !== nextVal) {
      setHistory([...newHistory, nextVal]);
      setHistoryIndex(newHistory.length);
    }
  };

  // Sync line numbers scroll with textarea
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Quick symbol insertion at current cursor position
  const handleInsertSymbol = (symbol: string) => {
    const ta = textareaRef.current;
    if (!ta) return;

    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const text = draftContent;
    const nextText = text.substring(0, start) + symbol + text.substring(end);

    setDraftContent(nextText);
    const newHistory = history.slice(0, historyIndex + 1);
    setHistory([...newHistory, nextText]);
    setHistoryIndex(newHistory.length);

    // Restore focus and position cursor after inserted symbol
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + symbol.length, start + symbol.length);
    }, 0);
  };

  // Undo / Redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setDraftContent(history[prevIdx]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setDraftContent(history[nextIdx]);
    }
  };

  // Handle Close safely
  const handleRequestClose = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  // Execute Commit
  const handleExecuteCommit = async (params: { message: string; description?: string }) => {
    setIsSubmitting(true);
    try {
      const targetBranch = currentBranch || activeBranches.find((b) => b.isDefault)?.name || 'main';
      const success = await saveAndCommitFile({
        filePath,
        content: draftContent,
        message: params.message,
        description: params.description,
        branch: targetBranch,
      });

      if (success) {
        setIsCommitSheetOpen(false);
        onCommitted();
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const lineCount = draftContent.split('\n').length;
  const lineNumbers = useMemo(() => {
    return Array.from({ length: lineCount }, (_, i) => i + 1);
  }, [lineCount]);

  const targetBranch = currentBranch || activeBranches.find((b) => b.isDefault)?.name || 'main';
  const authorName = githubUser?.name || githubUser?.login || 'Local Developer';
  const authorAvatar = githubUser?.avatar_url;

  return (
    <div className="fixed inset-0 z-50 bg-background text-text-primary flex flex-col select-none overflow-hidden h-[100dvh]">
      {/* Top Header Bar (56px = 7x8pt) */}
      <header className="h-14 px-3 bg-surface-1 border-b border-border flex items-center justify-between shrink-0 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={handleRequestClose}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-surface-2 transition cursor-pointer active:scale-95 shrink-0"
            aria-label="Back / Cancel editing"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-text-primary truncate">
              <FileCode size={14} className="text-accent shrink-0" />
              <span className="truncate">{filePath.split('/').pop()}</span>
            </div>
            <div className="text-[10px] font-mono text-text-tertiary truncate">
              {filePath}
            </div>
          </div>
        </div>

        {/* Center: Edit vs Syntax-Highlighted Preview Toggle */}
        <div className="flex items-center bg-surface-2 p-0.5 rounded-xl border border-border text-xs shrink-0">
          <button
            type="button"
            onClick={() => setEditorMode('edit')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition font-semibold cursor-pointer ${
              editorMode === 'edit'
                ? 'bg-surface-1 text-text-primary shadow-2xs font-bold'
                : 'text-text-tertiary hover:text-text-primary'
            }`}
            title="Edit mode"
          >
            <Edit3 size={13} />
            <span>Edit</span>
          </button>
          <button
            type="button"
            onClick={() => setEditorMode('preview')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition font-semibold cursor-pointer ${
              editorMode === 'preview'
                ? 'bg-surface-1 text-accent shadow-2xs font-bold'
                : 'text-text-tertiary hover:text-text-primary'
            }`}
            title="Syntax highlighted preview"
          >
            <Eye size={13} />
            <span>Preview</span>
          </button>
        </div>

        {/* Right utility & Commit Button */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Wrap lines toggle */}
          <button
            type="button"
            onClick={() => setWrapLines(!wrapLines)}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition cursor-pointer ${
              wrapLines
                ? 'bg-accent/10 border-accent/40 text-accent font-bold'
                : 'bg-surface-2 border-border text-text-tertiary hover:text-text-primary'
            }`}
            title="Toggle word wrap"
            aria-label="Toggle word wrap"
          >
            <WrapText size={15} />
          </button>

          {/* Real-time Diff Pill */}
          {isDirty && (
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-surface-2 border border-border rounded-lg text-[11px] font-mono tabular-nums font-semibold">
              <span className="text-emerald-500">+{diffStats.additions}</span>
              <span className="text-rose-500">-{diffStats.deletions}</span>
            </div>
          )}

          {/* Save & Commit CTA (Min-h-[40px] = 5x8pt) */}
          <button
            type="button"
            onClick={() => setIsCommitSheetOpen(true)}
            className={`h-10 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs ${
              isDirty
                ? 'bg-accent hover:opacity-95 text-white'
                : 'bg-surface-2 text-text-tertiary border border-border hover:text-text-primary'
            }`}
            title="Save and commit changes compliant with GitHub guidelines"
          >
            <Check size={14} />
            <span>Save Changes</span>
          </button>
        </div>
      </header>

      {/* Main Code Editing Canvas or Syntax-Highlighted Preview */}
      {editorMode === 'edit' ? (
        <div className="flex-1 flex overflow-hidden relative font-mono text-xs bg-background">
          {/* Synchronized Line Numbers Gutter */}
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

          {/* Textarea Input */}
          <textarea
            ref={textareaRef}
            value={draftContent}
            onChange={handleChange}
            onScroll={handleScroll}
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
      ) : (
        <div className="flex-1 overflow-auto bg-background text-xs font-mono relative p-2">
          <div className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-md bg-surface-2/90 backdrop-blur-xs border border-border text-[10px] text-text-tertiary font-mono uppercase tracking-wider">
            {getCodeLanguage(filePath)}
          </div>
          <SyntaxHighlighter
            language={getCodeLanguage(filePath)}
            style={vscDarkPlus}
            showLineNumbers={true}
            wrapLines={wrapLines}
            customStyle={{
              margin: 0,
              padding: '12px',
              backgroundColor: 'transparent',
              fontSize: '11px',
              lineHeight: '1.6',
              fontFamily: 'monospace',
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
      )}

      {/* Bottom Quick-Symbol & Action Bar (only visible in Edit mode) */}
      {editorMode === 'edit' && (
        <CodeGutterBar
          onInsertSymbol={handleInsertSymbol}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
        />
      )}

      {/* Slide-Up Commit Sheet */}
      <CommitSheet
        isOpen={isCommitSheetOpen}
        onClose={() => setIsCommitSheetOpen(false)}
        onCommit={handleExecuteCommit}
        filePath={filePath}
        targetBranch={targetBranch}
        authorName={authorName}
        authorAvatar={authorAvatar}
        stats={diffStats}
        isSubmitting={isSubmitting}
      />

      {/* Discard Confirmation Dialog */}
      <AnimatePresence>
        {showDiscardConfirm && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="discard-title"
            className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-surface-1 border border-border rounded-2xl p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-amber-500">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 id="discard-title" className="text-sm font-bold text-text-primary">
                    Discard unsaved edits?
                  </h3>
                  <p className="text-xs text-text-tertiary mt-0.5">
                    You have uncommitted modifications to this file.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDiscardConfirm(false)}
                  className="flex-1 h-11 bg-surface-2 hover:bg-surface-3 text-text-primary font-semibold rounded-xl text-xs transition cursor-pointer"
                >
                  Keep editing
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDiscardConfirm(false);
                    onClose();
                  }}
                  className="flex-1 h-11 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Discard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
