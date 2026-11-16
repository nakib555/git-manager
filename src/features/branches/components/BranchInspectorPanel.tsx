import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeftRight,
  Check,
  ChevronRight,
  Copy,
  GitBranch,
  GitCommit,
  GitPullRequest,
  Lock,
  Shield,
  Trash2,
  X,
} from 'lucide-react';
import {
  BranchComparisonCommit,
  BranchComparisonResult,
  BranchProtectionSummary,
  EnrichedBranch,
  fetchBranchComparison,
  fetchBranchProtection,
} from '../branchInspectionService';
import { formatRelativeTime } from '../../../mobile/utils/formatters';

export type InspectorTab = 'overview' | 'commits' | 'compare';

interface BranchInspectorPanelProps {
  branch: EnrichedBranch | null;
  baseBranchName: string;
  owner: string | null;
  repo: string | null;
  token: string | null;
  activeCommits: any[];
  isSwitching: boolean;
  showCloseButton?: boolean;
  onClose?: () => void;
  onSwitchBranch: (branchName: string) => Promise<void> | void;
  onDeleteBranch: (branchName: string) => void;
  onCreatePR: (branchName: string) => void;
  onSelectCommit?: (commit: BranchComparisonCommit) => void;
}

export const BranchInspectorPanel: React.FC<BranchInspectorPanelProps> = ({
  branch,
  baseBranchName,
  owner,
  repo,
  token,
  activeCommits,
  isSwitching,
  showCloseButton = false,
  onClose,
  onSwitchBranch,
  onDeleteBranch,
  onCreatePR,
  onSelectCommit,
}) => {
  const [activeTab, setActiveTab] = useState<InspectorTab>('overview');
  const [copiedSha, setCopiedSha] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [comparison, setComparison] = useState<BranchComparisonResult | null>(null);
  const [protection, setProtection] = useState<BranchProtectionSummary | null>(null);

  useEffect(() => {
    if (!branch) {
      setComparison(null);
      setProtection(null);
      return;
    }

    const controller = new AbortController();
    let mounted = true;
    setIsLoadingDetails(true);

    Promise.all([
      fetchBranchComparison({
        owner,
        repo,
        baseBranch: baseBranchName,
        headBranch: branch.name,
        token,
        activeCommits,
        branchMeta: branch,
        signal: controller.signal,
      }),
      fetchBranchProtection({
        owner,
        repo,
        branchName: branch.name,
        isProtectedFlag: branch.isProtected,
        isDefault: branch.isDefault,
        token,
        signal: controller.signal,
      }),
    ])
      .then(([compRes, protRes]) => {
        if (!mounted) return;
        setComparison(compRes);
        setProtection(protRes);
        setIsLoadingDetails(false);
      })
      .catch((err) => {
        if (!mounted || err?.name === 'AbortError') return;
        setIsLoadingDetails(false);
      });

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [branch?.name, branch?.commitSha, baseBranchName, owner, repo, token]);

  const handleCopySha = () => {
    if (!branch?.shortSha) return;
    navigator.clipboard?.writeText(branch.commitSha || branch.shortSha).catch(() => {});
    setCopiedSha(true);
    window.setTimeout(() => setCopiedSha(false), 1600);
  };

  if (!branch) {
    return (
      <div className="h-full bg-surface-1 border border-border rounded-2xl p-6 flex flex-col items-center justify-center text-center">
        <div className="w-11 h-11 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-text-tertiary mb-3">
          <GitBranch size={20} />
        </div>
        <p className="text-sm font-semibold text-text-primary">Select a branch to inspect</p>
        <p className="text-xs text-text-secondary mt-1 max-w-[260px]">
          View commit divergence against {baseBranchName}, branch policies, and quick checkout actions.
        </p>
      </div>
    );
  }

  const aheadCount = comparison ? comparison.aheadBy : (branch.aheadBy ?? 0);
  const behindCount = comparison ? comparison.behindBy : (branch.behindBy ?? 0);
  const displayCommits = comparison?.commits?.length ? comparison.commits : [];

  return (
    <div className="h-full bg-surface-1 border border-border rounded-2xl flex flex-col overflow-hidden">
      {/* Inspector Header */}
      <div className="px-4 py-3.5 border-b border-border bg-surface-2/40 shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-text-tertiary">
                Branch Inspector
              </span>
              {branch.isActive && (
                <span className="text-[10px] font-mono font-semibold text-addition">
                  · Active HEAD
                </span>
              )}
              {branch.isDefault && (
                <span className="text-[10px] font-mono text-text-secondary">
                  · Default
                </span>
              )}
              {branch.isProtected && (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-text-secondary">
                  · <Lock size={10} /> Protected
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1 min-w-0">
              <GitBranch size={15} className={branch.isActive ? 'text-accent shrink-0' : 'text-text-secondary shrink-0'} />
              <h3 className="text-sm sm:text-base font-bold text-text-primary truncate font-mono">
                {branch.name}
              </h3>
            </div>

            {branch.shortSha && (
              <div className="flex items-center gap-2 mt-1.5 text-xs">
                <button
                  type="button"
                  onClick={handleCopySha}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-surface-2 border border-border hover:border-accent/50 text-[11px] font-mono text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                  title="Copy full commit SHA"
                >
                  <span className="tabular-nums">{branch.shortSha}</span>
                  {copiedSha ? (
                    <Check size={11} className="text-addition" />
                  ) : (
                    <Copy size={11} />
                  )}
                </button>
                {branch.relativeTime && (
                  <span className="text-[11px] text-text-tertiary truncate">
                    Updated {branch.relativeTime}
                  </span>
                )}
              </div>
            )}
          </div>

          {showCloseButton && onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close branch inspector"
              className="touch-target-44 w-9 h-9 rounded-xl bg-surface-1 border border-border hover:bg-surface-2 text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div
        role="tablist"
        aria-label="Branch inspector sections"
        className="flex border-b border-border bg-surface-1 px-2 shrink-0"
      >
        {(
          [
            { id: 'overview', label: 'Overview' },
            { id: 'commits', label: `Commits (${displayCommits.length})` },
            { id: 'compare', label: 'Compare & PR' },
          ] as { id: InspectorTab; label: string }[]
        ).map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex-1 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                isSelected
                  ? 'text-accent'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab.label}
              {isSelected && (
                <motion.div
                  layoutId="desktopBranchInspectorTab"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  className="absolute bottom-0 left-3 right-3 h-0.5 bg-accent rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Divergence & Lineage */}
            <div className="bg-surface-2/60 border border-border rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                  Divergence vs {baseBranchName}
                </span>
                {isLoadingDetails ? (
                  <span className="text-[11px] font-mono text-text-tertiary">Syncing compare…</span>
                ) : (
                  <span className="text-[11px] font-mono text-text-secondary capitalize">
                    {comparison?.status || 'aligned'}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-surface-1 border border-border rounded-lg p-2.5">
                  <span className="text-lg font-bold font-mono text-addition tabular-nums block">
                    {isLoadingDetails ? '—' : `↑ ${aheadCount}`}
                  </span>
                  <span className="text-[11px] text-text-tertiary">Commits ahead</span>
                </div>
                <div className="bg-surface-1 border border-border rounded-lg p-2.5">
                  <span className="text-lg font-bold font-mono text-text-secondary tabular-nums block">
                    {isLoadingDetails ? '—' : `↓ ${behindCount}`}
                  </span>
                  <span className="text-[11px] text-text-tertiary">Commits behind</span>
                </div>
              </div>

              <div className="bg-surface-1 border border-border rounded-lg px-3 py-2.5 flex items-center gap-3 text-xs font-mono">
                <ArrowLeftRight size={14} className="text-text-tertiary shrink-0" />
                <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
                  <span className="text-text-secondary truncate">
                    base: <strong className="text-text-primary">{baseBranchName}</strong>
                  </span>
                  <span className="text-text-tertiary shrink-0">→</span>
                  <span className="text-accent font-semibold truncate">{branch.name}</span>
                </div>
              </div>
            </div>

            {/* Latest Commit Tip */}
            <div className="bg-surface-2/60 border border-border rounded-xl p-3.5 space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary block">
                Head Revision Summary
              </span>
              <p className="text-xs font-semibold text-text-primary leading-relaxed text-pretty">
                {branch.lastCommitMsg}
              </p>
              <div className="flex items-center flex-wrap gap-2 text-[11px] text-text-tertiary font-mono">
                {branch.shortSha && <span className="text-accent tabular-nums">{branch.shortSha}</span>}
                {branch.lastCommitAuthor && (
                  <>
                    <span>·</span>
                    <span>{branch.lastCommitAuthor}</span>
                  </>
                )}
                {branch.relativeTime && (
                  <>
                    <span>·</span>
                    <span className="tabular-nums">{branch.relativeTime}</span>
                  </>
                )}
              </div>
            </div>

            {/* Branch Protection Ruleset */}
            <div className="bg-surface-2/60 border border-border rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary flex items-center gap-1.5">
                  <Shield size={12} /> Protection Policy
                </span>
                <span className="text-[10px] font-mono text-text-tertiary">
                  {protection?.source === 'github' ? 'GitHub Ruleset' : 'Branch Ref Policy'}
                </span>
              </div>

              <div className="divide-y divide-border text-xs">
                <div className="py-1.5 flex items-center justify-between gap-2">
                  <span className="text-text-secondary">Direct Push</span>
                  <span
                    className={`font-mono font-semibold ${
                      protection?.directPushAllowed ? 'text-addition' : 'text-warning'
                    }`}
                  >
                    {protection?.directPushAllowed ? 'Allowed' : 'Restricted'}
                  </span>
                </div>
                <div className="py-1.5 flex items-center justify-between gap-2">
                  <span className="text-text-secondary">Pull Request Review</span>
                  <span className="font-mono font-semibold text-text-primary">
                    {protection?.requiresPrReview
                      ? `Required (${Math.max(1, protection.requiredReviewsCount)} approval)`
                      : 'Optional'}
                  </span>
                </div>
                <div className="py-1.5 flex items-center justify-between gap-2">
                  <span className="text-text-secondary">Status Checks</span>
                  <span className="font-mono font-semibold text-text-primary">
                    {protection?.checksLabel || 'None required'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'commits' && (
          <div className="space-y-2">
            {isLoadingDetails ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded-xl bg-surface-2 ghost-shimmer border border-border" />
                ))}
              </div>
            ) : displayCommits.length === 0 ? (
              <div className="p-6 text-center bg-surface-2/50 border border-border rounded-xl">
                <GitCommit size={18} className="mx-auto text-text-tertiary mb-2" />
                <p className="text-xs font-medium text-text-secondary">
                  No unique commits found ahead of {baseBranchName}.
                </p>
              </div>
            ) : (
              displayCommits.map((commit, idx) => (
                <button
                  key={`${commit.hash}-${idx}`}
                  type="button"
                  onClick={() => onSelectCommit?.(commit)}
                  className="w-full text-left p-3 rounded-xl bg-surface-2/60 hover:bg-surface-2 border border-border flex items-start justify-between gap-2.5 transition-colors cursor-pointer"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-text-primary truncate">{commit.msg}</p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-text-tertiary">
                      <span className="text-accent font-semibold tabular-nums">
                        {commit.hash.slice(0, 7)}
                      </span>
                      <span>·</span>
                      <span className="truncate">{commit.author}</span>
                      {commit.timestamp && (
                        <>
                          <span>·</span>
                          <span className="tabular-nums shrink-0">
                            {formatRelativeTime(commit.timestamp, commit.time)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  {onSelectCommit && <ChevronRight size={14} className="text-text-tertiary shrink-0 mt-1" />}
                </button>
              ))
            )}
          </div>
        )}

        {activeTab === 'compare' && (
          <div className="space-y-3.5">
            <div className="bg-surface-2/60 border border-border rounded-xl p-3.5 space-y-2.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary block">
                Compare Branch Into {baseBranchName}
              </span>
              <p className="text-xs text-text-secondary leading-relaxed">
                Inspecting <span className="font-mono font-semibold text-accent">{branch.name}</span> against base{' '}
                <span className="font-mono font-semibold text-text-primary">{baseBranchName}</span>.
              </p>

              <div className="bg-surface-1 border border-border rounded-lg p-3 space-y-1.5 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-text-tertiary">Diff status</span>
                  <span className="font-semibold text-text-primary capitalize">
                    {isLoadingDetails ? 'Checking…' : comparison?.status || 'identical'}
                  </span>
                </div>
                {comparison?.filesCount !== null && comparison?.filesCount !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-text-tertiary">Changed files</span>
                    <span className="font-semibold text-text-primary tabular-nums">
                      {comparison.filesCount}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {branch.name !== baseBranchName ? (
              <button
                type="button"
                onClick={() => onCreatePR(branch.name)}
                className="w-full min-h-[42px] px-4 rounded-xl bg-text-primary text-background hover:opacity-90 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer btn-tactile shadow-xs"
              >
                <GitPullRequest size={15} />
                <span>Open Pull Request from {branch.name}</span>
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-surface-2/50 border border-border text-xs text-text-secondary text-center">
                {branch.name} is the base branch. Switch to or select a feature branch to open a PR.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-3.5 border-t border-border bg-surface-1 flex items-center gap-2.5 shrink-0">
        {!branch.isActive ? (
          <button
            type="button"
            disabled={isSwitching}
            onClick={() => onSwitchBranch(branch.name)}
            className="flex-1 min-h-[40px] px-4 rounded-xl bg-accent hover:bg-primary-hover text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer btn-tactile disabled:opacity-50"
          >
            <Check size={14} strokeWidth={2.5} />
            <span>{isSwitching ? 'Checking out…' : `Checkout ${branch.name}`}</span>
          </button>
        ) : (
          <div className="flex-1 min-h-[40px] px-4 rounded-xl bg-surface-2 border border-border text-addition text-xs font-bold flex items-center justify-center gap-2">
            <Check size={14} strokeWidth={2.5} />
            <span>Active HEAD Branch</span>
          </div>
        )}

        {!branch.isDefault && !branch.isActive && (
          <button
            type="button"
            onClick={() => onDeleteBranch(branch.name)}
            className="min-h-[40px] px-3.5 rounded-xl bg-surface-2 border border-border hover:border-danger/50 text-text-secondary hover:text-danger text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer btn-tactile"
            title={`Delete ${branch.name}`}
          >
            <Trash2 size={14} />
            <span>Delete</span>
          </button>
        )}
      </div>
    </div>
  );
};
