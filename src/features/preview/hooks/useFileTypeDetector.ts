import { useMemo } from 'react';
import {
  FileFormatInfo,
  FileTypeDetectorOptions,
  FileTypeDetectorResult,
  PreviewRendererType,
} from '../types/previewTypes';
import { detectFileType, detectMagicBytes, isBinaryBuffer } from '../utils/fileTypeDetector';

/**
 * useFileTypeDetector
 * 
 * Analyzes file paths, file extensions, binary byte signatures (magic bytes),
 * and payload metadata to route preview requests to the correct renderer.
 * 
 * Automatically enforces a secure fallback to the hexadecimal / binary viewer
 * ('hex') for unknown or binary file types, preventing unvetted code execution
 * or broken rendering.
 */
export function useFileTypeDetector(options: FileTypeDetectorOptions): FileTypeDetectorResult {
  const { filePath, fileName, fileSizeBytes, mimeType, rawBuffer, content, metadata } = options;

  return useMemo(() => {
    const targetPath = (filePath || fileName || '').trim();
    const resolvedName = (fileName || targetPath.split('/').pop() || '').trim();
    const normalizedName = resolvedName.toLowerCase();

    // 1. Check Magic Bytes if raw buffer is provided
    let magicMatch: {
      category?: FileFormatInfo['category'];
      mimeType?: string;
      displayName?: string;
      isBinary?: boolean;
      signature?: string;
      renderer?: PreviewRendererType;
    } | null = null;

    if (rawBuffer && rawBuffer.length > 0) {
      magicMatch = detectMagicBytes(rawBuffer);
    }

    // 2. Base detection from file extension / filename
    const baseFormat = detectFileType(targetPath || resolvedName);

    // 3. Determine if buffer exhibits binary characteristics (null bytes, control chars)
    let bufferIsBinary: boolean | null = null;
    if (rawBuffer && rawBuffer.length > 0) {
      bufferIsBinary = isBinaryBuffer(rawBuffer);
    } else if (content) {
      // Check first 1000 chars for null character
      bufferIsBinary = content.includes('\0');
    }

    // 4. Resolve Extension
    const ext = baseFormat.extension.toLowerCase();

    // Check if extension is explicitly in known registered list or known filename
    const isSpecialKnownFile = [
      'dockerfile', 'makefile', 'procfile', 'gemfile', 'rakefile', 'vagrantfile',
      'brewfile', 'license', 'authors', 'changelog', 'readme', '.gitignore',
      '.env', '.editorconfig', '.prettierrc', '.eslintrc', '.npmrc', '.dockerignore'
    ].includes(normalizedName) || normalizedName.startsWith('.env') || normalizedName.startsWith('.git');

    const isExplicitlyKnownExtension = Boolean(
      baseFormat.displayName &&
      !baseFormat.displayName.endsWith('File') &&
      baseFormat.displayName !== 'Plain File'
    );

    const isKnownType = isSpecialKnownFile || isExplicitlyKnownExtension || Boolean(magicMatch);

    // 5. Determine Renderer and Fallback
    let renderer: PreviewRendererType = 'code';
    let isFallbackToHex = false;
    let isUnknownType = !isKnownType;
    let detectedVia: FileTypeDetectorResult['detectedVia'] = 'extension';
    let confidence: FileTypeDetectorResult['confidence'] = 'high';

    if (magicMatch && magicMatch.renderer) {
      // Magic bytes have highest precedence for binary files
      renderer = magicMatch.renderer;
      detectedVia = 'magic_bytes';
      confidence = 'high';
      isUnknownType = false;
    } else if (isUnknownType) {
      // UNKNOWN FILE TYPE:
      // If buffer is binary or no text heuristic proves it's clean text -> fallback to secure hex viewer
      if (bufferIsBinary === true || baseFormat.isBinary) {
        renderer = 'hex';
        isFallbackToHex = true;
        detectedVia = bufferIsBinary ? 'heuristic' : 'fallback';
        confidence = 'medium';
      } else if (bufferIsBinary === false) {
        // Safe text detected despite unknown extension
        renderer = 'code';
        isFallbackToHex = false;
        detectedVia = 'heuristic';
        confidence = 'medium';
      } else {
        // Unknown with no buffer inspection yet: if extension exists but unknown, securely route to hex
        renderer = ext ? 'hex' : 'code';
        isFallbackToHex = ext ? true : false;
        detectedVia = 'fallback';
        confidence = 'low';
      }
    } else {
      // KNOWN FORMAT: Route based on category
      switch (baseFormat.category) {
        case 'image':
          renderer = 'image';
          break;
        case 'pdf':
          renderer = 'pdf';
          break;
        case 'document':
          renderer = ext === 'docx' ? 'document' : 'code';
          break;
        case 'spreadsheet':
          renderer = 'spreadsheet';
          break;
        case 'markdown':
          renderer = 'markdown';
          break;
        case 'data':
          renderer = 'data';
          break;
        case 'archive':
          renderer = 'archive';
          break;
        case 'audio':
          renderer = 'audio';
          break;
        case 'video':
          renderer = 'video';
          break;
        case 'font':
          renderer = 'font';
          break;
        case '3d':
          renderer = '3d';
          break;
        case 'sqlite':
          renderer = 'sqlite';
          break;
        case 'binary':
          renderer = 'hex';
          isFallbackToHex = true;
          break;
        case 'unsupported':
          renderer = 'hex';
          isFallbackToHex = true;
          break;
        case 'code':
        default:
          renderer = 'code';
          break;
      }
    }

    // Format Info assembly
    const formatInfo: FileFormatInfo = {
      category: magicMatch?.category || (isFallbackToHex ? 'binary' : baseFormat.category),
      mimeType: magicMatch?.mimeType || mimeType || baseFormat.mimeType,
      extension: baseFormat.extension,
      displayName: magicMatch?.displayName || (isUnknownType && isFallbackToHex ? `${ext ? ext.toUpperCase() + ' ' : ''}Binary Data` : baseFormat.displayName),
      isBinary: bufferIsBinary ?? (magicMatch?.isBinary ?? (isFallbackToHex || baseFormat.isBinary)),
      canCopyText: isFallbackToHex ? false : (baseFormat.canCopyText ?? !baseFormat.isBinary),
      canSearch: isFallbackToHex ? true : (baseFormat.canSearch ?? true),
      isTextCandidate: bufferIsBinary === false || (!baseFormat.isBinary && !isFallbackToHex),
    };

    return {
      formatInfo,
      renderer,
      isUnknownType,
      isFallbackToHex,
      isBinary: formatInfo.isBinary,
      detectedVia,
      confidence,
      magicSignature: magicMatch?.signature,
    };
  }, [filePath, fileName, fileSizeBytes, mimeType, rawBuffer, content, metadata]);
}
