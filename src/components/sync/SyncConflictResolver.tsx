import React, { useState } from 'react';
import { 
  AlertTriangle, Check, ShieldCheck, Trash2, RotateCcw, 
  ArrowRight, FileCode, CheckCheck, Sliders, ChevronDown, 
  ChevronUp, X, Sparkles, Layers
} from 'lucide-react';
import { DiffFileItem } from '../../mobile/utils/zipSyncEngine';

export type ConflictResolution = 'take_zip' | 'keep_original' | 'delete' | 'restore';

interface SyncConflictResolverProps {
  files: DiffFileItem[];
  resolutions: Map<string, ConflictResolution>;
  selectedFilePath: string | null;
  onSelectFile: (path: string) => void;
  onSetResolution: (path: string, resolution: ConflictResolution) => void;
  onBulkResolve: (type: 'all_zip' | 'all_original' | 'all_restore' | 'all_delete') => void;
  onViewDiffMobile?: (file: DiffFileItem) => void;
}

export const SyncConflictResolver: React.FC<SyncConflictResolverProps> = ({
  files,
  resolutions,
  selectedFilePath,
  onSelectFile,
  onSetResolution,
  onBulkResolve,
  onViewDiffMobile,
}) => {
  const [filter, setFilter] = useState<'all' | 'conflicts' | 'missing' | 'added'>('all');
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [activeSheetFile, setActiveSheetFile] = useState<DiffFileItem | null>(null);

  // Categorize
  const modifiedConflicts = files.filter(f => f.status === 'modified');
  const missingFiles = files.filter(f => f.status === 'removed');
  const addedFiles = files.filter(f => f.status === 'added');

  const filteredFiles = files.filter(f => {
    if (filter === 'conflicts') return f.status === 'modified';
    if (filter === 'missing') return f.status === 'removed';
    if (filter === 'added') return f.status === 'added';
    return f.status !== 'unchanged';
  });

  const openResolutionSheet = (file: DiffFileItem) => {
    setActiveSheetFile(file);
    setIsMobileSheetOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-surface-1 rounded-2xl border border-border overflow-hidden">
      {/* 1. Header Toolbar (Height: 56px = 7x8pt) */}
      <div className="px-4 py-3 border-b border-border bg-surface-2/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle size={16} />
          </div>
          <div>
            <span className="text-xs font-bold text-text-primary block">
              Sync Conflict Resolver
            </span>
            <span className="text-[11px] text-text-secondary">
              {modifiedConflicts.length} overlapping files · {missingFiles.length} missing in ZIP
            </span>
          </div>
        </div>

        {/* Bulk Action Controls (8pt system, touch height >= 36-40px) */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          <button
            type="button"
            onClick={() => onBulkResolve('all_zip')}
            className="min-h-[36px] px-3 py-1.5 bg-accent/15 hover:bg-accent/25 text-accent border border-accent/30 font-bold rounded-xl transition-all cursor-pointer active:scale-95"
            title="Accept uploaded ZIP changes for all overlapping files"
          >
            Accept All ZIP
          </button>
          <button
            type="button"
            onClick={() => onBulkResolve('all_original')}
            className="min-h-[36px] px-3 py-1.5 bg-surface-2 hover:bg-surface-3 text-text-secondary hover:text-text-primary border border-border font-medium rounded-xl transition-all cursor-pointer active:scale-95"
            title="Keep repository versions for all overlapping files"
          >
            Keep All Repo
          </button>
          {missingFiles.length > 0 && (
            <button
              type="button"
              onClick={() => onBulkResolve('all_restore')}
              className="min-h-[36px] px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold rounded-xl transition-all cursor-pointer active:scale-95"
              title="Preserve all missing files in repository without deleting"
            >
              Restore All Missing
            </button>
          )}
        </div>
      </div>

      {/* 2. Category Filter Tabs (Height: 44px minimum touch target) */}
      <div className="px-4 py-2 border-b border-border bg-surface-1/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 text-xs font-medium">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`min-h-[36px] px-3 rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
            filter === 'all' ? 'bg-card text-text-primary font-bold shadow-xs' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          All ({files.filter(f => f.status !== 'unchanged').length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('conflicts')}
          className={`min-h-[36px] px-3 rounded-xl transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            filter === 'conflicts' ? 'bg-card text-text-primary font-bold shadow-xs' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-accent" />
          <span>Overlapping ({modifiedConflicts.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setFilter('missing')}
          className={`min-h-[36px] px-3 rounded-xl transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            filter === 'missing' ? 'bg-card text-text-primary font-bold shadow-xs' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-400" />
          <span>Missing / Deletions ({missingFiles.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setFilter('added')}
          className={`min-h-[36px] px-3 rounded-xl transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            filter === 'added' ? 'bg-card text-text-primary font-bold shadow-xs' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>New Additions ({addedFiles.length})</span>
        </button>
      </div>

      {/* 3. Itemized Conflict List with Resolution Toggles (Strict 8pt spacing) */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 no-scrollbar">
        {filteredFiles.length === 0 ? (
          <div className="h-48 sm:h-64 flex flex-col items-center justify-center text-center p-6 bg-surface-1/50 rounded-2xl border border-dashed border-border/80">
            <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center text-text-tertiary mb-2">
              <Check size={20} />
            </div>
            <span className="text-xs font-semibold text-text-primary">
              {filter === 'all' 
                ? 'No file differences found'
                : `No ${filter === 'conflicts' ? 'overlapping conflict' : filter === 'missing' ? 'missing/deleted' : 'added'} files`}
            </span>
            <p className="text-[11px] text-text-tertiary mt-1 max-w-xs">
              {filter === 'all' 
                ? 'The files in the uploaded ZIP match the current repository state.'
                : 'All items in this filter category have been resolved or are not present.'}
            </p>
          </div>
        ) : (
          filteredFiles.map((file) => {
            const isSelected = selectedFilePath === file.path;
            const currentRes = resolutions.get(file.path) || (file.status === 'removed' ? 'restore' : 'take_zip');
          const isModified = file.status === 'modified';
          const isRemoved = file.status === 'removed';
          const isAdded = file.status === 'added';

          return (
            <div
              key={file.path}
              onClick={() => onSelectFile(file.path)}
              className={`p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isSelected
                  ? 'bg-surface-2/90 border-accent/50 shadow-xs'
                  : 'bg-surface-1 hover:bg-surface-2/50 border-border/70'
              }`}
            >
              {/* File Info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isModified ? 'bg-accent/15 text-accent' :
                  isRemoved ? 'bg-rose-500/15 text-rose-400' :
                  'bg-emerald-500/15 text-emerald-400'
                }`}>
                  <FileCode size={15} />
                </div>

                <div className="min-w-0">
                  <span className="font-mono text-xs font-bold text-text-primary truncate block" title={file.path}>
                    {file.path}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-text-tertiary font-mono">
                    <span className="font-bold uppercase tracking-wider text-[10px]">
                      {isModified ? 'Overlap Conflict' : isRemoved ? 'Missing in ZIP' : 'New File'}
                    </span>
                    {file.additions > 0 && <span className="text-emerald-400 font-semibold">+{file.additions}</span>}
                    {file.deletions > 0 && <span className="text-rose-400 font-semibold">-{file.deletions}</span>}
                  </div>
                </div>
              </div>

              {/* Desktop Resolution Button Group (Height: 36px) */}
              <div 
                onClick={(e) => e.stopPropagation()} 
                className="hidden sm:flex items-center bg-surface-2 p-1 rounded-xl border border-border text-xs font-semibold shrink-0"
              >
                {isModified && (
                  <>
                    <button
                      type="button"
                      onClick={() => onSetResolution(file.path, 'take_zip')}
                      className={`min-h-[32px] px-3 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                        currentRes === 'take_zip'
                          ? 'bg-accent text-white shadow-xs font-bold'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <Check size={12} />
                      <span>Take ZIP</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSetResolution(file.path, 'keep_original')}
                      className={`min-h-[32px] px-3 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                        currentRes === 'keep_original'
                          ? 'bg-surface-3 text-text-primary shadow-xs font-bold'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <span>Keep Original</span>
                    </button>
                  </>
                )}

                {isRemoved && (
                  <>
                    <button
                      type="button"
                      onClick={() => onSetResolution(file.path, 'restore')}
                      className={`min-h-[32px] px-3 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                        currentRes === 'restore'
                          ? 'bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <RotateCcw size={12} />
                      <span>Restore / Retain</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSetResolution(file.path, 'delete')}
                      className={`min-h-[32px] px-3 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                        currentRes === 'delete'
                          ? 'bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <Trash2 size={12} />
                      <span>Delete in Git</span>
                    </button>
                  </>
                )}

                {isAdded && (
                  <>
                    <button
                      type="button"
                      onClick={() => onSetResolution(file.path, 'take_zip')}
                      className={`min-h-[32px] px-3 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                        currentRes === 'take_zip'
                          ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <Check size={12} />
                      <span>Include</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSetResolution(file.path, 'keep_original')}
                      className={`min-h-[32px] px-3 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                        currentRes === 'keep_original'
                          ? 'bg-surface-3 text-text-primary font-bold'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <span>Skip</span>
                    </button>
                  </>
                )}
              </div>

              {/* Mobile Quick Actions: Inspect Diff & Resolve Trigger Button (Touch target: 44px, 8pt system) */}
              <div className="sm:hidden flex items-center gap-2 pt-2 border-t border-border/40">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectFile(file.path);
                    if (onViewDiffMobile) onViewDiffMobile(file);
                  }}
                  className="min-h-[44px] flex-1 px-3 py-2 bg-surface-2 hover:bg-surface-3 border border-border rounded-xl text-xs font-bold text-sky-400 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <FileCode size={14} />
                  <span>Inspect Diff</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openResolutionSheet(file);
                  }}
                  className="min-h-[44px] flex-1 px-3 py-2 bg-accent/10 hover:bg-accent/20 border border-accent/30 rounded-xl text-xs font-bold text-accent flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Sliders size={14} />
                  <span className="truncate">Action ({currentRes.replace('_', ' ')})</span>
                </button>
              </div>
            </div>
          );
        }))}
      </div>

      {/* 4. Mobile Bottom Sheet for Conflict Resolution (Safe area protected) */}
      {isMobileSheetOpen && activeSheetFile && (
        <div className="fixed inset-0 z-60 flex flex-col justify-end bg-black/75 backdrop-blur-xs select-none sm:hidden">
          <div 
            onClick={() => setIsMobileSheetOpen(false)}
            className="absolute inset-0"
          />

          <div className="relative w-full bg-surface-1 border-t border-border rounded-t-3xl pt-3 pb-[calc(env(safe-area-inset-bottom)+20px)] px-5 shadow-2xl flex flex-col gap-4 z-10 animate-fade-up">
            {/* Grab Handle */}
            <div className="w-10 h-1.5 bg-surface-3 rounded-full mx-auto shrink-0" />

            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="min-w-0 pr-3">
                <span className="text-xs font-bold uppercase tracking-wider text-text-tertiary block">
                  Resolve Conflict
                </span>
                <span className="font-mono text-xs font-bold text-text-primary truncate block" title={activeSheetFile.path}>
                  {activeSheetFile.path}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileSheetOpen(false)}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-text-secondary hover:text-text-primary bg-surface-2"
              >
                <X size={18} />
              </button>
            </div>

            {/* Mobile Touch Action Buttons (Min height 48px = 6x8pt) */}
            <div className="flex flex-col gap-3">
              {onViewDiffMobile && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileSheetOpen(false);
                    onViewDiffMobile(activeSheetFile);
                  }}
                  className="min-h-[44px] w-full px-4 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-sky-400 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <FileCode size={15} />
                  <span>Inspect Side-by-Side Diff</span>
                </button>
              )}
              {activeSheetFile.status === 'modified' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onSetResolution(activeSheetFile.path, 'take_zip');
                      setIsMobileSheetOpen(false);
                    }}
                    className="min-h-[48px] w-full px-4 rounded-xl bg-accent text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.98]"
                  >
                    <Check size={16} />
                    <span>Take Uploaded ZIP Version</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSetResolution(activeSheetFile.path, 'keep_original');
                      setIsMobileSheetOpen(false);
                    }}
                    className="min-h-[48px] w-full px-4 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-text-primary font-bold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    <span>Keep Existing Repository Version</span>
                  </button>
                </>
              )}

              {activeSheetFile.status === 'removed' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onSetResolution(activeSheetFile.path, 'restore');
                      setIsMobileSheetOpen(false);
                    }}
                    className="min-h-[48px] w-full px-4 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    <RotateCcw size={16} />
                    <span>Restore / Retain in Repository</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSetResolution(activeSheetFile.path, 'delete');
                      setIsMobileSheetOpen(false);
                    }}
                    className="min-h-[48px] w-full px-4 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    <Trash2 size={16} />
                    <span>Confirm Delete from Repository in Git</span>
                  </button>
                </>
              )}

              {activeSheetFile.status === 'added' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onSetResolution(activeSheetFile.path, 'take_zip');
                      setIsMobileSheetOpen(false);
                    }}
                    className="min-h-[48px] w-full px-4 rounded-xl bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    <Check size={16} />
                    <span>Include New File in Sync</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSetResolution(activeSheetFile.path, 'keep_original');
                      setIsMobileSheetOpen(false);
                    }}
                    className="min-h-[48px] w-full px-4 rounded-xl bg-surface-2 border border-border text-text-secondary font-bold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    <span>Skip This File</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
