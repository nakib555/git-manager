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

export type PreviewRendererType =
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
  | 'hex'
  | 'unsupported';

export interface FileFormatInfo {
  category: PreviewCategory;
  mimeType: string;
  extension: string;
  displayName: string;
  isBinary: boolean;
  canCopyText: boolean;
  canSearch: boolean;
  isTextCandidate?: boolean;
}

export interface FileTypeDetectorOptions {
  filePath: string;
  fileName?: string;
  fileSizeBytes?: number;
  mimeType?: string;
  rawBuffer?: Uint8Array;
  content?: string;
  metadata?: Record<string, any>;
}

export interface FileTypeDetectorResult {
  formatInfo: FileFormatInfo;
  renderer: PreviewRendererType;
  isUnknownType: boolean;
  isFallbackToHex: boolean;
  isBinary: boolean;
  detectedVia: 'magic_bytes' | 'extension' | 'mime' | 'heuristic' | 'fallback';
  confidence: 'high' | 'medium' | 'low';
  magicSignature?: string;
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
