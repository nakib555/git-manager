export interface ZipExtractedFile {
  originalPath: string;
  normalizedPath: string;
  isDir: boolean;
  content?: string;
  binaryData?: Uint8Array;
  size: number;
}

export type FileChangeStatus = 'added' | 'modified' | 'removed' | 'unchanged';

export interface DiffFileItem {
  path: string;
  originalZipPath?: string;
  status: FileChangeStatus;
  selected: boolean;
  oldContent?: string;
  newContent?: string;
  additions: number;
  deletions: number;
  isBinary?: boolean;
  patch?: string;
}

export interface TreeDiffResult {
  commonRootDetected: string;
  totalFilesInZip: number;
  files: DiffFileItem[];
  counts: {
    added: number;
    modified: number;
    removed: number;
    unchanged: number;
    totalChanged: number;
  };
}
