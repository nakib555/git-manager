import React from 'react';
import { Check, X, RefreshCw, Clock } from 'lucide-react';
import { useCiCdStatus } from '../hooks/useCiCdStatus';

interface CiCdStatusBadgeProps {
  hash: string;
  className?: string;
  isCompact?: boolean;
}

export const CiCdStatusBadge: React.FC<CiCdStatusBadgeProps> = ({ hash, className = '', isCompact = false }) => {
  const { cicd } = useCiCdStatus(hash);

  if (isCompact) {
    return (
      <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full ${cicd.badgeBg} ${className}`} title={cicd.label}>
        {cicd.status === 'success' && <Check size={9} className="text-emerald-500 stroke-[3]" />}
        {cicd.status === 'failed' && <X size={9} className="text-rose-500 stroke-[3]" />}
        {cicd.status === 'running' && <RefreshCw size={9} className="text-amber-500 animate-spin" />}
        {cicd.status === 'pending' && <Clock size={9} className="text-text-muted" />}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border font-mono ${cicd.color} ${className}`}
    >
      {cicd.status === 'success' && <Check size={11} className="stroke-[3]" />}
      {cicd.status === 'failed' && <X size={11} className="stroke-[3]" />}
      {cicd.status === 'running' && <RefreshCw size={11} className="animate-spin" />}
      {cicd.status === 'pending' && <Clock size={11} />}
      <span>{cicd.label}</span>
    </span>
  );
};
