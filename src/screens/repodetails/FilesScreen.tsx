import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../../AppContext';
import { Home, Folder, FileText, FileCode, ChevronRight, ChevronDown, Copy, Check, Search, X } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';

const getCodeLanguage = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'json':
      return 'json';
    case 'css':
      return 'css';
    case 'html':
      return 'markup';
    case 'md':
      return 'markdown';
    case 'py':
      return 'python';
    case 'rs':
      return 'rust';
    case 'go':
      return 'go';
    case 'sh':
    case 'bash':
      return 'bash';
    case 'yml':
    case 'yaml':
      return 'yaml';
    case 'sql':
      return 'sql';
    default:
      return 'typescript';
  }
};

const safeDecodeBase64 = (base64Str: string): string => {
  try {
    const cleanStr = base64Str.replace(/\s/g, '');
    const binary = atob(cleanStr);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
  } catch (_) {
    try {
      return atob(base64Str.replace(/\s/g, ''));
    } catch {
      return '// Unable to decode file preview';
    }
  }
};

interface TreeNode {
  name: string;
  path: string;
  type: 'dir' | 'file';
  children?: TreeNode[];
}

const buildFastTree = (files: any[]): TreeNode[] => {
  if (!files || files.length === 0) return [];
  const root: TreeNode[] = [];
  const dirMap = new Map<string, TreeNode>();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file || !file.name) continue;
    const parts = file.name.split('/');
    let currentPath = '';

    for (let depth = 0; depth < parts.length; depth++) {
      const part = parts[depth];
      const isFile = depth === parts.length - 1 && file.type === 'file';
      const prevPath = currentPath;
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      if (isFile) {
        const fileNode: TreeNode = {
          name: part,
          path: currentPath,
          type: 'file',
        };
        if (depth === 0) {
          root.push(fileNode);
        } else {
          const parent = dirMap.get(prevPath);
          if (parent && parent.children) {
            parent.children.push(fileNode);
          }
        }
      } else {
        if (!dirMap.has(currentPath)) {
          const dirNode: TreeNode = {
            name: part,
            path: currentPath,
            type: 'dir',
            children: [],
          };
          dirMap.set(currentPath, dirNode);
          if (depth === 0) {
            root.push(dirNode);
          } else {
            const parent = dirMap.get(prevPath);
            if (parent && parent.children) {
              parent.children.push(dirNode);
            }
          }
        }
      }
    }
  }

  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.type === 'dir' && b.type !== 'dir') return -1;
      if (a.type !== 'dir' && b.type === 'dir') return 1;
      return a.name.localeCompare(b.name);
    });
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].children && nodes[i].children!.length > 0) {
        sortNodes(nodes[i].children!);
      }
    }
  };

  sortNodes(root);
  return root;
};

const FileTreeItem = React.memo(({ item, depth, activeFileName, onSelect }: any) => {
  // Keep subfolders collapsed by default to prevent rendering thousands of DOM elements
  const [isOpen, setIsOpen] = useState(depth === 0 && !item.path.includes('/'));
  const isSelected = activeFileName === item.path;
  const isDir = item.type === 'dir';
  const Icon = isDir ? Folder : (item.name.endsWith('.md') ? FileText : FileCode);

  return (
    <div className="select-none">
      <div 
        onClick={() => {
          if (isDir) setIsOpen(!isOpen);
          else onSelect(item.path);
        }}
        className={`flex items-center gap-1.5 py-1.5 px-2 rounded-lg cursor-pointer transition-all text-xs font-semibold ${
          isSelected ? 'bg-primary/10 text-primary' : 'text-text-muted hover:text-text-main hover:bg-hover/20'
        }`}
        style={{ paddingLeft: `${Math.min(depth * 14 + 8, 80)}px` }}
      >
        <div className="flex items-center justify-center w-4 h-4 shrink-0 text-text-muted/70">
          {isDir && (
            isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          )}
        </div>
        <Icon size={14} className={isDir ? 'text-primary' : 'text-text-muted'} />
        <span className="truncate">{item.name}</span>
      </div>
      {isDir && isOpen && item.children && item.children.length > 0 && (
        <div>
          {item.children.map((child: any) => (
            <FileTreeItem 
              key={child.path} 
              item={child} 
              depth={depth + 1} 
              activeFileName={activeFileName} 
              onSelect={onSelect} 
            />
          ))}
        </div>
      )}
    </div>
  );
});

FileTreeItem.displayName = 'FileTreeItem';

