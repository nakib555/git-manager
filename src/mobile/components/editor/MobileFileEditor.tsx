import React from 'react';
import { CodeGutterBar } from './CodeGutterBar';
import { CommitSheet } from './CommitSheet';
import { EditorHeader } from './EditorHeader';
import { EditorCanvas } from './EditorCanvas';
import { EditorDiscardDialog } from './EditorDiscardDialog';
import { useMobileFileEditor } from './useMobileFileEditor';

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
  } = useMobileFileEditor({ filePath, initialContent, onClose, onCommitted });

  return (
    <div className="fixed inset-0 z-50 bg-background text-text-primary flex flex-col select-none overflow-hidden h-[100dvh]">
      <EditorHeader
        filePath={filePath}
        editorMode={editorMode}
        wrapLines={wrapLines}
        isDirty={isDirty}
        diffStats={diffStats}
        onCloseRequest={() => (isDirty ? setShowDiscardConfirm(true) : onClose())}
        onSetEditorMode={setEditorMode}
        onToggleWrap={() => setWrapLines(!wrapLines)}
        onOpenCommitSheet={() => setIsCommitSheetOpen(true)}
      />

      <EditorCanvas
        editorMode={editorMode}
        draftContent={draftContent}
        filePath={filePath}
        wrapLines={wrapLines}
        lineNumbers={lineNumbers}
        textareaRef={textareaRef}
        lineNumbersRef={lineNumbersRef}
        onChange={handleChange}
        onScroll={handleScroll}
      />

      {editorMode === 'edit' && (
        <CodeGutterBar
          onInsertSymbol={handleInsertSymbol}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={true}
          canRedo={true}
        />
      )}

      <CommitSheet
        isOpen={isCommitSheetOpen}
        onClose={() => setIsCommitSheetOpen(false)}
        onCommit={handleExecuteCommit}
        filePath={filePath}
        targetBranch={targetBranch}
        authorName={githubUser?.name || githubUser?.login || 'Local Developer'}
        authorAvatar={githubUser?.avatar_url}
        stats={diffStats}
        isSubmitting={isSubmitting}
      />

      <EditorDiscardDialog
        isOpen={showDiscardConfirm}
        onCancel={() => setShowDiscardConfirm(false)}
        onConfirmDiscard={() => {
          setShowDiscardConfirm(false);
          onClose();
        }}
      />
    </div>
  );
};
