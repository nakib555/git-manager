import React, { useState } from 'react';
import { DiffViewer } from '../../../components/commit/DiffViewer';
import { FileCode, FileText } from 'lucide-react';

interface CommitDetailDiffsProps {
  files: any[];
  isDark?: boolean;
}

export const CommitDetailDiffs: React.FC<CommitDetailDiffsProps> = ({
  files,
  isDark = false,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!files || files.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-text-muted">
        No file diffs available for this commit.
      </div>
    );
  }

  const activeFile = files[selectedIndex] || files[0];

  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {files.map((file, idx) => {
          const name = file.filename ? file.filename.split('/').pop() : `file-${idx + 1}`;
          return (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all shrink-0 cursor-pointer ${
                selectedIndex === idx
                  ? 'bg-primary text-white font-bold shadow-xs'
                  : 'bg-card border border-border text-text-muted hover:text-text-main'
              }`}
            >
              <FileCode size={12} />
              <span className="truncate max-w-[140px]">{name}</span>
              {file.additions > 0 && <span className="text-[9px] text-emerald-400">+{file.additions}</span>}
              {file.deletions > 0 && <span className="text-[9px] text-rose-400">-{file.deletions}</span>}
            </button>
          );
        })}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden max-h-[360px] overflow-y-auto">
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
