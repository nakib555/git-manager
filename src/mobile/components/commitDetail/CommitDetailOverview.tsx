import React from 'react';
import { Shield, ExternalLink, GitCommit } from 'lucide-react';
import { DetailedCommitInfo } from '../../utils/gitApi';
import { formatRelativeTime } from '../../utils/formatters';

interface CommitDetailOverviewProps {
  commit: any;
  detail: DetailedCommitInfo | null;
  htmlUrl?: string;
}

export const CommitDetailOverview: React.FC<CommitDetailOverviewProps> = ({
  commit,
  detail,
  htmlUrl,
}) => {
  const additions = detail?.stats?.additions ?? commit.add ?? 0;
  const deletions = detail?.stats?.deletions ?? commit.del ?? 0;
  const filesCount = detail?.files?.length ?? (additions > 0 || deletions > 0 ? 1 : 0);

  return (
    <div className="space-y-4 py-2">
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3 bg-main border border-border rounded-xl text-center">
          <span className="text-[10px] text-text-muted font-bold uppercase block">Additions</span>
          <span className="text-sm font-mono font-extrabold text-emerald-500 tabular-nums">+{additions}</span>
        </div>
        <div className="p-3 bg-main border border-border rounded-xl text-center">
          <span className="text-[10px] text-text-muted font-bold uppercase block">Deletions</span>
          <span className="text-sm font-mono font-extrabold text-rose-500 tabular-nums">-{deletions}</span>
        </div>
        <div className="p-3 bg-main border border-border rounded-xl text-center">
          <span className="text-[10px] text-text-muted font-bold uppercase block">Files Changed</span>
          <span className="text-sm font-mono font-extrabold text-primary tabular-nums">{filesCount}</span>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Author & Metadata</span>
        <div className="flex items-center gap-3">
          {commit.authorAvatar ? (
            <img src={commit.authorAvatar} alt={commit.author} className="w-10 h-10 rounded-full border border-border" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-hover text-text-muted flex items-center justify-center font-bold text-sm">
              {commit.author?.[0]?.toUpperCase() || 'A'}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <span className="font-semibold text-xs text-text-main block truncate">{commit.author}</span>
            <span className="text-[10px] text-text-muted block mt-0.5">
              Committed {formatRelativeTime(commit.timestamp || commit.date || Date.now())}
            </span>
          </div>
          {detail?.verified && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Shield size={11} /> Verified
            </span>
          )}
        </div>
      </div>

      {commit.parents && commit.parents.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-2">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Parent Commits</span>
          <div className="flex flex-wrap gap-2">
            {commit.parents.map((p: any) => {
              const pSha = typeof p === 'string' ? p : p.sha || '';
              return (
                <span key={pSha} className="font-mono text-[10px] px-2 py-1 rounded-md bg-main border border-border text-text-muted flex items-center gap-1">
                  <GitCommit size={10} className="text-primary" />
                  <span>{pSha.slice(0, 7)}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {htmlUrl && (
        <div className="pt-1">
          <a
            href={htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 rounded-xl border border-border bg-main hover:bg-hover text-xs font-semibold text-text-main flex items-center justify-center gap-2 transition-colors"
          >
            <ExternalLink size={13} />
            <span>View Commit on GitHub</span>
          </a>
        </div>
      )}
    </div>
  );
};
