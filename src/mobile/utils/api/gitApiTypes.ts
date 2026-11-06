export interface ChangedFileDiff {
  filename: string;
  status: 'modified' | 'added' | 'removed' | 'renamed';
  additions: number;
  deletions: number;
  patch?: string;
}

export interface CheckRunItem {
  id: number;
  name: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion: 'success' | 'failure' | 'neutral' | 'cancelled' | 'skipped' | 'timed_out' | 'action_required' | null;
  startedAt?: string;
  completedAt?: string;
  htmlUrl?: string;
}

export interface DetailedCommitInfo {
  hash: string;
  fullHash: string;
  msg: string;
  author: string;
  authorEmail?: string;
  authorAvatar?: string;
  date: string;
  verified?: boolean;
  parentSha?: string;
  stats: {
    total: number;
    additions: number;
    deletions: number;
  };
  files: ChangedFileDiff[];
  checkRuns?: CheckRunItem[];
}

export interface TimelineEventItem {
  id: string;
  type: string;
  actor: {
    login: string;
    avatarUrl?: string;
  };
  repo: {
    name: string;
  };
  createdAt: string;
  payload: any;
}
