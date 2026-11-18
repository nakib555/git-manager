import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAppContext } from '../../../AppContext';
import { Search, X, FilePlus2 } from 'lucide-react';
import { fetchFileContentSafe } from '../../../mobile/utils/gitApi';
import { isRepositoryOwnedByUser } from '../../../mobile/utils/repoOwnership';
import { DesktopFileTreeItem, DesktopTreeNode } from './DesktopFileTreeItem';
import { DeleteFileConfirmModal } from '../../../components/modals/DeleteFileConfirmModal';
import { Skeleton } from '../../../mobile/components/skeleton/BaseSkeleton';
import { FileTreeSkeleton, CodeViewerSkeleton } from '../../../mobile/components/skeleton/ScreenSkeletons';
import { UniversalFilePreview } from '../../preview/components/UniversalFilePreview';
import { MobileFileEditor } from '../../../mobile/components/editor/MobileFileEditor';
import { filterFileTree } from '../utils/fileTreeFilter';

export const DesktopFilesView: React.FC = () => {
  const { currentRepo, currentRepoOwner, currentBranch, activeFiles, isLoadingRepoDetails, githubToken, githubUser, githubRepos, adminModeOverride, deleteFileOrFolder, showToast } = useAppContext();
  const [selectedFile, setSelectedFile] = useState<any | null>(null);
  const [fileSearch, setFileSearch] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [deleteTarget, setDeleteTarget] = useState<{ path: string; isFolder: boolean } | null>(null);
  const [editorState, setEditorState] = useState<{ path: string; content: string } | null>(null);
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFilePath, setNewFilePath] = useState('');
  const [previewRefreshKey, setPreviewRefreshKey] = useState(0);
  const [treeWidth, setTreeWidth] = useState<number>(() => {
    try {
      const saved = Number(localStorage.getItem('gm_files_tree_width'));
      if (saved >= 210 && saved <= 400) return saved;
    } catch (_) {}
    return 256;
  });
  const isResizingRef = useRef(false);

  // Reset selected file and search on repo or branch switch
  useEffect(() => {
    setSelectedFile(null);
    setFileSearch('');
    setIsFullscreen(false);
    setEditorState(null);
    setIsCreatingFile(false);
  }, [currentRepo, currentBranch]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return;
      const containerLeft = document.querySelector('[data-files-workspace]')?.getBoundingClientRect().left ?? 0;
      const next = Math.min(400, Math.max(210, e.clientX - containerLeft));
      setTreeWidth(next);
    };
    const onUp = () => {
      if (!isResizingRef.current) return;
      isResizingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      try { localStorage.setItem('gm_files_tree_width', String(treeWidth)); } catch (_) {}
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [treeWidth]);

  const isOwner = useMemo(() => {
    return isRepositoryOwnedByUser({
      repoName: currentRepo,
      repoOwner: currentRepoOwner,
      userLogin: githubUser?.login,
      reposList: githubRepos,
      adminOverride: adminModeOverride,
    });
  }, [currentRepo, currentRepoOwner, githubUser?.login, githubRepos, adminModeOverride]);

  const treeNodes = useMemo(() => {
    const list = activeFiles || [];
    const rootNodes: DesktopTreeNode[] = [];
    const dirMap = new Map<string, DesktopTreeNode>();

    list.forEach(file => {
      const parts = (file.name || file.path || '').split('/').filter(Boolean);
      let currentPath = '';
      parts.forEach((part: string, idx: number) => {
        const isFile = idx === parts.length - 1 && file.type === 'file';
        const parentPath = currentPath;
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        if (isFile) {
          const node: DesktopTreeNode = { name: part, path: currentPath, type: 'file', size: file.size, lines: file.lines };
          if (idx === 0) rootNodes.push(node);
          else dirMap.get(parentPath)?.children?.push(node);
        } else {
          if (!dirMap.has(currentPath)) {
            const dirNode: DesktopTreeNode = { name: part, path: currentPath, type: 'dir', children: [] };
            dirMap.set(currentPath, dirNode);
            if (idx === 0) rootNodes.push(dirNode);
            else dirMap.get(parentPath)?.children?.push(dirNode);
          }
        }
      });
    });
    return rootNodes;
  }, [activeFiles]);

  const { nodes: visibleNodes, matchedFiles: visibleFileCount, isFiltering } = useMemo(
    () => filterFileTree(treeNodes, fileSearch),
    [treeNodes, fileSearch]
  );

  const activePath = selectedFile?.path || activeFiles.find((f: any) => f.type === 'file')?.name || '';
  const activeFileName = activePath.split('/').pop() || activePath;

  const handleOpenEditor = async (targetPath: string) => {
    if (!targetPath || !currentRepo) return;
    try {
      const content = await fetchFileContentSafe({
        filePath: targetPath,
        repoName: currentRepo,
        owner: currentRepoOwner,
        branch: currentBranch || 'main',
        token: githubToken,
      });
      setEditorState({ path: targetPath, content });
    } catch (err: any) {
      showToast(err?.message || 'Unable to load file for editing', 'error');
    }
  };

  const handleStartNewFile = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = newFilePath.trim().replace(/^\/+/, '');
    if (!cleaned) {
      showToast('Enter a valid file path (e.g., src/utils.ts)', 'warning');
      return;
    }
    setIsCreatingFile(false);
    setNewFilePath('');
    setEditorState({
      path: cleaned,
      content: `// ${cleaned}\n\nexport {};\n`,
    });
  };

  return (
    <div data-files-workspace className="flex w-full h-full gap-0 min-h-0 overflow-hidden relative">
      <div
        style={{ width: `${treeWidth}px` }}
        className="bg-card border border-border rounded-2xl p-3 flex flex-col shrink-0 min-h-0 shadow-xs"
      >
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider px-0.5">
            Explorer {isFiltering ? `(${visibleFileCount})` : `(${activeFiles.filter((f: any) => f.type === 'file').length})`}
          </span>
          {isOwner && (
            <button
              type="button"
              onClick={() => setIsCreatingFile((prev) => !prev)}
              aria-label="New file"
              title="Create new file"
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-surface-1 hover:bg-hover border border-border text-text-secondary hover:text-text-main transition-colors cursor-pointer"
            >
              <FilePlus2 size={12} />
              <span>New</span>
            </button>
          )}
        </div>

        {isCreatingFile && (
          <form onSubmit={handleStartNewFile} className="mb-2.5 flex items-center gap-1">
            <input
              type="text"
              value={newFilePath}
              onChange={(e) => setNewFilePath(e.target.value)}
              placeholder="src/newFile.ts"
              autoFocus
              className="flex-1 min-w-0 bg-main border border-primary/50 rounded-lg px-2 py-1 text-xs text-text-main outline-none"
            />
            <button
              type="submit"
              className="px-2 py-1 rounded-lg bg-primary text-white text-[11px] font-medium cursor-pointer shrink-0"
            >
              Open
            </button>
          </form>
        )}

        <div className="relative mb-2.5">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="text"
            value={fileSearch}
            onChange={(e) => setFileSearch(e.target.value)}
            placeholder="Filter files..."
            aria-label="Filter repository files"
            className="w-full bg-main border border-border rounded-xl pl-8 pr-7 py-1.5 text-xs text-text-main outline-none focus:border-primary transition-colors"
          />
          {isFiltering && (
            <button
              type="button"
              onClick={() => setFileSearch('')}
              aria-label="Clear file filter"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto pr-1 no-scrollbar space-y-0.5">
          {isLoadingRepoDetails && activeFiles.length === 0 ? (
            <FileTreeSkeleton />
          ) : visibleNodes.length === 0 ? (
            <div className="py-8 text-center text-xs text-text-muted">
              {isFiltering ? `No files match "${fileSearch}"` : 'No files in repository'}
            </div>
          ) : (
            visibleNodes.map(node => (
              <DesktopFileTreeItem
                key={node.path}
                item={node}
                depth={0}
                activeFileName={activePath}
                isOwner={isOwner}
                forceExpanded={isFiltering}
                onSelect={setSelectedFile}
                onDelete={(item: DesktopTreeNode) => setDeleteTarget({ path: item.path, isFolder: item.type === 'dir' })}
              />
            ))
          )}
        </div>
      </div>

      {/* Resizable Tree Divider */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize file explorer panel"
        tabIndex={0}
        onMouseDown={(e) => {
          e.preventDefault();
          isResizingRef.current = true;
          document.body.style.cursor = 'col-resize';
          document.body.style.userSelect = 'none';
        }}
        onDoubleClick={() => setTreeWidth(256)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') setTreeWidth((w) => Math.min(400, w + 16));
          else if (e.key === 'ArrowLeft') setTreeWidth((w) => Math.max(210, w - 16));
        }}
        className="w-3 shrink-0 cursor-col-resize flex items-center justify-center group"
      >
        <div className="w-0.5 h-10 rounded-full bg-border/60 group-hover:bg-primary transition-colors" />
      </div>

      <div className="flex-1 min-w-0 min-h-0 overflow-hidden flex flex-col">
        {isLoadingRepoDetails && activeFiles.length === 0 ? (
          <div className="flex-1 bg-card border border-border rounded-2xl overflow-hidden shadow-xs flex flex-col">
            <div className="h-11 border-b border-border px-4 flex items-center justify-between bg-main/40">
              <Skeleton className="w-36 h-3" />
              <Skeleton className="w-20 h-3" />
            </div>
            <div className="flex-1 overflow-hidden p-2">
              <CodeViewerSkeleton />
            </div>
          </div>
        ) : activePath ? (
          <UniversalFilePreview
            filePath={activePath}
            fileName={activeFileName}
            repoName={currentRepo || ''}
            owner={currentRepoOwner}
            branch={currentBranch || 'main'}
            token={githubToken}
            isOwner={isOwner}
            isFullscreen={isFullscreen}
            refreshTrigger={previewRefreshKey}
            onEdit={isOwner ? () => handleOpenEditor(activePath) : undefined}
            onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
            className="h-full"
          />
        ) : (
          <div className="flex-1 bg-card border border-border rounded-2xl flex flex-col items-center justify-center text-text-muted text-xs optical-center-box p-6">
            <p className="text-balance text-text-secondary font-medium">Select a file from the repository tree to preview</p>
            <p className="text-[11px] text-text-tertiary mt-1 text-pretty">Source code, diffs, hex inspection, and rich media</p>
          </div>
        )}
      </div>

      {isFullscreen && activePath && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs p-6 flex flex-col">
          <UniversalFilePreview
            filePath={activePath}
            fileName={activeFileName}
            repoName={currentRepo || ''}
            owner={currentRepoOwner}
            branch={currentBranch || 'main'}
            token={githubToken}
            isOwner={isOwner}
            isFullscreen={true}
            refreshTrigger={previewRefreshKey}
            onEdit={isOwner ? () => { setIsFullscreen(false); handleOpenEditor(activePath); } : undefined}
            onToggleFullscreen={() => setIsFullscreen(false)}
            onClose={() => setIsFullscreen(false)}
            className="h-full w-full shadow-2xl"
          />
        </div>
      )}

      {editorState && (
        <MobileFileEditor
          filePath={editorState.path}
          initialContent={editorState.content}
          isOwner={isOwner}
          onClose={() => setEditorState(null)}
          onCommitted={() => {
            setSelectedFile({ name: editorState.path.split('/').pop(), path: editorState.path, type: 'file' });
            setPreviewRefreshKey((k) => k + 1);
            setEditorState(null);
          }}
        />
      )}

      {deleteTarget && (
        <DeleteFileConfirmModal
          isOpen={true}
          onClose={() => setDeleteTarget(null)}
          targetPath={deleteTarget.path}
          isFolder={deleteTarget.isFolder}
          currentRepo={currentRepo || ''}
          currentBranch={currentBranch || 'main'}
          allFiles={activeFiles || []}
          onConfirmDelete={async ({ targetPath, isFolder, commitMessage }) => {
            const success = await deleteFileOrFolder({
              targetPath,
              isFolder,
              commitMessage,
              branch: currentBranch || 'main',
              throwOnError: true,
            });
            if (success && selectedFile?.path === targetPath) {
              setSelectedFile(null);
            }
            return success;
          }}
        />
      )}
    </div>
  );
};
