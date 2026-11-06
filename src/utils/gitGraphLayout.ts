import { GitCommitNode } from '../types';
import { GraphNode, GraphLink, GitGraphLayoutResult, BRANCH_LANE_COLORS, MERGE_COMMIT_COLOR } from './gitGraphTypes';
import { assignCommitLanes } from './gitGraphLaneAllocator';

export * from './gitGraphTypes';

export function computeGitGraphLayout(
  commits: (GitCommitNode | any)[],
  options: {
    nodeSpacingY?: number;
    laneSpacingX?: number;
    paddingLeft?: number;
    paddingTop?: number;
  } = {}
): GitGraphLayoutResult {
  if (!commits || commits.length === 0) {
    return {
      nodes: [],
      links: [],
      lanesCount: 1,
      width: 400,
      height: 200,
      laneColors: BRANCH_LANE_COLORS,
    };
  }

  const nodeSpacingY = options.nodeSpacingY ?? 54;
  const laneSpacingX = options.laneSpacingX ?? 32;
  const paddingLeft = options.paddingLeft ?? 40;
  const paddingTop = options.paddingTop ?? 32;

  const sorted = [...commits].sort((a, b) => {
    const timeA = new Date(a.timestamp || a.date || 0).getTime();
    const timeB = new Date(b.timestamp || b.date || 0).getTime();
    return timeB - timeA;
  });

  const { commitLaneMap, lanesCount } = assignCommitLanes(sorted);

  const nodes: GraphNode[] = sorted.map((commit, index) => {
    const hash = commit.hash;
    const lane = commitLaneMap.get(hash) ?? 0;
    const x = paddingLeft + lane * laneSpacingX;
    const y = paddingTop + index * nodeSpacingY;

    const rawParents: string[] = Array.isArray(commit.parents)
      ? commit.parents.map((p: any) => (typeof p === 'string' ? p.substring(0, 7) : p?.sha?.substring(0, 7) || ''))
      : [];

    const parents = rawParents.length > 0 ? rawParents : (index < sorted.length - 1 ? [sorted[index + 1].hash] : []);
    const isMerge = parents.length > 1;
    const isHead = index === 0;
    const baseColor = isMerge ? MERGE_COMMIT_COLOR : BRANCH_LANE_COLORS[lane % BRANCH_LANE_COLORS.length];

    return {
      id: hash, hash, fullHash: commit.fullHash || hash,
      msg: commit.msg || 'Commit update', author: commit.author || 'Author',
      time: commit.time || '', timestamp: commit.timestamp || commit.date || new Date().toISOString(),
      lane, x, y, isMerge, isHead, color: baseColor, parents,
      add: commit.add, del: commit.del, avatar: commit.avatar,
    };
  });

  const nodePosMap = new Map<string, { x: number; y: number }>();
  nodes.forEach(n => nodePosMap.set(n.hash, { x: n.x, y: n.y }));

  const links: GraphLink[] = [];
  nodes.forEach(node => {
    node.parents.forEach((parentHash, pIdx) => {
      const parentPos = nodePosMap.get(parentHash);
      if (!parentPos) return;

      const sourceX = node.x;
      const sourceY = node.y;
      const targetX = parentPos.x;
      const targetY = parentPos.y;
      const isMergeLink = pIdx > 0 || node.isMerge;

      const d = sourceX === targetX
        ? `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`
        : `M ${sourceX} ${sourceY} C ${sourceX} ${(sourceY + targetY) / 2}, ${targetX} ${(sourceY + targetY) / 2}, ${targetX} ${targetY}`;

      links.push({
        id: `${node.hash}->${parentHash}`, sourceHash: node.hash, targetHash: parentHash,
        sourceX, sourceY, targetX, targetY,
        color: isMergeLink ? MERGE_COMMIT_COLOR : node.color,
        isMergeLink, d,
      });
    });
  });

  return {
    nodes, links, lanesCount,
    width: Math.max(500, paddingLeft + lanesCount * laneSpacingX + 240),
    height: Math.max(300, paddingTop + nodes.length * nodeSpacingY + 60),
    laneColors: BRANCH_LANE_COLORS.slice(0, lanesCount),
  };
}
