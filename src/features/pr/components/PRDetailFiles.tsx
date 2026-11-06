import React, { useState } from 'react';
import { FileCode } from 'lucide-react';
import { DiffViewer } from '../../../components/commit/DiffViewer';
import { PRFile } from '../types';

interface PRDetailFilesProps {
  files: PRFile[];
  isDark?: boolean;
  isLoading?: boolean;
}

export const PRDetailFiles: React.FC<PRDetailFilesProps> = ({
  files,
  isDark = false,
  isLoading = false,
}) => {
  const [selectedIdx, setSelectedIdx] = useState(0);

  if (isLoading) {
    return (
      <div className="py-10 text-center text-xs text-text-muted">
        Loading PR file changes...
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="py-10 text-center text-xs text-text-muted">
        No modified files recorded for this pull request.
      </div>
    );
  }

  const activeFile = files[selectedIdx] || files[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {files.map((f, idx) => {
          const shortName = f.filename.split('/').pop() || f.filename;
          return (
            <button
              key={f.filename}
              onClick={() => setSelectedIdx(idx)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all shrink-0 cursor-pointer ${
                selectedIdx === idx
                  ? 'bg-primary text-white font-bold shadow-xs'
                  : 'bg-card border border-border text-text-muted hover:text-text-main'
              }`}
            >
              <FileCode size={12} />
              <span className="truncate max-w-[140px]">{shortName}</span>
              {f.additions > 0 && <span className="text-[9px] text-emerald-400">+{f.additions}</span>}
              {f.deletions > 0 && <span className="text-[9px] text-rose-400">-{f.deletions}</span>}
            </button>
          );
        })}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden max-h-[380px] overflow-y-auto">
        {activeFile ? (
          <DiffViewer
            patch={activeFile.patch || `Binary or empty file change for ${activeFile.filename}`}
            filename={activeFile.filename}
            isDark={isDark}
          />
        ) : (
          <div className="p-4 text-xs text-text-muted text-center">Select a file to inspect diff</div>
        )}
      </div>
    </div>
  );
};
