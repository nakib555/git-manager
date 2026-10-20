import { GitCommitNode } from '../types';

export interface GraphNode {
  id: string;
  hash: string;
  fullHash: string;
  msg: string;
  author: string;
  time: string;
  timestamp: string;
  lane: number;
  x: number;
  y: number;
  isMerge: boolean;
  isHead: boolean;
  color: string;
  parents: string[];
  add?: string;
  del?: string;
  avatar?: string;
}

export interface GraphLink {
  id: string;
  sourceHash: string;
  targetHash: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  color: string;
  isMergeLink: boolean;
  d: string;
}

export interface GitGraphLayoutResult {
  nodes: GraphNode[];
  links: GraphLink[];
  lanesCount: number;
  width: number;
  height: number;
  laneColors: string[];
}

// Purpose-driven semantic colors for branch lanes
export const BRANCH_LANE_COLORS = [
  '#2EA043', // Lane 0: Main / Production (Emerald)
  '#388BFD', // Lane 1: Feature / Core (Steel Blue)
  '#39C5CF', // Lane 2: UI / Components (Vibrant Cyan)
  '#A371F7', // Lane 3: Integration / API (Purple)
  '#F85149', // Lane 4: Hotfix / Bugfix (Coral Red)
  '#D29922', // Lane 5: Release / Staging (Amber)
  '#F0883E', // Lane 6: Experimental (Orange)
];

export const MERGE_COMMIT_COLOR = '#8957E5'; // Royal Purple for merge nodes

/**
 * Computes Directed Acyclic Graph (DAG) layout with topological lanes and Bézier links.
 */
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

  // 1. Sort commits chronologically descending (newest on top)
  const sorted = [...commits].sort((a, b) => {
    const timeA = new Date(a.timestamp || a.date || 0).getTime();
    const timeB = new Date(b.timestamp || b.date || 0).getTime();
    return timeB - timeA;
  });

  const commitMap = new Map<string, any>();
  sorted.forEach(c => {
    commitMap.set(c.hash, c);
    if (c.fullHash) commitMap.set(c.fullHash, c);
  });

  // 2. Lane allocation algorithm
  // Active branches tracking: map from branch ID or hash to lane index
  const activeLanes: (string | null)[] = []; // lane index -> expected parent hash
  const commitLaneMap = new Map<string, number>();

  sorted.forEach((commit, index) => {
    const hash = commit.hash;
    const parents: string[] = Array.isArray(commit.parents)
      ? commit.parents.map((p: any) => (typeof p === 'string' ? p.substring(0, 7) : p?.sha?.substring(0, 7) || ''))
      : [];

    // Synthesize parents if missing (e.g. standard linear history fallback)
    if (parents.length === 0 && index < sorted.length - 1) {
      parents.push(sorted[index + 1].hash);
    }

    // Determine lane for this commit:
    // Check if any existing active lane was waiting for this commit hash
    let assignedLane = -1;
    for (let l = 0; l < activeLanes.length; l++) {
      if (activeLanes[l] === hash) {
        assignedLane = l;
        activeLanes[l] = null; // matched
        break;
      }
    }

    // If not matched, assign the first available free lane
    if (assignedLane === -1) {
      const freeLane = activeLanes.indexOf(null);
      if (freeLane !== -1) {
        assignedLane = freeLane;
      } else {
        assignedLane = activeLanes.length;
        activeLanes.push(null);
      }
    }

    commitLaneMap.set(hash, assignedLane);

    // Now update active lanes with parents of this commit
    if (parents.length > 0) {
      // Primary parent stays in this commit's lane
      activeLanes[assignedLane] = parents[0];

      // Additional parents (merge sources) occupy secondary lanes
      for (let pIdx = 1; pIdx < parents.length; pIdx++) {
        const secondaryParent = parents[pIdx];
        const nextFree = activeLanes.indexOf(null);
        if (nextFree !== -1) {
          activeLanes[nextFree] = secondaryParent;
        } else {
          activeLanes.push(secondaryParent);
        }
      }
    } else {
      activeLanes[assignedLane] = null; // root commit, lane freed
    }
  });

  const lanesCount = Math.max(1, activeLanes.length, ...Array.from(commitLaneMap.values()).map(l => l + 1));

  // 3. Build Nodes
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

    const baseColor = isMerge 
      ? MERGE_COMMIT_COLOR 
      : BRANCH_LANE_COLORS[lane % BRANCH_LANE_COLORS.length];

    return {
      id: hash,
      hash,
      fullHash: commit.fullHash || hash,
      msg: commit.msg || 'Commit update',
      author: commit.author || 'Author',
      time: commit.time || '',
      timestamp: commit.timestamp || commit.date || new Date().toISOString(),
      lane,
      x,
      y,
      isMerge,
      isHead,
      color: baseColor,
      parents,
      add: commit.add,
      del: commit.del,
      avatar: commit.avatar,
    };
  });

  const nodePosMap = new Map<string, { x: number; y: number }>();
  nodes.forEach(n => nodePosMap.set(n.hash, { x: n.x, y: n.y }));

  // 4. Build Links (Bézier curves)
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

      let d = '';
      if (sourceX === targetX) {
        // Straight vertical link along same lane
        d = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
      } else {
        // Cubic Bézier curve between lanes
        const midY = (sourceY + targetY) / 2;
        d = `M ${sourceX} ${sourceY} C ${sourceX} ${midY}, ${targetX} ${midY}, ${targetX} ${targetY}`;
      }

      const linkColor = isMergeLink 
        ? MERGE_COMMIT_COLOR 
        : node.color;

      links.push({
        id: `${node.hash}->${parentHash}`,
        sourceHash: node.hash,
        targetHash: parentHash,
        sourceX,
        sourceY,
        targetX,
        targetY,
        color: linkColor,
        isMergeLink,
        d,
      });
    });
  });

  const width = Math.max(500, paddingLeft + lanesCount * laneSpacingX + 240);
  const height = Math.max(300, paddingTop + nodes.length * nodeSpacingY + 60);

  return {
    nodes,
    links,
    lanesCount,
    width,
    height,
    laneColors: BRANCH_LANE_COLORS.slice(0, lanesCount),
  };
}
