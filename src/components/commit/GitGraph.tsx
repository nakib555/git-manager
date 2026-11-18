import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { computeGitGraphLayout, GraphNode, BRANCH_LANE_COLORS, MERGE_COMMIT_COLOR } from '../../utils/gitGraphLayout';
import { GitGraphToolbar } from '../../features/gitGraph/components/GitGraphToolbar';
import { GitGraphTooltip } from '../../features/gitGraph/components/GitGraphTooltip';

export interface GitGraphProps {
  commits: any[];
  selectedHash?: string;
  selectedCommitId?: string;
  onSelectCommit?: (commit: any) => void;
  className?: string;
  isDesktop?: boolean;
}

export const GitGraph: React.FC<GitGraphProps> = ({
  commits, selectedHash, selectedCommitId, onSelectCommit, className = '', isDesktop = true,
}) => {
  const activeSelected = selectedHash || selectedCommitId;
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const layout = useMemo(() => {
    return computeGitGraphLayout(commits, {
      nodeSpacingY: isDesktop ? 40 : 44, laneSpacingX: isDesktop ? 26 : 24,
      paddingLeft: isDesktop ? 26 : 20, paddingTop: isDesktop ? 22 : 22,
    });
  }, [commits, isDesktop]);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const g = svg.select<SVGGElement>('#graph-content-group');
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 2.5])
      .on('zoom', (event) => g.attr('transform', event.transform.toString()));
    zoomBehaviorRef.current = zoom;
    svg.call(zoom);
    return () => { svg.on('.zoom', null); };
  }, []);

  const handleZoom = (by: number) => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(250).call(zoomBehaviorRef.current.scaleBy, by);
    }
  };

  const handleReset = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(350).call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
    }
  };

  return (
    <div ref={containerRef} className={`flex flex-col relative w-full h-full min-h-[148px] overflow-hidden bg-surface-1 select-none ${className}`}>
      <div className="flex items-center justify-between px-2.5 py-1 border-b border-border/70 bg-surface-2/40 shrink-0">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Branch Topology</span>
        <GitGraphToolbar onZoomIn={() => handleZoom(1.3)} onZoomOut={() => handleZoom(0.75)} onResetZoom={handleReset} />
      </div>
      <div className="relative flex-1 min-h-0 overflow-hidden">
      <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing">
        <defs>
          <radialGradient id="head-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2EA043" stopOpacity="0.6" /><stop offset="100%" stopColor="#2EA043" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g id="graph-content-group">
          {Array.from({ length: layout.lanesCount }).map((_, laneIdx) => (
            <line
              key={`guide-${laneIdx}`}
              x1={(isDesktop ? 26 : 20) + laneIdx * (isDesktop ? 26 : 24)}
              y1={12}
              x2={(isDesktop ? 26 : 20) + laneIdx * (isDesktop ? 26 : 24)}
              y2={layout.height}
              stroke={BRANCH_LANE_COLORS[laneIdx % BRANCH_LANE_COLORS.length]}
              strokeWidth="1.5" strokeDasharray="3 4" strokeOpacity="0.28"
            />
          ))}
          {layout.links.map((link) => (
            <path
              key={link.id} d={link.d} fill="none" stroke={link.color}
              strokeWidth={activeSelected === link.sourceHash || activeSelected === link.targetHash ? 3 : 2}
              strokeOpacity={0.85} strokeLinecap="round"
            />
          ))}
          {layout.nodes.map((node) => {
            const isSelected = activeSelected === node.hash || activeSelected === (node as any).fullHash;
            return (
              <g
                key={`node-${node.hash}`} transform={`translate(${node.x}, ${node.y})`} className="cursor-pointer"
                onClick={() => onSelectCommit?.(node.hash)}
                onMouseEnter={(e) => {
                  setHoveredNode(node);
                  const rect = containerRef.current?.getBoundingClientRect();
                  if (rect) {
                    const clampedX = Math.min(Math.max(12, e.clientX - rect.left), Math.max(12, rect.width - 230));
                    const clampedY = Math.min(Math.max(12, e.clientY - rect.top), Math.max(12, rect.height - 110));
                    setTooltipPos({ x: clampedX, y: clampedY });
                  }
                }}
                onMouseLeave={() => { setHoveredNode(null); setTooltipPos(null); }}
              >
                {node.isHead && <circle r="14" fill="url(#head-halo)" className="head-glow" />}
                {isSelected && <circle r="10" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" strokeOpacity="0.7" />}
                <circle
                  r={isSelected ? 6.5 : (node.isMerge ? 5.5 : 4.5)}
                  fill={node.isMerge ? MERGE_COMMIT_COLOR : node.color}
                  stroke="var(--color-surface-1)" strokeWidth="2"
                />
                <g transform={`translate(${Math.max(16, (layout.lanesCount - node.lane) * (isDesktop ? 26 : 24) + 6)}, 4)`}>
                  <rect
                    x="0" y="-12" width="54" height="18" rx="5"
                    fill="var(--color-surface-2)" stroke={node.color} strokeWidth="1" strokeOpacity="0.55"
                  />
                  <text x="27" y="0" textAnchor="middle" fill={node.color} fontSize="10" fontFamily="monospace" fontWeight="bold">{node.hash.slice(0, 7)}</text>
                  <text x="62" y="1" fill="var(--color-text-primary)" fontSize="11" fontWeight="600">{node.msg.slice(0, 32)}</text>
                </g>
              </g>
            );
          })}
        </g>
      </svg>
      <GitGraphTooltip node={hoveredNode} pos={tooltipPos} />
      </div>
    </div>
  );
};
