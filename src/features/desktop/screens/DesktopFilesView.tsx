import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../../../AppContext';
import { Search, Home, Copy, Check, Lock, Trash2, ShieldCheck } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { fetchFileContentSafe } from '../../../mobile/utils/gitApi';
import { isRepositoryOwnedByUser } from '../../../mobile/utils/repoOwnership';
import { getCodeLanguage } from '../utils/desktopUtils';
import { DesktopFileTreeItem, DesktopTreeNode } from './DesktopFileTreeItem';
import { DeleteFileConfirmModal } from '../../../components/modals/DeleteFileConfirmModal';
import { FileTreeSkeleton, CodeViewerSkeleton } from '../../../mobile/components/skeleton/ScreenSkeletons';

import { UniversalFilePreview } from '../../preview/components/UniversalFilePreview';

export const DesktopFilesView: React.FC = () => {
  const { currentRepo, currentRepoOwner, currentBranch, activeFiles, isLoadingRepoDetails, githubToken, githubUser, githubRepos, adminModeOverride, deleteFileOrFolder, showToast } = useAppContext();
  const [selectedFile, setSelectedFile] = useState<any | null>(null);
  const [fileSearch, setFileSearch] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [deleteTarget, setDeleteTarget] = useState<{ path: string; isFolder: boolean } | null>(null);

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
    const rootNodes: any[] = [];
    const dirMap = new Map<string, any>();

    list.forEach(file => {
      const parts = (file.name || file.path || '').split('/');
      let currentPath = '';
      parts.forEach((part: string, idx: number) => {
        const isFile = idx === parts.length - 1 && file.type === 'file';
        const parentPath = currentPath;
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        if (isFile) {
          const node = { name: part, path: currentPath, type: 'file', size: file.size, lines: file.lines };
          if (idx === 0) rootNodes.push(node);
          else dirMap.get(parentPath)?.children?.push(node);
        } else {
          if (!dirMap.has(currentPath)) {
            const dirNode = { name: part, path: currentPath, type: 'dir', children: [] };
            dirMap.set(currentPath, dirNode);
            if (idx === 0) rootNodes.push(dirNode);
            else dirMap.get(parentPath)?.children?.push(dirNode);
          }
        }
      });
    });
    return rootNodes;
  }, [activeFiles]);

  const activePath = selectedFile?.path || activeFiles.find((f: any) => f.type === 'file')?.name || '';
  const activeFileName = activePath.split('/').pop() || activePath;

  return (
    <div className="flex w-full h-full gap-4 min-h-0 overflow-hidden relative">
      <div className="w-64 bg-card border border-border rounded-2xl p-3 flex flex-col shrink-0 min-h-0 shadow-xs">
        <div className="relative mb-3">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={fileSearch}
            onChange={(e) => setFileSearch(e.target.value)}
            placeholder="Search files..."
            className="w-full bg-main border border-border rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-text-main outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex-1 overflow-y-auto pr-1 no-scrollbar space-y-0.5">
          {isLoadingRepoDetails && activeFiles.length === 0 ? (
            <FileTreeSkeleton />
          ) : treeNodes.length === 0 ? (
            <div className="py-8 text-center text-xs text-text-muted">
              No files in repository
            </div>
          ) : (
            treeNodes.map(node => (
              <DesktopFileTreeItem
                key={node.path}
                item={node}
                depth={0}
                activeFileName={activePath}
                isOwner={isOwner}
                onSelect={setSelectedFile}
                onDelete={(item: DesktopTreeNode) => setDeleteTarget({ path: item.path, isFolder: item.type === 'dir' })}
              />
            ))
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {isLoadingRepoDetails && activeFiles.length === 0 ? (
          <div className="flex-1 bg-card border border-border rounded-2xl overflow-hidden shadow-xs flex flex-col">
            <div className="h-11 border-b border-border px-4 flex items-center justify-between bg-main/40">
              <div className="w-36 h-3 rounded bg-surface-3 animate-pulse" />
              <div className="w-20 h-3 rounded bg-surface-3 animate-pulse" />
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
            onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
            className="h-full"
          />
        ) : (
          <div className="flex-1 bg-card border border-border rounded-2xl flex items-center justify-center text-text-muted text-xs">
            Select a file from the repository tree to preview
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
            onToggleFullscreen={() => setIsFullscreen(false)}
            onClose={() => setIsFullscreen(false)}
            className="h-full w-full shadow-2xl"
          />
        </div>
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
