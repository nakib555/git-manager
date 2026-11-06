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
