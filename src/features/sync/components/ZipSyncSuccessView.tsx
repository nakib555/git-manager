import React from 'react';
import { CheckCircle2, GitCommit, GitPullRequest, ExternalLink } from 'lucide-react';

interface ZipSyncSuccessViewProps {
  success: {
    commitSha: string;
    branchName: string;
    prNumber?: number;
    prUrl?: string;
    htmlUrl: string;
  };
  onClose: () => void;
}

export const ZipSyncSuccessView: React.FC<ZipSyncSuccessViewProps> = ({
  success,
  onClose,
}) => {
  return (
    <div className="py-8 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto shadow-sm">
        <CheckCircle2 size={34} />
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-bold text-text-main">
          {success.prNumber ? 'Pull Request Opened Successfully!' : 'Commit Pushed Successfully!'}
        </h3>
        <p className="text-xs text-text-muted">
          All changes from your AI Studio package have been synchronized.
        </p>
      </div>

      <div className="p-4 bg-main border border-border rounded-xl text-left max-w-md mx-auto space-y-2 text-xs font-mono">
        <div className="flex justify-between items-center text-text-muted">
          <span>Branch:</span>
          <span className="text-text-main font-bold">{success.branchName}</span>
        </div>
        <div className="flex justify-between items-center text-text-muted">
          <span>Commit SHA:</span>
          <span className="text-primary font-bold">{success.commitSha.slice(0, 7)}</span>
        </div>
        {success.prNumber && (
          <div className="flex justify-between items-center text-text-muted">
            <span>Pull Request:</span>
            <span className="text-accent font-bold">#{success.prNumber}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        {success.htmlUrl && (
          <a
            href={success.prUrl || success.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-hover text-xs font-bold text-text-main flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink size={13} />
            <span>View on GitHub</span>
          </a>
        )}
        <button
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md shadow-primary/20 cursor-pointer"
        >
          Done
        </button>
      </div>
    </div>
  );
};
