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
      nodeSpacingY: isDesktop ? 60 : 50, laneSpacingX: isDesktop ? 32 : 24,
      paddingLeft: isDesktop ? 40 : 20, paddingTop: isDesktop ? 36 : 24,
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
    <div ref={containerRef} className={`relative w-full h-full min-h-[300px] overflow-hidden bg-main/30 select-none ${className}`}>
      <GitGraphToolbar onZoomIn={() => handleZoom(1.3)} onZoomOut={() => handleZoom(0.75)} onResetZoom={handleReset} />
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
              x1={(isDesktop ? 40 : 20) + laneIdx * (isDesktop ? 32 : 24)}
              y1={20}
              x2={(isDesktop ? 40 : 20) + laneIdx * (isDesktop ? 32 : 24)}
              y2={layout.height}
              stroke={BRANCH_LANE_COLORS[laneIdx % BRANCH_LANE_COLORS.length]}
              strokeWidth="1.5" strokeDasharray="3 4" strokeOpacity="0.25"
            />
          ))}
          {layout.links.map((link) => (
            <path
              key={link.id} d={link.d} fill="none" stroke={link.color}
              strokeWidth={activeSelected === link.sourceHash || activeSelected === link.targetHash ? 3.5 : 2}
              strokeOpacity={0.8} strokeLinecap="round"
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
                  if (rect) setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                }}
                onMouseLeave={() => { setHoveredNode(null); setTooltipPos(null); }}
              >
                {node.isHead && <circle r="16" fill="url(#head-halo)" className="animate-pulse" />}
                <circle
                  r={isSelected ? 8 : (node.isMerge ? 6 : 5)}
                  fill={node.isMerge ? MERGE_COMMIT_COLOR : node.color}
                  stroke="var(--card, #161b22)" strokeWidth="2.5"
                />
                <g transform={`translate(${Math.max(16, (layout.lanesCount - node.lane) * (isDesktop ? 32 : 24) + 6)}, 4)`}>
                  <rect x="0" y="-12" width="54" height="18" rx="4" fill="rgba(255,255,255,0.06)" stroke={node.color} strokeWidth="1" strokeOpacity="0.6" />
                  <text x="27" y="0" textAnchor="middle" fill={node.color} fontSize="10" fontFamily="monospace" fontWeight="bold">{node.hash.slice(0, 7)}</text>
                  <text x="62" y="1" fill="currentColor" fontSize="11" fontWeight="600" className="text-text-main">{node.msg.slice(0, 32)}</text>
                </g>
              </g>
            );
          })}
        </g>
      </svg>
      <GitGraphTooltip node={hoveredNode} pos={tooltipPos} />
    </div>
  );
};
