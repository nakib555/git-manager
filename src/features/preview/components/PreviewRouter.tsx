import React from 'react';
import { FileFormatInfo, FileBinaryPayload } from '../types/previewTypes';
import { ImagePreview } from '../renderers/image/ImagePreview';
import { AudioPreview } from '../renderers/media/AudioPreview';
import { VideoPreview } from '../renderers/media/VideoPreview';
import { PdfPreview } from '../renderers/document/PdfPreview';
import { DocxPreview } from '../renderers/document/DocxPreview';
import { MarkdownPreview } from '../renderers/document/MarkdownPreview';
import { SpreadsheetPreview } from '../renderers/data/SpreadsheetPreview';
import { CsvPreview } from '../renderers/data/CsvPreview';
import { JsonTreePreview } from '../renderers/data/JsonTreePreview';
import { CodeFilePreview } from '../renderers/code/CodeFilePreview';
import { ArchivePreview } from '../renderers/archive/ArchivePreview';
import { FontPreview } from '../renderers/specialized/FontPreview';
import { Model3dPreview } from '../renderers/specialized/Model3dPreview';
import { SqlitePreview } from '../renderers/specialized/SqlitePreview';
import { HexDumpPreview } from '../renderers/fallback/HexDumpPreview';
import { UnsupportedFallback } from '../renderers/fallback/UnsupportedFallback';

interface PreviewRouterProps {
  formatInfo: FileFormatInfo;
  payload: FileBinaryPayload;
  fileName: string;
  viewMode: 'preview' | 'hex';
  onDownload: () => void;
  onOpenHex: () => void;
}

export const PreviewRouter: React.FC<PreviewRouterProps> = ({
  formatInfo,
  payload,
  fileName,
  viewMode,
  onDownload,
  onOpenHex,
}) => {
  if (viewMode === 'hex') {
    return <HexDumpPreview rawBuffer={payload.rawBuffer} fileName={fileName} />;
  }

  const { category, extension, mimeType } = formatInfo;

  switch (category) {
    case 'image':
      return (
        <ImagePreview
          blobUrl={payload.blobUrl}
          base64={payload.base64}
          rawBuffer={payload.rawBuffer}
          mimeType={mimeType}
          fileName={fileName}
        />
      );

    case 'audio':
      return (
        <AudioPreview
          blobUrl={payload.blobUrl}
          base64={payload.base64}
          mimeType={mimeType}
          fileName={fileName}
        />
      );

    case 'video':
      return (
        <VideoPreview
          blobUrl={payload.blobUrl}
          base64={payload.base64}
          mimeType={mimeType}
          fileName={fileName}
        />
      );

    case 'pdf':
      return (
        <PdfPreview
          blobUrl={payload.blobUrl}
          base64={payload.base64}
          rawBuffer={payload.rawBuffer}
          fileName={fileName}
        />
      );

    case 'document':
      if (extension === 'docx') {
        return <DocxPreview rawBuffer={payload.rawBuffer} fileName={fileName} />;
      }
      return (
        <CodeFilePreview
          content={payload.text || ''}
          language={extension}
          fileName={fileName}
        />
      );

    case 'markdown':
      return <MarkdownPreview content={payload.text || ''} fileName={fileName} />;

    case 'spreadsheet':
      if (extension === 'csv') {
        return <CsvPreview content={payload.text || ''} />;
      }
      if (extension === 'tsv') {
        return <CsvPreview content={payload.text || ''} isTsv />;
      }
      return <SpreadsheetPreview rawBuffer={payload.rawBuffer} fileName={fileName} />;

    case 'data':
      if (extension === 'json' || extension === 'jsonc') {
        return <JsonTreePreview content={payload.text || ''} />;
      }
      return <CodeFilePreview content={payload.text || ''} language={extension} fileName={fileName} />;

    case 'archive':
      return <ArchivePreview rawBuffer={payload.rawBuffer} fileName={fileName} />;

    case 'font':
      return <FontPreview blobUrl={payload.blobUrl} rawBuffer={payload.rawBuffer} fileName={fileName} />;

    case '3d':
      return <Model3dPreview rawBuffer={payload.rawBuffer} fileName={fileName} />;

    case 'sqlite':
      return <SqlitePreview rawBuffer={payload.rawBuffer} fileName={fileName} />;

    case 'code':
      return <CodeFilePreview content={payload.text || ''} language={extension} fileName={fileName} />;

    case 'binary':
    case 'unsupported':
    default:
      return (
        <UnsupportedFallback
          fileName={fileName}
          sizeBytes={payload.sizeBytes}
          mimeType={mimeType}
          onDownload={onDownload}
          onOpenHex={onOpenHex}
        />
      );
  }
};
