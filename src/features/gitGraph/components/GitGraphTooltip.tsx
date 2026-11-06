import React from 'react';
import { GraphNode } from '../../../utils/gitGraphLayout';
import { GitCommit, User, Clock } from 'lucide-react';

interface GitGraphTooltipProps {
  node: GraphNode | null;
  pos: { x: number; y: number } | null;
}

export const GitGraphTooltip: React.FC<GitGraphTooltipProps> = ({ node, pos }) => {
  if (!node || !pos) return null;

  return (
    <div
      style={{ left: `${pos.x + 12}px`, top: `${pos.y - 10}px` }}
      className="absolute z-30 pointer-events-none bg-card/95 backdrop-blur-sm border border-border rounded-xl p-3 shadow-xl text-xs space-y-1.5 max-w-xs animate-fade-in"
    >
      <div className="flex items-center gap-2">
        <span
          className="font-mono text-[10px] px-1.5 py-0.5 rounded border"
          style={{ borderColor: node.color, color: node.color }}
        >
          {node.hash.slice(0, 7)}
        </span>
        {(node as any).branch && (
          <span className="text-[10px] text-text-muted bg-main px-1.5 py-0.5 rounded truncate max-w-[120px]">
            {(node as any).branch}
          </span>
        )}
      </div>

      <p className="font-semibold text-text-main line-clamp-2 leading-snug">
        {node.msg}
      </p>

      <div className="flex items-center gap-3 text-[10px] text-text-muted pt-1 border-t border-border/50">
        <span className="flex items-center gap-1">
          <User size={10} />
          <span className="truncate max-w-[80px]">{node.author}</span>
        </span>
        <span className="flex items-center gap-1">
          <Clock size={10} />
          <span>{node.time}</span>
        </span>
      </div>
    </div>
  );
};
