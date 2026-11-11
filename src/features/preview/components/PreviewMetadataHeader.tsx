import React from 'react';
import { Home, ShieldCheck, Lock, FileText, Image, Film, Music, Archive, Database, Box } from 'lucide-react';
import { PreviewCategory } from '../types/previewTypes';
import { formatBytes } from '../utils/formatters';

interface PreviewMetadataHeaderProps {
  repoName: string;
  filePath: string;
  category: PreviewCategory;
  displayName: string;
  sizeBytes?: number;
  isOwner?: boolean;
}

export const PreviewMetadataHeader: React.FC<PreviewMetadataHeaderProps> = ({
  repoName,
  filePath,
  category,
  displayName,
  sizeBytes,
  isOwner,
}) => {
  const getCategoryIcon = () => {
    switch (category) {
      case 'image': return <Image size={13} className="text-accent" />;
      case 'audio': return <Music size={13} className="text-accent" />;
      case 'video': return <Film size={13} className="text-accent" />;
      case 'archive': return <Archive size={13} className="text-accent" />;
      case 'sqlite': return <Database size={13} className="text-accent" />;
      case '3d': return <Box size={13} className="text-accent" />;
      default: return <FileText size={13} className="text-accent" />;
    }
  };

  return (
    <div className="flex items-center gap-2 text-xs text-text-secondary font-medium truncate pr-3">
      <Home size={13} className="text-accent shrink-0" />
      <span className="text-border">/</span>
      <span className="font-semibold text-text-primary shrink-0">{repoName}</span>
      <span className="text-border">/</span>
      <div className="flex items-center gap-1.5 truncate">
        {getCategoryIcon()}
        <span className="font-mono text-accent truncate">{filePath}</span>
      </div>
      <span className="text-border">·</span>
      <span className="text-[11px] text-text-tertiary whitespace-nowrap">{displayName}</span>
      {sizeBytes !== undefined && sizeBytes > 0 && (
        <>
          <span className="text-border">·</span>
          <span className="text-[11px] font-mono text-text-tertiary tabular-nums whitespace-nowrap">
            {formatBytes(sizeBytes)}
          </span>
        </>
      )}
    </div>
  );
};
