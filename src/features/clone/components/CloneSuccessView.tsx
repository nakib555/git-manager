import React from 'react';
import { CheckCircle2, FolderGit2, ArrowRight, RotateCcw } from 'lucide-react';

interface CloneSuccessViewProps {
  repoName: string;
  destPath: string;
  onOpenRepo: () => void;
  onCloneAnother: () => void;
}

export const CloneSuccessView: React.FC<CloneSuccessViewProps> = ({
  repoName,
  destPath,
  onOpenRepo,
  onCloneAnother,
}) => {
  return (
    <div className="py-8 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto shadow-sm">
        <CheckCircle2 size={32} />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-base font-bold text-text-main">
          Repository Cloned Successfully!
        </h3>
        <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed">
          <span className="font-semibold text-text-main">{repoName}</span> has been extracted and mounted to your workspace.
        </p>
      </div>

      <div className="p-3 bg-main border border-border rounded-xl text-left max-w-md mx-auto font-mono text-[11px] text-text-muted space-y-1">
        <span className="block text-[9px] uppercase font-bold text-text-muted">Mounted Path:</span>
        <span className="text-text-main break-all">{destPath}</span>
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        <button
          onClick={onCloneAnother}
          className="px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-hover text-xs font-bold text-text-muted hover:text-text-main transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw size={13} />
          <span>Clone Another</span>
        </button>

        <button
          onClick={onOpenRepo}
          className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md shadow-primary/20 flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <FolderGit2 size={14} />
          <span>Open in Workspace</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};
