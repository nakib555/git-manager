import React from 'react';
import { FileCode, ArrowLeft, Edit3, Eye, WrapText, Check } from 'lucide-react';

interface EditorHeaderProps {
  filePath: string;
  editorMode: 'edit' | 'preview';
  wrapLines: boolean;
  isDirty: boolean;
  diffStats: { additions: number; deletions: number };
  onCloseRequest: () => void;
  onSetEditorMode: (mode: 'edit' | 'preview') => void;
  onToggleWrap: () => void;
  onOpenCommitSheet: () => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  filePath,
  editorMode,
  wrapLines,
  isDirty,
  diffStats,
  onCloseRequest,
  onSetEditorMode,
  onToggleWrap,
  onOpenCommitSheet,
}) => {
  return (
    <header className="h-14 px-3 bg-surface-1 border-b border-border flex items-center justify-between shrink-0 gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={onCloseRequest}
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
          <div className="text-[10px] font-mono text-text-tertiary truncate">{filePath}</div>
        </div>
      </div>

      <div className="flex items-center bg-surface-2 p-0.5 rounded-xl border border-border text-xs shrink-0">
        <button
          type="button"
          onClick={() => onSetEditorMode('edit')}
          className={`flex items-center justify-center w-8 h-8 rounded-lg transition font-semibold cursor-pointer ${
            editorMode === 'edit'
              ? 'bg-surface-1 text-text-primary shadow-2xs font-bold'
              : 'text-text-tertiary hover:text-text-primary'
          }`}
          title="Edit mode"
        >
          <Edit3 size={14} />
        </button>
        <button
          type="button"
          onClick={() => onSetEditorMode('preview')}
          className={`flex items-center justify-center w-8 h-8 rounded-lg transition font-semibold cursor-pointer ${
            editorMode === 'preview'
              ? 'bg-surface-1 text-accent shadow-2xs font-bold'
              : 'text-text-tertiary hover:text-text-primary'
          }`}
          title="Syntax highlighted preview"
        >
          <Eye size={14} />
        </button>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={onToggleWrap}
          className={`w-8 h-8 rounded-xl border flex items-center justify-center transition cursor-pointer ${
            wrapLines
              ? 'bg-accent/10 border-accent/40 text-accent font-bold'
              : 'bg-surface-2 border-border text-text-tertiary hover:text-text-primary'
          }`}
          title="Toggle word wrap"
        >
          <WrapText size={14} />
        </button>

        {isDirty && (
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-surface-2 border border-border rounded-lg text-[11px] font-mono tabular-nums font-semibold">
            <span className="text-emerald-500">+{diffStats.additions}</span>
            <span className="text-rose-500">-{diffStats.deletions}</span>
          </div>
        )}

        <button
          type="button"
          onClick={onOpenCommitSheet}
          className={`h-8 w-8 sm:w-auto sm:px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs ${
            isDirty
              ? 'bg-accent hover:opacity-95 text-white'
              : 'bg-surface-2 text-text-tertiary border border-border hover:text-text-primary'
          }`}
          title="Save and commit changes"
        >
          <Check size={15} />
          <span className="hidden sm:inline">Save</span>
        </button>
      </div>
    </header>
  );
};
