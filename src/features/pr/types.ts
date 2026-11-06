export interface PRCommit {
  hash: string;
  msg: string;
  author: string;
  time: string;
}

export interface PRFile {
  filename: string;
  additions: number;
  deletions: number;
  patch: string;
}

export type PRStatusTab = 'Open' | 'Merged' | 'Closed';
export type PRDetailSubTab = 'overview' | 'commits' | 'files';
