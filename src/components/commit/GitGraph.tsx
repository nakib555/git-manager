import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  computeGitGraphLayout, 
  GraphNode, 
  BRANCH_LANE_COLORS, 
  MERGE_COMMIT_COLOR 
} from '../../utils/gitGraphLayout';
import { GitCommitNode } from '../../types';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  GitMerge, 
  GitCommit, 
  Clock, 
  User, 
  Tag, 
  ExternalLink 
} from 'lucide-react';

export interface GitGraphProps {
  commits: (GitCommitNode | any)[];
  selectedCommitId?: string;
  onSelectCommit?: (commit: any) => void;
  className?: string;
  isDesktop?: boolean;
}

export const GitGraph: React.FC<GitGraphProps> = ({
  commits,
  selectedCommitId,
  onSelectCommit,
  className = '',
  isDesktop = true,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Compute graph geometry responsive to mobile and desktop
  const layout = useMemo(() => {
    return computeGitGraphLayout(commits, {
      nodeSpacingY: isDesktop ? 62 : 52,
      laneSpacingX: isDesktop ? 36 : 24,
      paddingLeft: isDesktop ? 48 : 24,
      paddingTop: isDesktop ? 40 : 28,
    });
  }, [commits, isDesktop]);

  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // Initialize D3 Zoom and Pan behavior
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const g = svg.select<SVGGElement>('#graph-content-group');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.4, 2.5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform.toString());
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom);

    return () => {
      svg.on('.zoom', null);
    };
  }, []);

  // Zoom control handlers
  const handleZoomIn = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(300)
      .call(zoomBehaviorRef.current.scaleBy, 1.3);
  };

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(300)
      .call(zoomBehaviorRef.current.scaleBy, 0.75);
  };

  const handleResetZoom = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(400)
      .call(zoomBehaviorRef.current.transform, d3.zoomIdentity.translate(0, 0).scale(1));
  };

  const handleFitToView = () => {
    if (!svgRef.current || !zoomBehaviorRef.current || !containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth || 600;
    const containerHeight = containerRef.current.clientHeight || 500;
    const scale = Math.min(
      containerWidth / (layout.width || 600),
      containerHeight / (layout.height || 500),
      1.1
    );
    const safeScale = Math.max(0.4, Math.min(scale, 1.2));
    
    d3.select(svgRef.current)
      .transition()
      .duration(450)
      .call(
        zoomBehaviorRef.current.transform,
        d3.zoomIdentity.translate(16, 20).scale(safeScale)
      );
  };

  return (
    <div 
      ref={containerRef}
      className={`relative flex flex-col w-full h-full bg-main/50 border border-border rounded-xl overflow-hidden select-none ${className}`}
    >
      {/* Top Toolbar: Legend & Zoom Controls */}
      <div className="shrink-0 flex items-center justify-between px-3.5 py-2.5 bg-card border-b border-border text-xs z-10">
        {/* Branch lanes legend */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider hidden sm:inline">
            Topology Legend
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: BRANCH_LANE_COLORS[0] }} />
            <span className="text-[11px] text-text-main font-medium">Main</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: BRANCH_LANE_COLORS[1] }} />
            <span className="text-[11px] text-text-main font-medium">Feature</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border border-purple-400" style={{ backgroundColor: MERGE_COMMIT_COLOR }} />
            <span className="text-[11px] text-text-main font-medium">Merge</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full ring-2 ring-emerald-400 ring-offset-1 ring-offset-card" style={{ backgroundColor: '#2EA043' }} />
            <span className="text-[11px] text-text-main font-medium">HEAD</span>
          </div>
        </div>

        {/* Zoom & Reset Toolbar */}
        <div className="flex items-center gap-1 bg-main border border-border/80 rounded-lg p-0.5">
          <button
            type="button"
            onClick={handleZoomIn}
            title="Zoom In"
            className="w-6 h-6 flex items-center justify-center text-text-muted hover:text-text-main hover:bg-hover/20 rounded transition-colors cursor-pointer"
          >
            <ZoomIn size={13} />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out"
            className="w-6 h-6 flex items-center justify-center text-text-muted hover:text-text-main hover:bg-hover/20 rounded transition-colors cursor-pointer"
          >
            <ZoomOut size={13} />
          </button>
          <button
            type="button"
            onClick={handleFitToView}
            title="Fit to Screen"
            className="w-6 h-6 flex items-center justify-center text-text-muted hover:text-text-main hover:bg-hover/20 rounded transition-colors cursor-pointer"
          >
            <Maximize2 size={12} />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            title="Reset View"
            className="w-6 h-6 flex items-center justify-center text-text-muted hover:text-text-main hover:bg-hover/20 rounded transition-colors cursor-pointer"
          >
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      {/* Main SVG Interactive Graph */}
      <div className="relative flex-1 w-full h-full overflow-hidden cursor-grab active:cursor-grabbing">
        {layout.nodes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-text-muted">
            <GitCommit size={36} className="mb-2 opacity-40 text-text-muted" />
            <span className="text-sm font-semibold text-text-main">No Commits Recorded</span>
            <span className="text-xs mt-1">Make a commit or sync with GitHub to populate the visual DAG.</span>
          </div>
        ) : (
          <svg
            ref={svgRef}
            className="w-full h-full block"
            style={{ minHeight: '100%' }}
          >
            <defs>
              {/* Radial glow for HEAD commit */}
              <radialGradient id="head-halo" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#2EA043" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#2EA043" stopOpacity="0" />
              </radialGradient>
              {/* Radial glow for selected commit */}
              <radialGradient id="selected-halo" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#58A6FF" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#58A6FF" stopOpacity="0" />
              </radialGradient>
            </defs>

            <g id="graph-content-group">
              {/* Background Lane Guide Rails */}
              {Array.from({ length: layout.lanesCount }).map((_, laneIdx) => {
                const laneX = (isDesktop ? 48 : 24) + laneIdx * (isDesktop ? 36 : 24);
                const laneColor = BRANCH_LANE_COLORS[laneIdx % BRANCH_LANE_COLORS.length];
                return (
                  <line
                    key={`lane-guide-${laneIdx}`}
                    x1={laneX}
                    y1={20}
                    x2={laneX}
                    y2={layout.height}
                    stroke={laneColor}
                    strokeWidth="1.5"
                    strokeDasharray="3 4"
                    strokeOpacity="0.25"
                  />
                );
              })}

              {/* Bézier Links / Edges */}
              {layout.links.map((link) => {
                const isSelected = 
                  selectedCommitId === link.sourceHash || 
                  selectedCommitId === link.targetHash;

                return (
                  <path
                    key={link.id}
                    d={link.d}
                    fill="none"
                    stroke={link.color}
                    strokeWidth={isSelected ? 3.5 : (link.isMergeLink ? 2.5 : 2)}
                    strokeOpacity={isSelected ? 1 : 0.75}
                    strokeLinecap="round"
                    className="transition-all duration-150"
                  />
                );
              })}

              {/* Commit Nodes & Labels */}
              {layout.nodes.map((node) => {
                const isSelected = selectedCommitId === node.hash;
                const isHovered = hoveredNode?.hash === node.hash;

                return (
                  <g
                    key={`node-${node.hash}`}
                    transform={`translate(${node.x}, ${node.y})`}
                    className="cursor-pointer group"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectCommit) {
                        onSelectCommit(node);
                      }
                    }}
                    onMouseEnter={(e) => {
                      setHoveredNode(node);
                      const rect = containerRef.current?.getBoundingClientRect();
                      if (rect) {
                        setTooltipPos({
                          x: e.clientX - rect.left,
                          y: e.clientY - rect.top,
                        });
                      }
                    }}
                    onMouseLeave={() => {
                      setHoveredNode(null);
                      setTooltipPos(null);
                    }}
                  >
                    {/* Pulsing halo ring for HEAD commit */}
                    {node.isHead && (
                      <circle
                        r="18"
                        fill="url(#head-halo)"
                        className="animate-pulse"
                      />
                    )}

                    {/* Selected halo ring */}
                    {isSelected && (
                      <circle
                        r="16"
                        fill="url(#selected-halo)"
                        className="animate-ping opacity-60"
                      />
                    )}

                    {/* Node Circle */}
                    {node.isMerge ? (
                      // Merge commit: double concentric circles
                      <g>
                        <circle
                          r="9"
                          fill="var(--color-card, #161b22)"
                          stroke={MERGE_COMMIT_COLOR}
                          strokeWidth="2.5"
                        />
                        <circle
                          r="4.5"
                          fill={MERGE_COMMIT_COLOR}
                        />
                      </g>
                    ) : (
                      // Standard commit circle
                      <circle
                        r={isSelected ? 8 : (isHovered ? 7.5 : 6)}
                        fill={node.color}
                        stroke="var(--color-card, #161b22)"
                        strokeWidth="2.5"
                        className="transition-all duration-150 group-hover:stroke-text-main"
                      />
                    )}

                    {/* Commit Row Meta: SHA + Message + Author */}
                    <g transform={`translate(${Math.max(20, (layout.lanesCount - node.lane) * (isDesktop ? 36 : 24) + 8)}, 4)`}>
                      {/* Short SHA Badge */}
                      <rect
                        x="0"
                        y="-12"
                        width="54"
                        height="18"
                        rx="4"
                        fill={isSelected ? node.color : 'rgba(255, 255, 255, 0.05)'}
                        stroke={node.color}
                        strokeWidth="1"
                        strokeOpacity="0.5"
                      />
                      <text
                        x="27"
                        y="0"
                        textAnchor="middle"
                        fill={isSelected ? '#ffffff' : node.color}
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="600"
                        className="pointer-events-none select-none"
                      >
                        {node.hash}
                      </text>

                      {/* Commit Message */}
                      <text
                        x="64"
                        y="0"
                        fill={isSelected ? 'var(--color-text-main, #ffffff)' : 'var(--color-text-main, #c9d1d9)'}
                        fontSize="12"
                        fontWeight={isSelected ? '700' : '500'}
                        className="pointer-events-none select-none group-hover:fill-primary transition-colors"
                      >
                        {node.msg.length > (isDesktop ? 45 : 24)
                          ? `${node.msg.substring(0, isDesktop ? 45 : 24)}…`
                          : node.msg}
                      </text>

                      {/* Author + Timestamp label */}
                      <text
                        x={isDesktop ? 390 : 250}
                        y="0"
                        fill="var(--color-text-muted, #8b949e)"
                        fontSize="10"
                        className="pointer-events-none select-none hidden md:inline"
                      >
                        {node.author} • {node.time}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
          </svg>
        )}

        {/* Hover Tooltip Card */}
        {hoveredNode && tooltipPos && (
          <div
            className="absolute pointer-events-none z-30 bg-card/95 backdrop-blur-md border border-border p-3 rounded-xl shadow-xl space-y-2 text-xs max-w-xs transition-opacity duration-150"
            style={{
              left: `${Math.min(tooltipPos.x + 18, (containerRef.current?.clientWidth || 500) - 280)}px`,
              top: `${Math.min(tooltipPos.y - 12, (containerRef.current?.clientHeight || 400) - 160)}px`,
            }}
          >
            <div className="flex items-center justify-between border-b border-border/60 pb-1.5 gap-2">
              <span className="font-mono text-[11px] font-bold text-primary flex items-center gap-1">
                <Tag size={11} /> {hoveredNode.hash}
              </span>
              {hoveredNode.isMerge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400 border border-purple-500/30">
                  Merge Commit
                </span>
              )}
              {hoveredNode.isHead && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Branch HEAD
                </span>
              )}
            </div>

            <p className="font-semibold text-text-main text-xs line-clamp-2">
              "{hoveredNode.msg}"
            </p>

            <div className="space-y-1 text-[11px] text-text-muted pt-1">
              <div className="flex items-center gap-1.5">
                <User size={12} className="text-text-muted" />
                <span className="text-text-main font-medium">{hoveredNode.author}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={12} className="text-text-muted" />
                <span>{hoveredNode.time || new Date(hoveredNode.timestamp).toLocaleDateString()}</span>
              </div>
              {hoveredNode.parents.length > 0 && (
                <div className="flex items-center gap-1.5 font-mono text-[10px]">
                  <GitMerge size={12} className="text-text-muted" />
                  <span>Parents: {hoveredNode.parents.join(', ')}</span>
                </div>
              )}
              {(hoveredNode.add || hoveredNode.del) && (
                <div className="flex items-center gap-2 pt-0.5 font-mono text-[11px]">
                  <span className="text-emerald-500 font-bold">{hoveredNode.add || '+0'}</span>
                  <span className="text-rose-500 font-bold">{hoveredNode.del || '-0'}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
