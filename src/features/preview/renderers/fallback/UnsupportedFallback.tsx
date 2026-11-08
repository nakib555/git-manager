import React from 'react';
import { FileQuestion, Download, Binary, ShieldAlert } from 'lucide-react';
import { formatBytes } from '../../utils/formatters';

interface UnsupportedFallbackProps {
  fileName: string;
  sizeBytes?: number;
  mimeType: string;
  onDownload: () => void;
  onOpenHex: () => void;
}

export const UnsupportedFallback: React.FC<UnsupportedFallbackProps> = ({
  fileName,
  sizeBytes,
  mimeType,
  onDownload,
  onOpenHex,
}) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-surface-1 text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface-2 border border-border flex items-center justify-center text-text-tertiary mb-4 shadow-xs">
        <FileQuestion size={32} />
      </div>

      <h3 className="text-base font-bold text-text-primary mb-1">{fileName}</h3>
      <p className="text-xs text-text-secondary font-mono mb-6">
        {mimeType} · {sizeBytes ? formatBytes(sizeBytes) : 'Unknown size'}
      </p>

      <div className="max-w-md p-4 bg-surface-2/60 border border-border rounded-xl mb-6 text-xs text-text-secondary leading-relaxed flex items-start gap-3 text-left">
        <ShieldAlert size={18} className="text-amber-500 shrink-0 mt-0.5" />
        <div>
          This file format cannot be rendered as visual documents or rich media in the browser. For security, binary executables and unknown formats are never executed in the client.
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenHex}
          className="flex items-center gap-1.5 px-4 py-2 bg-surface-2 hover:bg-surface-3 border border-border text-text-primary rounded-xl text-xs font-medium transition-colors cursor-pointer"
        >
          <Binary size={14} />
          <span>Inspect Hex View</span>
        </button>
        <button
          type="button"
          onClick={onDownload}
          className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:opacity-95 text-white rounded-xl text-xs font-medium transition-opacity shadow-xs cursor-pointer"
        >
          <Download size={14} />
          <span>Download Original</span>
        </button>
      </div>
    </div>
  );
};