export const FilesScreen = () => {
  const { activeFiles, currentRepo, githubToken, currentRepoOwner, currentBranch, theme, showToast } = useAppContext();
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [view, setView] = useState<'tree' | 'file'>('tree');

  // Filter files by search query if user types
  const filteredFiles = useMemo(() => {
    if (!searchFilter.trim()) return activeFiles;
    const query = searchFilter.toLowerCase();
    return activeFiles.filter((f: any) => f.name.toLowerCase().includes(query));
  }, [activeFiles, searchFilter]);

  // Memoize tree structure to prevent re-building on re-renders
  const treeData = useMemo(() => {
    return buildFastTree(filteredFiles);
  }, [filteredFiles]);

  const activeFileName = selectedFile || '';

  useEffect(() => {
    const fileName = selectedFile;
    if (!fileName) return;

    if (githubToken && typeof githubToken === 'string' && currentRepoOwner) {
      const fetchFileContent = async () => {
        setIsLoadingFile(true);
        try {
          const headers = {
            Authorization: githubToken.startsWith('ghp_') || githubToken.startsWith('github_pat_') || githubToken.startsWith('gho_')
              ? `Bearer ${githubToken}`
              : `token ${githubToken}`
          };
          const refParam = currentBranch ? `?ref=${currentBranch}` : '';
          const res = await fetch(`https://api.github.com/repos/${currentRepoOwner}/${currentRepo}/contents/${fileName}${refParam}`, { headers });
          if (res.ok) {
            const data = await res.json();
            if (data.encoding === 'base64') {
              setFileContent(safeDecodeBase64(data.content));
            } else {
              setFileContent(data.content || '');
            }
          } else {
            setFileContent(`// Error loading file from GitHub (status ${res.status})`);
          }
        } catch (err: any) {
          console.error(err);
          setFileContent(`// Error loading file: ${err.message || err}`);
        } finally {
          setIsLoadingFile(false);
        }
      };
      fetchFileContent();
    } else {
      setFileContent('// Connect your GitHub account to view remote file contents.');
    }
  }, [selectedFile, githubToken, currentRepo, currentRepoOwner, currentBranch]);

  if (activeFiles.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-8 text-center flex flex-col items-center justify-center my-4">
        <Folder size={32} className="text-text-muted mb-2" />
        <p className="font-semibold text-sm mb-1 text-text-main">No files found</p>
        <p className="text-xs text-text-muted max-w-[260px]">This repository currently has no files loaded.</p>
      </div>
    );
  }

  const isHugeFile = fileContent.length > 150_000 || fileContent.split('\n').length > 1500;

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col h-[70vh]">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0 bg-hover/10">
        <div className="flex items-center gap-1.5 text-xs text-text-muted font-medium truncate pr-2">
          {view === 'file' && (
            <button 
              onClick={() => setView('tree')}
              className="mr-1 p-1 bg-card hover:bg-hover border border-border rounded-lg flex items-center justify-center transition-colors cursor-pointer"
              title="Back to file tree"
            >
              <ChevronRight size={14} className="rotate-180" />
            </button>
          )}
          <Home size={13} className="text-primary shrink-0" /> 
          <span className="shrink-0 text-text-muted">/</span> 
          <span className="text-text-main font-semibold truncate">{currentRepo || 'repo'}</span> 
          {view === 'file' && activeFileName && (
            <>
              <span className="shrink-0 text-text-muted">/</span> 
              <span className="text-primary font-mono font-medium truncate">{activeFileName.split('/').pop()}</span>
            </>
          )}
        </div>

        {view === 'file' && (
          <button
            onClick={() => {
              if (fileContent) {
                navigator.clipboard.writeText(fileContent);
                setIsCopied(true);
                showToast('Code copied to clipboard!');
                setTimeout(() => setIsCopied(false), 2000);
              }
            }}
            className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-card border border-border hover:bg-hover text-text-main transition-colors shrink-0 cursor-pointer"
          >
            {isCopied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
            <span>{isCopied ? 'Copied' : 'Copy'}</span>
          </button>
        )}
      </div>

      {/* Filter search bar in tree view */}
      {view === 'tree' && (
        <div className="px-3 pt-3 pb-2 border-b border-border/60">
          <div className="relative flex items-center">
            <Search size={13} className="absolute left-2.5 text-text-muted" />
            <input
              type="text"
              placeholder="Search files in workspace..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-main border border-border rounded-lg pl-8 pr-7 py-1.5 text-xs text-text-main placeholder:text-text-muted focus:outline-none focus:border-primary font-medium"
            />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter('')}
                className="absolute right-2 text-text-muted hover:text-text-main cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      )}
      
      {view === 'tree' ? (
        <div className="flex-1 overflow-y-auto bg-card p-3">
          <div className="flex items-center justify-between text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 px-2">
            <span>Workspace Files</span>
            <span className="font-mono">{filteredFiles.length} items</span>
          </div>
          <div className="space-y-0.5">
            {treeData.map(item => (
              <FileTreeItem 
                key={item.path} 
                item={item} 
                depth={0} 
                activeFileName={activeFileName} 
                onSelect={(path: string) => {
                  setSelectedFile(path);
                  setView('file');
                }} 
              />
            ))}
            {treeData.length === 0 && (
              <div className="text-center py-6 text-xs text-text-muted font-medium">
                No matching files found.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto bg-main select-text relative">
          {isLoadingFile ? (
            <div className="flex items-center justify-center h-full gap-2 text-text-muted text-xs">
              <span className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></span>
              <span>Fetching file content...</span>
            </div>
          ) : isHugeFile ? (
            <div className="p-4 font-mono text-xs leading-relaxed text-text-main whitespace-pre overflow-x-auto">
              <div className="mb-3 text-[11px] text-warning bg-warning/10 border border-warning/20 p-2 rounded-lg font-sans">
                Large file preview rendered in fast-mode to optimize performance.
              </div>
              {fileContent}
            </div>
          ) : (
            <SyntaxHighlighter
              language={getCodeLanguage(activeFileName)}
              style={theme === 'dark' ? vscDarkPlus : vs}
              showLineNumbers={true}
              wrapLines={false}
              customStyle={{
                margin: 0,
                padding: '1rem',
                background: 'transparent',
                fontSize: '12px',
                fontFamily: 'var(--font-mono, monospace)',
                lineHeight: '1.6',
              }}
              lineNumberStyle={{
                minWidth: '2.5rem',
                paddingRight: '1rem',
                color: 'var(--text-muted)',
                opacity: 0.5,
                userSelect: 'none',
              }}
            >
              {fileContent || '// Empty file'}
            </SyntaxHighlighter>
          )}
        </div>
      )}
    </div>
  );
};
