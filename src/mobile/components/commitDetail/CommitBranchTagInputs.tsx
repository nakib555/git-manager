import React from 'react';
import { GitBranch, Tag } from 'lucide-react';

interface CommitBranchTagInputsProps {
  branchName: string;
  setBranchName: (val: string) => void;
  tagName: string;
  setTagName: (val: string) => void;
  onBranchCreate: () => void;
  onTagCreate: () => void;
}

export const CommitBranchTagInputs: React.FC<CommitBranchTagInputsProps> = ({
  branchName,
  setBranchName,
  tagName,
  setTagName,
  onBranchCreate,
  onTagCreate,
}) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2 p-3 bg-main border border-border rounded-xl">
        <span className="text-[10px] font-bold text-text-muted uppercase flex items-center gap-1">
          <GitBranch size={11} className="text-primary" /> Branch Here
        </span>
        <div className="flex gap-1.5">
          <input
            type="text"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
            placeholder="branch-name"
            className="flex-1 bg-card border border-border rounded-lg px-2 py-1 text-xs text-text-main outline-none focus:border-primary font-mono"
          />
          <button
            onClick={onBranchCreate}
            disabled={!branchName.trim()}
            className="px-2.5 py-1 bg-primary text-white text-xs font-bold rounded-lg disabled:opacity-40 cursor-pointer"
          >
            Add
          </button>
        </div>
      </div>

      <div className="space-y-2 p-3 bg-main border border-border rounded-xl">
        <span className="text-[10px] font-bold text-text-muted uppercase flex items-center gap-1">
          <Tag size={11} className="text-amber-400" /> Tag Here
        </span>
        <div className="flex gap-1.5">
          <input
            type="text"
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
            placeholder="v1.0.0"
            className="flex-1 bg-card border border-border rounded-lg px-2 py-1 text-xs text-text-main outline-none focus:border-primary font-mono"
          />
          <button
            onClick={onTagCreate}
            disabled={!tagName.trim()}
            className="px-2.5 py-1 bg-amber-500 text-white text-xs font-bold rounded-lg disabled:opacity-40 cursor-pointer"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};
