import React from 'react';
import { Lock } from 'lucide-react';
import { CodeGutterBar } from './CodeGutterBar';
import { CommitSheet } from './CommitSheet';
import { EditorHeader } from './EditorHeader';
import { EditorCanvas } from './EditorCanvas';
import { EditorDiscardDialog } from './EditorDiscardDialog';
import { useMobileFileEditor } from './useMobileFileEditor';

interface MobileFileEditorProps {
  filePath: string;
  initialContent: string;
  isOwner?: boolean;
  onClose: () => void;
  onCommitted: () => void;
}

export const MobileFileEditor: React.FC<MobileFileEditorProps> = ({
  filePath,
  initialContent,
  isOwner = true,
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
  } = useMobileFileEditor({ filePath, initialContent, isOwner, onClose, onCommitted });

  return (
    <div className="fixed inset-0 z-50 bg-background text-text-primary flex flex-col select-none overflow-hidden h-[100dvh]">
      {!isOwner && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-1.5 flex items-center justify-between text-xs text-amber-400 shrink-0">
          <div className="flex items-center gap-1.5 font-medium">
            <Lock size={13} />
            <span>Global repository · Read-only preview</span>
          </div>
          <span className="text-[11px] text-text-muted">Changes cannot be committed</span>
        </div>
      )}

      <EditorHeader
        filePath={filePath}
        editorMode={editorMode}
        wrapLines={wrapLines}
        isDirty={isDirty && isOwner}
        diffStats={diffStats}
        onCloseRequest={() => (isDirty && isOwner ? setShowDiscardConfirm(true) : onClose())}
        onSetEditorMode={setEditorMode}
        onToggleWrap={() => setWrapLines(!wrapLines)}
        onOpenCommitSheet={() => isOwner && setIsCommitSheetOpen(true)}
      />

      <EditorCanvas
        editorMode={editorMode}
        draftContent={draftContent}
        filePath={filePath}
        wrapLines={wrapLines}
        lineNumbers={lineNumbers}
        textareaRef={textareaRef}
        lineNumbersRef={lineNumbersRef}
        onChange={isOwner ? handleChange : () => {}}
        onScroll={handleScroll}
      />

      {editorMode === 'edit' && isOwner && (
        <CodeGutterBar
          onInsertSymbol={handleInsertSymbol}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={true}
          canRedo={true}
        />
      )}

      {isOwner && (
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
      )}

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
