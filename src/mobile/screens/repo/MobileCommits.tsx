import React, { useState } from 'react';
import { useAppContext } from '../../../AppContext';
import { MobileCommitCard } from '../../components/MobileCommitCard';
import { GitCommit, Copy, Check, X, FileDiff, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const MobileCommits: React.FC = () => {
  const { activeCommits, showToast, currentRepo } = useAppContext();
  const [selectedCommit, setSelectedCommit] = useState<any | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setIsCopied(true);
    showToast(`Copied SHA: ${hash.substring(0, 7)}`, 'success');
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#F4F4F5] tracking-tight">Commits</h2>
          <p className="text-xs text-[#71717A] mt-0.5">
            History of {currentRepo} on current branch
          </p>
        </div>
        <span className="text-xs font-mono text-[#3B82F6] font-semibold bg-[#3B82F6]/10 px-2 py-0.5 rounded border border-[#3B82F6]/25">
          {activeCommits.length} commits
        </span>
      </div>

      {activeCommits.length === 0 ? (
        <div className="bg-[#121214] border border-[#2A2A2E] rounded-xl p-8 text-center flex flex-col items-center justify-center">
          <GitCommit size={32} className="text-[#71717A] mb-2 opacity-50" />
          <span className="text-sm font-semibold text-[#F4F4F5] mb-1">No commits on branch</span>
          <span className="text-xs text-[#71717A]">
            Create a commit to start building project history.
          </span>
        </div>
      ) : (
        <div className="space-y-2.5">
          {activeCommits.map((commit, idx) => (
            <MobileCommitCard
              key={`${commit.hash}-${idx}`}
              commit={{
                hash: commit.hash,
                msg: commit.msg,
                author: commit.author,
                date: commit.date,
                avatarUrl: commit.avatarUrl,
                stats: commit.stats,
              }}
              onClick={() => setSelectedCommit(commit)}
              onCopyHash={() => handleCopyHash(commit.hash)}
              isLatest={idx === 0}
            />
          ))}
        </div>
      )}

      {/* Commit Detail Bottom Sheet */}
      <AnimatePresence>
        {selectedCommit && (
          <div className="fixed inset-0 z-50 flex items-end justify-center select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setSelectedCommit(null)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative w-full max-w-lg bg-[#121214] border-t border-x border-[#2A2A2E] rounded-t-[20px] pb-[calc(env(safe-area-inset-bottom,0px)+16px)] pt-3 px-5 shadow-2xl z-10 max-h-[85vh] overflow-y-auto no-scrollbar"
            >
              <div className="w-10 h-1 bg-[#2A2A2E] rounded-full mx-auto mb-3" />

              <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2E] mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6] flex items-center justify-center">
                    <FileDiff size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#F4F4F5]">Commit Detail</h3>
                    <span className="text-[11px] font-mono text-[#71717A]">
                      {selectedCommit.hash}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCommit(null)}
                  className="w-8 h-8 rounded-full bg-[#1A1A1D] flex items-center justify-center text-[#71717A] hover:text-[#F4F4F5]"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Message */}
              <div className="bg-[#0A0A0B] p-3.5 rounded-xl border border-[#2A2A2E] mb-3">
                <span className="text-[10px] text-[#71717A] uppercase font-bold tracking-wider block mb-1">
                  Message
                </span>
                <p className="text-xs text-[#F4F4F5] font-medium leading-relaxed">
                  {selectedCommit.msg}
                </p>
              </div>

              {/* Author & Timestamp */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-[#1A1A1D] p-3 rounded-xl border border-[#2A2A2E]">
                  <span className="text-[10px] text-[#71717A] uppercase font-bold tracking-wider block">Author</span>
                  <span className="text-xs font-semibold text-[#F4F4F5] truncate block mt-0.5">
                    {selectedCommit.author}
                  </span>
                </div>
                <div className="bg-[#1A1A1D] p-3 rounded-xl border border-[#2A2A2E]">
                  <span className="text-[10px] text-[#71717A] uppercase font-bold tracking-wider block">Date</span>
                  <span className="text-xs font-semibold text-[#F4F4F5] truncate block mt-0.5">
                    {selectedCommit.date}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleCopyHash(selectedCommit.hash)}
                  className="flex-1 h-11 rounded-xl bg-[#1A1A1D] hover:bg-[#242428] border border-[#2A2A2E] text-xs font-semibold text-[#F4F4F5] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Copy size={14} />
                  <span>Copy SHA</span>
                </button>
                <button
                  onClick={() => {
                    showToast('Unified diff loaded', 'info');
                    setSelectedCommit(null);
                  }}
                  className="flex-1 h-11 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-xs font-semibold text-white flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <FileDiff size={14} />
                  <span>View Diff</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
