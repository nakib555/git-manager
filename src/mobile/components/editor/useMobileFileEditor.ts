import { useState, useRef, useMemo } from 'react';
import { useAppContext } from '../../../AppContext';

export function useMobileFileEditor({
  filePath,
  initialContent,
  onClose,
  onCommitted,
}: {
  filePath: string;
  initialContent: string;
  onClose: () => void;
  onCommitted: () => void;
}) {
  const { currentBranch, activeBranches, githubUser, saveAndCommitFile } = useAppContext();

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

  const diffStats = useMemo(() => {
    const origLines = initialContent.split('\n');
    const currLines = draftContent.split('\n');
    let additions = Math.max(0, currLines.length - origLines.length);
    let deletions = Math.max(0, origLines.length - currLines.length);
    const minLen = Math.min(origLines.length, currLines.length);
    for (let i = 0; i < minLen; i++) {
      if (origLines[i] !== currLines[i]) {
        additions++;
        deletions++;
      }
    }
    if (isDirty && additions === 0 && deletions === 0) additions = 1;
    return { additions, deletions };
  }, [initialContent, draftContent, isDirty]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextVal = e.target.value;
    setDraftContent(nextVal);
    const newHistory = history.slice(0, historyIndex + 1);
    if (newHistory[newHistory.length - 1] !== nextVal) {
      setHistory([...newHistory, nextVal]);
      setHistoryIndex(newHistory.length);
    }
  };

  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

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
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + symbol.length, start + symbol.length);
    }, 0);
  };

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
  const lineNumbers = useMemo(() => Array.from({ length: lineCount }, (_, i) => i + 1), [lineCount]);
  const targetBranch = currentBranch || activeBranches.find((b) => b.isDefault)?.name || 'main';

  return {
    editorMode,
    draftContent,
    wrapLines,
    isCommitSheetOpen,
    isSubmitting,
    showDiscardConfirm,
    textareaRef,
    lineNumbersRef,
    isDirty,
    diffStats,
    lineNumbers,
    targetBranch,
    githubUser,
    setEditorMode,
    setWrapLines,
    setIsCommitSheetOpen,
    setShowDiscardConfirm,
    handleChange,
    handleScroll,
    handleInsertSymbol,
    handleUndo,
    handleRedo,
    handleExecuteCommit,
  };
}
