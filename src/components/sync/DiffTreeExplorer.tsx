import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Folder,
  FolderOpen,
  FileCode2,
  FilePlus2,
  FileX2,
  ChevronRight,
  Check,
  Minus,
  FolderPlus,
  FolderMinus,
  CheckCheck,
  XCircle,
  Eye,
  X,
} from 'lucide-react';
import {
  DiffFileItem,
  DiffTreeNode,
  DiffTreeStatusFilter,
  BulkResolutionType,
  ConflictResolution,
  buildDiffTree,
  collectFolderPaths,
  getNodeSelectionState,
  applyTreeNodeSelection,
  formatFileSize,
} from '../../mobile/utils/zipSyncEngine';

interface DiffTreeExplorerProps {
  files: DiffFileItem[];
  selectedFilePath: string | null;
  onSelectFile: (path: string) => void;
  onInspectDiff: (file: DiffFileItem) => void;
  resolutions: Map<string, ConflictResolution>;
  onUpdateResolutions: (next: Map<string, ConflictResolution>) => void;
  onBulkResolve: (type: BulkResolutionType) => void;
}

export const DiffTreeExplorer: React.FC<DiffTreeExplorerProps> = ({
  files,
  selectedFilePath,
  onSelectFile,
  onInspectDiff,
  resolutions,
  onUpdateResolutions,
  onBulkResolve,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DiffTreeStatusFilter>('all');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(() => new Set());

  const counts = useMemo(() => {
    let modified = 0;
    let added = 0;
    let removed = 0;
    let unchanged = 0;
    for (const f of files) {
      if (f.status === 'modified') modified++;
      else if (f.status === 'added') added++;
      else if (f.status === 'removed') removed++;
      else if (f.status === 'unchanged') unchanged++;
    }
    return { modified, added, removed, unchanged, total: modified + added + removed };
  }, [files]);

  const treeNodes = useMemo(
    () => buildDiffTree(files, { searchQuery, statusFilter }),
    [files, searchQuery, statusFilter]
  );

  const allFolderPaths = useMemo(() => collectFolderPaths(treeNodes), [treeNodes]);

  useEffect(() => {
    setExpandedFolders(new Set(allFolderPaths));
  }, [files, searchQuery, statusFilter]);

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const handleExpandAll = () => setExpandedFolders(new Set(allFolderPaths));
  const handleCollapseAll = () => setExpandedFolders(new Set());

  const handleToggleNodeCheckbox = (node: DiffTreeNode, e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    const state = getNodeSelectionState(node, resolutions);
    const shouldSelect = state !== 'checked';
    onUpdateResolutions(applyTreeNodeSelection(node, resolutions, shouldSelect));
  };

  const renderCheckbox = (node: DiffTreeNode) => {
    const state = getNodeSelectionState(node, resolutions);
    const isChecked = state === 'checked';
    const isMixed = state === 'indeterminate';

    return (
      <button
        type="button"
        role="checkbox"
        aria-checked={isMixed ? 'mixed' : isChecked}
        aria-label={`${isChecked ? 'Deselect' : 'Select'} ${node.name}`}
        onClick={(e) => handleToggleNodeCheckbox(node, e)}
        className={`w-[18px] h-[18px] rounded-[5px] border flex items-center justify-center shrink-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${
          isChecked
            ? 'bg-accent border-accent text-white'
            : isMixed
              ? 'bg-accent/15 border-accent text-accent'
              : 'bg-surface-1 border-border-accent hover:border-accent/70 text-transparent'
        }`}
      >
        {isChecked && <Check size={12} strokeWidth={3} />}
        {isMixed && <Minus size={12} strokeWidth={3} />}
      </button>
    );
  };

  const renderTreeNode = (node: DiffTreeNode) => {
    if (node.type === 'folder') {
      const isExpanded = expandedFolders.has(node.path);
      return (
        <div key={node.id} className="select-none">
          <div
            style={{ paddingLeft: `${node.depth * 16 + 8}px` }}
            onClick={() => toggleFolder(node.path)}
            className="min-h-[40px] pr-2.5 py-1.5 rounded-xl flex items-center justify-between gap-2 hover:bg-surface-2/70 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="w-5 h-5 rounded-md flex items-center justify-center text-text-tertiary group-hover:text-text-primary shrink-0">
                <ChevronRight
                  size={14}
                  className={`transition-transform duration-150 ${isExpanded ? 'rotate-90' : ''}`}
                />
              </span>

              {renderCheckbox(node)}

              {isExpanded ? (
                <FolderOpen size={15} className="text-accent shrink-0" />
              ) : (
                <Folder size={15} className="text-text-secondary shrink-0" />
              )}

              <span className="font-mono text-xs font-semibold text-text-primary truncate">
                {node.name}
              </span>
            </div>

            <span className="text-[11px] font-mono text-text-secondary bg-surface-2/80 border border-border/80 px-2 py-0.5 rounded-md tabular-nums shrink-0">
              {node.totalFiles} {node.totalFiles === 1 ? 'file' : 'files'}
            </span>
          </div>

          <AnimatePresence initial={false}>
            {isExpanded && node.children.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                <div
                  style={{ left: `${node.depth * 16 + 18}px` }}
                  className="absolute top-0 bottom-2 w-px bg-border/60 pointer-events-none"
                  aria-hidden="true"
                />
                {node.children.map((child) => renderTreeNode(child))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    const file = node.file!;
    const isSelectedRow = selectedFilePath === file.path;
    const isRemoved = file.status === 'removed';
    const isAdded = file.status === 'added';
    const isUnchanged = file.status === 'unchanged';
    const state = isUnchanged ? 'unchecked' : getNodeSelectionState(node, resolutions);
    const isChecked = state === 'checked';

    return (
      <div
        key={node.id}
        style={{ paddingLeft: `${node.depth * 16 + 26}px` }}
        onClick={() => {
          onSelectFile(file.path);
          onInspectDiff(file);
        }}
        className={`min-h-[42px] pr-2.5 py-1.5 rounded-xl flex items-center justify-between gap-2 transition-colors cursor-pointer group ${
          isSelectedRow
            ? 'bg-accent/12 text-text-primary'
            : 'hover:bg-surface-2/65 text-text-primary'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {!isUnchanged && renderCheckbox(node)}

          {isAdded ? (
            <FilePlus2 size={14} className="text-addition shrink-0" />
          ) : isRemoved ? (
            <FileX2 size={14} className="text-deletion shrink-0" />
          ) : isUnchanged ? (
            <Check size={14} className="text-text-tertiary shrink-0" />
          ) : (
            <FileCode2 size={14} className="text-accent shrink-0" />
          )}

          <span
            className={`font-mono text-xs truncate ${
              isRemoved && isChecked
                ? 'line-through text-deletion'
                : isSelectedRow
                  ? 'font-semibold text-text-primary'
                  : 'text-text-primary'
            }`}
            title={file.path}
          >
            {node.name}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0 text-[11px] font-mono tabular-nums">
          {(file.additions > 0 || file.deletions > 0) && (
            <span className="hidden sm:inline-flex items-center gap-1">
              {file.additions > 0 && <span className="text-addition">+{file.additions}</span>}
              {file.deletions > 0 && <span className="text-deletion">-{file.deletions}</span>}
            </span>
          )}
          <span className="text-text-tertiary">
            {formatFileSize(node.byteSize)}
          </span>
          <button
            type="button"
            aria-label={`Inspect diff for ${file.path}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelectFile(file.path);
              onInspectDiff(file);
            }}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-text-tertiary hover:text-accent hover:bg-surface-2 transition-colors cursor-pointer"
            title="Inspect diff"
          >
            <Eye size={13} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-surface-1">
      {/* Header & Search */}
      <div className="p-3 sm:p-3.5 border-b border-border space-y-2.5 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-text-primary">Changed Files</h3>
            <p className="text-[11px] text-text-secondary tabular-nums mt-0.5 truncate">
              {counts.modified} modified · {counts.added} added · {counts.removed} missing
              {counts.unchanged > 0 ? ` · ${counts.unchanged} identical` : ''}
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleExpandAll}
              title="Expand all folders"
              aria-label="Expand all folders"
              className="w-8 h-8 rounded-full border border-border bg-surface-2/60 hover:bg-surface-2 text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors cursor-pointer btn-tactile"
            >
              <FolderPlus size={14} />
            </button>
            <button
              type="button"
              onClick={handleCollapseAll}
              title="Collapse all folders"
              aria-label="Collapse all folders"
              className="w-8 h-8 rounded-full border border-border bg-surface-2/60 hover:bg-surface-2 text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors cursor-pointer btn-tactile"
            >
              <FolderMinus size={14} />
            </button>
            <button
              type="button"
              onClick={() => onBulkResolve('all_zip')}
              title="Select all ZIP updates"
              aria-label="Accept All ZIP"
              className="w-8 h-8 rounded-full border border-border bg-surface-2/60 hover:bg-accent/15 hover:border-accent/40 text-text-secondary hover:text-accent flex items-center justify-center transition-colors cursor-pointer btn-tactile"
            >
              <CheckCheck size={14} />
            </button>
            <button
              type="button"
              onClick={() => onBulkResolve('all_original')}
              title="Keep all repository files"
              aria-label="Keep All Repo"
              className="w-8 h-8 rounded-full border border-border bg-surface-2/60 hover:bg-surface-2 text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors cursor-pointer btn-tactile"
            >
              <XCircle size={14} />
            </button>
          </div>
        </div>

        <div className="relative flex items-center bg-surface-2/50 border border-border focus-within:border-accent rounded-xl px-3 min-h-[38px] transition-colors">
          <Search size={14} className="text-text-tertiary shrink-0 mr-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search changed files tree..."
            aria-label="Search changed files tree"
            className="w-full bg-transparent text-xs text-text-primary placeholder:text-text-tertiary outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="w-6 h-6 rounded-md flex items-center justify-center text-text-tertiary hover:text-text-primary cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar min-w-0 max-w-full">
            {([
              { id: 'all', label: 'Changed', count: counts.total },
              { id: 'modified', label: 'Modified', count: counts.modified },
              { id: 'added', label: 'Added', count: counts.added },
              { id: 'removed', label: 'Missing', count: counts.removed },
              ...(counts.unchanged > 0
                ? [{ id: 'unchanged' as const, label: 'Identical', count: counts.unchanged }]
                : []),
            ] as const).map((tab) => {
              const active = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`min-h-[30px] px-2 sm:px-2.5 rounded-lg text-[11px] sm:text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1 sm:gap-1.5 tabular-nums ${
                    active
                      ? 'bg-surface-2 text-text-primary font-semibold border border-border'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-2/40 border border-transparent'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="text-[11px] font-mono text-text-tertiary">{tab.count}</span>
                </button>
              );
            })}
          </div>

          {counts.removed > 0 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onBulkResolve('all_restore')}
                className="min-h-[28px] px-2 rounded-lg text-[11px] font-semibold bg-warning/10 border border-warning/25 text-warning hover:bg-warning/15 cursor-pointer whitespace-nowrap"
              >
                Retain Missing
              </button>
              <button
                type="button"
                onClick={() => onBulkResolve('all_delete')}
                className="min-h-[28px] px-2 rounded-lg text-[11px] font-semibold bg-danger/10 border border-danger/25 text-danger hover:bg-danger/15 cursor-pointer whitespace-nowrap"
              >
                Delete Missing
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tree Canvas */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-2.5 space-y-0.5 min-h-0">
        {treeNodes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-xs text-text-secondary">
            <p className="font-semibold text-text-primary">No matching changed files</p>
            <p className="text-text-tertiary mt-1">
              {searchQuery ? 'Try clearing your search query or switching status filter.' : 'Uploaded ZIP matches the repository.'}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-border/80 bg-surface-2/20 p-1.5 space-y-0.5">
            {treeNodes.map((node) => renderTreeNode(node))}
          </div>
        )}
      </div>
    </div>
  );
};
