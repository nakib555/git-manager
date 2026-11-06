import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../../../AppContext';
import { Search, Home, Copy, Check, FileCode } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { fetchFileContentSafe } from '../../../mobile/utils/gitApi';
import { getCodeLanguage } from '../utils/desktopUtils';
import { DesktopFileTreeItem } from './DesktopFileTreeItem';

export const DesktopFilesView: React.FC = () => {
  const { currentRepo, currentRepoOwner, currentBranch, activeFiles, githubToken, showToast, theme } = useAppContext();
  const [selectedFile, setSelectedFile] = useState<any | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [fileSearch, setFileSearch] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);

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

  useEffect(() => {
    if (!activePath) return;
    setIsLoadingFile(true);
    fetchFileContentSafe({
      filePath: activePath,
      repoName: currentRepo || '',
      owner: currentRepoOwner || '',
      branch: currentBranch || 'main',
      token: githubToken,
    }).then(content => {
      setFileContent(content || '// File empty');
    }).finally(() => setIsLoadingFile(false));
  }, [activePath, currentRepo, currentRepoOwner, currentBranch, githubToken]);

  const language = getCodeLanguage(activePath);

  return (
    <div className="flex w-full h-full gap-4 min-h-0 overflow-hidden">
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
          {treeNodes.map(node => (
            <DesktopFileTreeItem
              key={node.path}
              item={node}
              depth={0}
              activeFileName={activePath}
              onSelect={setSelectedFile}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 bg-card border border-border rounded-2xl overflow-hidden flex flex-col h-full shadow-xs min-h-0">
        <div className="px-5 py-3 border-b border-border bg-hover/10 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2 text-xs text-text-muted font-medium truncate pr-4">
            <Home size={13} className="text-primary shrink-0" />
            <span className="text-border">/</span>
            <span className="font-semibold text-text-main">{currentRepo}</span>
            <span className="text-border">/</span>
            <span className="font-mono text-primary truncate">{activePath}</span>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(fileContent);
              setIsCopied(true);
              showToast('Code copied to clipboard!');
              setTimeout(() => setIsCopied(false), 2000);
            }}
            className="flex items-center justify-center w-8 h-8 bg-card hover:bg-hover border border-border rounded-lg text-text-main transition-colors cursor-pointer"
          >
            {isCopied ? <Check size={14} className="text-success" /> : <Copy size={14} className="text-text-muted" />}
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-main select-text relative">
          {isLoadingFile ? (
            <div className="h-full flex items-center justify-center text-text-muted gap-2.5 text-xs">
              <span className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <span>Fetching file content stream...</span>
            </div>
          ) : (
            <SyntaxHighlighter
              language={language}
              style={theme === 'dark' ? vscDarkPlus : vs}
              showLineNumbers={true}
              wrapLines={false}
              customStyle={{ margin: 0, padding: '1.25rem', background: 'transparent', fontSize: '12px' }}
            >
              {fileContent || '// Empty file'}
            </SyntaxHighlighter>
          )}
        </div>
      </div>
    </div>
  );
};
