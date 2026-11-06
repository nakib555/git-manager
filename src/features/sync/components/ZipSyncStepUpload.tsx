import React, { useRef } from 'react';
import { Upload, RefreshCw, FileArchive, Sparkles, Folder } from 'lucide-react';
import { VisualRootTreePicker } from '../../../components/sync/VisualRootTreePicker';
import { RootCandidate, DirectoryNode } from '../../../mobile/utils/zipAutoDetect';

interface ZipSyncStepUploadProps {
  zipFile: File | null;
  isParsingZip: boolean;
  onFileSelected: (file: File) => void;
  activeRoot: string;
  suggestedRoot: string;
  rootCandidates: RootCandidate[];
  directoryTree: DirectoryNode;
  onRootChange: (root: string) => void;
  totalExtractedFiles: number;
}

export const ZipSyncStepUpload: React.FC<ZipSyncStepUploadProps> = ({
  zipFile,
  isParsingZip,
  onFileSelected,
  activeRoot,
  suggestedRoot,
  rootCandidates,
  directoryTree,
  onRootChange,
  totalExtractedFiles,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.zip')) onFileSelected(file);
    }
  };

  return (
    <div className="space-y-5">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-border hover:border-primary/50 bg-main/40 hover:bg-hover/20 rounded-2xl p-8 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-3 group"
      >
        <input
          ref={inputRef}
          type="file"
          accept=".zip"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) onFileSelected(e.target.files[0]);
          }}
        />

        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
          {isParsingZip ? (
            <RefreshCw size={26} className="animate-spin text-primary" />
          ) : (
            <Upload size={26} />
          )}
        </div>

        <div>
          <h4 className="text-sm font-bold text-text-main">
            {zipFile ? zipFile.name : 'Select or drop AI Studio ZIP export'}
          </h4>
          <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto leading-relaxed">
            Upload the codebase ZIP exported from Google AI Studio. It will be analyzed and aligned automatically.
          </p>
        </div>

        {totalExtractedFiles > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <Sparkles size={12} />
            <span>Extracted {totalExtractedFiles} files</span>
          </span>
        )}
      </div>

      {totalExtractedFiles > 0 && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-main flex items-center gap-1.5">
              <Folder size={14} className="text-primary" />
              <span>Root Folder Alignment</span>
            </span>
            {suggestedRoot && (
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-mono font-bold">
                Auto-detected: {suggestedRoot || '/'}
              </span>
            )}
          </div>

          <VisualRootTreePicker
            directoryTree={directoryTree}
            activeRoot={activeRoot}
            suggestedRoot={suggestedRoot}
            candidates={rootCandidates}
            onSelectRoot={onRootChange}
          />
        </div>
      )}
    </div>
  );
};
