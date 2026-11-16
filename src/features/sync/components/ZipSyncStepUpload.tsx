import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, RefreshCw, FileArchive, AlertCircle, CheckCircle2 } from 'lucide-react';
import { VisualRootTreePicker } from '../../../components/sync/VisualRootTreePicker';
import { RootCandidate, DirectoryNode } from '../../../mobile/utils/zipAutoDetect';
import { formatFileSize, isValidZipFile } from '../../../mobile/utils/zipSyncEngine';

interface ZipSyncStepUploadProps {
  zipFile: File | null;
  isParsingZip: boolean;
  isComparing: boolean;
  compareProgress: { completed: number; total: number } | null;
  uploadError: string | null;
  onFileSelected: (file: File) => void;
  onInvalidFile: (message: string) => void;
  activeRoot: string;
  suggestedRoot: string;
  rootCandidates: RootCandidate[];
  directoryTree: DirectoryNode;
  samplePath: string;
  onRootChange: (root: string) => void;
  totalExtractedFiles: number;
}

export const ZipSyncStepUpload: React.FC<ZipSyncStepUploadProps> = ({
  zipFile,
  isParsingZip,
  isComparing,
  compareProgress,
  uploadError,
  onFileSelected,
  onInvalidFile,
  activeRoot,
  suggestedRoot,
  rootCandidates,
  directoryTree,
  samplePath,
  onRootChange,
  totalExtractedFiles,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleIncomingFile = (file: File | undefined | null) => {
    if (!file) return;
    if (!isValidZipFile(file)) {
      onInvalidFile(`"${file.name}" is not a .zip archive. Please choose a valid .zip export.`);
      return;
    }
    onFileSelected(file);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleIncomingFile(e.dataTransfer.files?.[0]);
  };

  const isBusy = isParsingZip || isComparing;
  const progressPct =
    compareProgress && compareProgress.total > 0
      ? Math.round((compareProgress.completed / compareProgress.total) * 100)
      : null;

  return (
    <div className="space-y-6">
      <motion.div
        animate={{
          scale: isDragging ? 1.01 : 1,
        }}
        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
      >
        <button
          type="button"
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          disabled={isBusy}
          className={`w-full border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-colors flex flex-col items-center justify-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${
            isBusy ? 'cursor-wait opacity-90' : 'cursor-pointer'
          } ${
            isDragging
              ? 'border-accent bg-accent/10'
              : uploadError
                ? 'border-danger/60 bg-danger/5 hover:border-danger'
                : zipFile && totalExtractedFiles > 0
                  ? 'border-success/50 bg-surface-2/40 hover:border-accent/60'
                  : 'border-border bg-surface-2/25 hover:border-accent/60 hover:bg-surface-2/50'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".zip,application/zip,application/x-zip-compressed"
            className="hidden"
            onChange={(e) => {
              const selected = e.target.files?.[0];
              handleIncomingFile(selected);
              e.target.value = '';
            }}
          />

          <motion.div
            animate={isDragging ? { y: -4, scale: 1.06 } : { y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 24 }}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
              isDragging
                ? 'bg-accent text-white'
                : zipFile && totalExtractedFiles > 0
                  ? 'bg-success/15 text-success'
                  : 'bg-accent/12 text-accent group-hover:bg-accent/20'
            }`}
          >
            {isBusy ? (
              <RefreshCw size={22} className="animate-spin" />
            ) : zipFile && totalExtractedFiles > 0 ? (
              <FileArchive size={22} />
            ) : (
              <Upload size={22} />
            )}
          </motion.div>

          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-sm font-bold text-text-primary text-balance">
              {isParsingZip
                ? 'Extracting ZIP archive...'
                : isComparing
                  ? 'Comparing archive against repository...'
                  : isDragging
                    ? 'Drop ZIP archive to analyze'
                    : zipFile
                      ? zipFile.name
                      : 'Select or drop your project ZIP export'}
            </h3>

            {zipFile && totalExtractedFiles > 0 && !isBusy ? (
              <div className="flex items-center justify-center flex-wrap gap-2 text-xs text-text-secondary tabular-nums">
                <span className="inline-flex items-center gap-1 text-success font-medium">
                  <CheckCircle2 size={13} />
                  Ready
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">{formatFileSize(zipFile.size)}</span>
                <span aria-hidden="true">·</span>
                <span>{totalExtractedFiles} files extracted</span>
                <span aria-hidden="true">·</span>
                <span className="text-accent font-medium">Click or drop to replace</span>
              </div>
            ) : (
              <p className="text-xs text-text-secondary leading-relaxed text-pretty">
                Upload a .zip package exported from AI Studio or your local workspace. Root directories are detected automatically.
              </p>
            )}
          </div>

          {isBusy && (
            <div className="w-full max-w-xs space-y-1.5 pt-1">
              <div className="h-1.5 w-full bg-surface-3 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-accent rounded-full"
                  initial={{ width: '15%' }}
                  animate={{ width: progressPct !== null ? `${Math.max(12, progressPct)}%` : '68%' }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              {compareProgress && compareProgress.total > 0 && (
                <p className="text-[11px] font-mono text-text-tertiary tabular-nums">
                  Inspecting {compareProgress.completed}/{compareProgress.total} repository files
                </p>
              )}
            </div>
          )}
        </button>
      </motion.div>

      <AnimatePresence>
        {uploadError && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16 }}
            role="alert"
            className="flex items-start gap-2.5 p-3.5 rounded-xl bg-danger/10 border border-danger/25 text-xs text-danger"
          >
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{uploadError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {totalExtractedFiles > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="pt-5 border-t border-border"
          >
            <VisualRootTreePicker
              directoryTree={directoryTree}
              activeRoot={activeRoot}
              suggestedRoot={suggestedRoot}
              candidates={rootCandidates}
              samplePath={samplePath}
              onSelectRoot={onRootChange}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
