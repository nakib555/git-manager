export interface GitCommitNode {
  hash: string;
  fullHash: string;
  timestamp: string;
  msg: string;
  author: string;
  time: string;
  avatar?: string;
  avatarUrl?: string;
  add?: string;
  del?: string;
  parents?: string[];
  isPrimary?: boolean;
  date?: string;
  stats?: any;
  files?: any[];
}

export interface CommitCreationPayload {
  msg: string;
  author?: string;
  hash?: string;
  add?: string;
  del?: string;
  filePath?: string;
  fileContent?: string;
  files?: Array<{ name: string; path?: string; type?: string; size?: number }>;
  updatedFileList?: Array<{ name: string; path?: string; type?: string; size?: number }>;
}

export interface SaveAndCommitFileParams {
  filePath: string;
  content: string;
  message: string;
  description?: string;
  branch?: string;
}
