import React from 'react';
import { Cpu, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { CiCdPipelineFlow } from '../../../components/commit/CiCdStatus';

interface CommitDetailCiCdProps {
  commitSha: string;
}

export const CommitDetailCiCd: React.FC<CommitDetailCiCdProps> = ({ commitSha }) => {
  return (
    <div className="py-2 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
          <Cpu size={13} className="text-primary" />
          <span>Workflow Execution Pipeline</span>
        </span>
        <span className="text-[10px] font-mono text-text-muted font-bold">
          Ref: {commitSha.slice(0, 7)}
        </span>
      </div>

      <div className="bg-card border border-border rounded-xl p-3 shadow-xs">
        <CiCdPipelineFlow hash={commitSha} />
      </div>
    </div>
  );
};
