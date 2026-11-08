import React, { useState, useEffect, useRef } from 'react';
import { UniversalPreviewProps, FileBinaryPayload } from '../types/previewTypes';
import { useFileTypeDetector } from '../hooks/useFileTypeDetector';
import { createManagedBlobUrl, safeTextDecode } from '../utils/binaryLoader';
import { fetchFileBinarySafe } from '../../../mobile/utils/api/gitFileContentApi';
import { PreviewMetadataHeader } from './PreviewMetadataHeader';
import { PreviewToolbar } from './PreviewToolbar';
import { PreviewRouter } from './PreviewRouter';
import { AlertCircle } from 'lucide-react';

export const UniversalFilePreview: React.FC<UniversalPreviewProps> = ({
  filePath,
  fileName,
  repoName,
  owner,
  branch,
  token,
  fileSizeBytes,
  initialContent,
  onClose,
  onEdit,
  isOwner,
  isFullscreen,
  onToggleFullscreen,
  className = '',
}) => {
  const [viewMode, setViewMode] = useState<'preview' | 'hex'>('preview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [payload, setPayload] = useState<FileBinaryPayload>({
    text: initialContent,
    sizeBytes: fileSizeBytes || (initialContent ? initialContent.length : 0),
  });

  const revokeRef = useRef<(() => void) | null>(null);

  // Hook analyzing file extensions, metadata, magic byte signatures, and binary buffer characteristics
  const detector = useFileTypeDetector({
    filePath,
    fileName,
    fileSizeBytes: payload.sizeBytes || fileSizeBytes,
    rawBuffer: payload.rawBuffer,
    content: payload.text,
  });

  const { formatInfo, renderer, isUnknownType, isFallbackToHex } = detector;

  useEffect(() => {
    if (!filePath) return;

    setIsLoading(true);
    setError(null);
    setViewMode('preview');

    if (revokeRef.current) {
      revokeRef.current();
      revokeRef.current = null;
    }

    fetchFileBinarySafe({
      filePath,
      repoName,
      owner,
      branch: branch || 'main',
      token,
    })
      .then((res) => {
        const rawBuffer = res.rawBuffer;
        const text = res.text || (rawBuffer ? safeTextDecode(rawBuffer) : '');
        let blobUrl: string | undefined;

        if (rawBuffer && rawBuffer.length > 0) {
          const managed = createManagedBlobUrl(rawBuffer, formatInfo.mimeType);
          blobUrl = managed.url;
          revokeRef.current = managed.revoke;
        }

        setPayload({
          rawBuffer,
          text,
          base64: res.base64,
          blobUrl,
          sizeBytes: res.sizeBytes || fileSizeBytes || rawBuffer?.length || (text ? text.length : 0),
        });
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch file content');
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => {
      if (revokeRef.current) {
        revokeRef.current();
        revokeRef.current = null;
      }
    };
  }, [filePath, repoName, owner, branch, token, formatInfo.mimeType]);

  const handleCopy = () => {
    if (payload.text) {
      navigator.clipboard.writeText(payload.text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const blob = payload.rawBuffer
      ? new Blob([payload.rawBuffer], { type: formatInfo.mimeType || 'application/octet-stream' })
      : new Blob([payload.text || ''], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || filePath.split('/').pop() || 'download';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`flex flex-col h-full bg-surface-1 border border-border rounded-2xl overflow-hidden shadow-xs ${className}`}>
      <div className="px-4 py-2.5 border-b border-border bg-surface-2/30 flex items-center justify-between shrink-0">
        <PreviewMetadataHeader
          repoName={repoName}
          filePath={filePath}
          category={formatInfo.category}
          displayName={formatInfo.displayName}
          sizeBytes={payload.sizeBytes}
          isOwner={isOwner}
        />
        <PreviewToolbar
          viewMode={isFallbackToHex && viewMode !== 'hex' ? 'hex' : viewMode}
          onToggleViewMode={() => setViewMode((prev) => (prev === 'preview' ? 'hex' : 'preview'))}
          canCopy={formatInfo.canCopyText || !!payload.text}
          isCopied={isCopied}
          onCopy={handleCopy}
          onDownload={handleDownload}
          isFullscreen={isFullscreen}
          onToggleFullscreen={onToggleFullscreen}
          onEdit={onEdit}
          onClose={onClose}
          isOwner={isOwner}
        />
      </div>

      <div className="flex-1 overflow-hidden relative">
        {isLoading ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-text-secondary">
            <div className="w-7 h-7 border-2 border-accent border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-mono">Analyzing & Loading {formatInfo.displayName}...</p>
          </div>
        ) : error ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-text-secondary">
            <AlertCircle size={36} className="text-rose-500 mb-2 opacity-80" />
            <p className="text-sm font-semibold text-text-primary">Failed to load preview</p>
            <p className="text-xs text-text-tertiary mt-1 max-w-sm">{error}</p>
          </div>
        ) : (
          <PreviewRouter
            formatInfo={formatInfo}
            payload={payload}
            fileName={fileName || filePath.split('/').pop() || ''}
            viewMode={viewMode}
            renderer={renderer}
            isUnknownType={isUnknownType}
            isFallbackToHex={isFallbackToHex}
            onDownload={handleDownload}
            onOpenHex={() => setViewMode('hex')}
          />
        )}
      </div>
    </div>
  );
};
