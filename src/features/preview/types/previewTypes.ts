export type PreviewCategory =
  | 'image'
  | 'pdf'
  | 'document'
  | 'spreadsheet'
  | 'code'
  | 'markdown'
  | 'data'
  | 'archive'
  | 'audio'
  | 'video'
  | 'font'
  | '3d'
  | 'sqlite'
  | 'binary'
  | 'unsupported';

export interface FileFormatInfo {
  category: PreviewCategory;
  mimeType: string;
  extension: string;
  displayName: string;
  isBinary: boolean;
  canCopyText: boolean;
  canSearch: boolean;
}

export interface FilePreviewMetadata {
  name: string;
  path: string;
  sizeBytes?: number;
  sha?: string;
  lastModified?: string;
  branch?: string;
  repo?: string;
  owner?: string;
}

export interface FileBinaryPayload {
  text?: string;
  rawBuffer?: Uint8Array;
  blobUrl?: string;
  base64?: string;
  sizeBytes: number;
  isTruncated?: boolean;
}

export interface UniversalPreviewProps {
  filePath: string;
  fileName: string;
  repoName: string;
  owner?: string | null;
  branch?: string | null;
  token?: string | null;
  fileSizeBytes?: number;
  initialContent?: string;
  onClose?: () => void;
  onEdit?: () => void;
  isOwner?: boolean;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  className?: string;
}
