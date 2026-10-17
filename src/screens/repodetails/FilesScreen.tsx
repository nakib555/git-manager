import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../AppContext';
import { Home, Folder, FileText, FileCode, ChevronRight, ChevronDown, Copy, Check } from 'lucide-react';
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

const buildTree = (files: any[]) => {
  const root: any[] = [];
  
  files.forEach(file => {
    const parts = file.name.split('/');
    let currentLevel = root;
    
    parts.forEach((part: string, index: number) => {
      const isLast = index === parts.length - 1;
      const path = parts.slice(0, index + 1).join('/');
      
      let existing = currentLevel.find(item => item.name === part);
      if (!existing) {
        existing = {
          name: part,
          path: path,
          type: isLast ? file.type : 'dir',
          children: isLast && file.type === 'file' ? undefined : []
        };
        currentLevel.push(existing);
      }
      if (existing.children) {
        currentLevel = existing.children;
      }
    });
  });
  
  const sortTree = (nodes: any[]) => {
    nodes.sort((a, b) => {
      if (a.type === 'dir' && b.type !== 'dir') return -1;
      if (a.type !== 'dir' && b.type === 'dir') return 1;
      return a.name.localeCompare(b.name);
    });
    nodes.forEach(node => {
      if (node.children) sortTree(node.children);
    });
  };
  
  sortTree(root);
  return root;
};

const FileTreeItem = ({ item, depth, activeFileName, onSelect }: any) => {
  const [isOpen, setIsOpen] = useState(depth === 0);
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
        className={`flex items-center gap-1.5 py-2 px-2 rounded-lg cursor-pointer transition-all text-xs font-semibold ${isSelected ? 'bg-primary/10 text-primary' : 'text-text-muted hover:text-text-main hover:bg-hover/20'}`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        <div className="flex items-center justify-center w-4 h-4 shrink-0 text-text-muted/70">
          {isDir && (
            isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          )}
        </div>
        <Icon size={14} className={isDir ? 'text-info' : 'text-primary'} />
        <span className="truncate">{item.name}</span>
      </div>
      {isDir && isOpen && item.children && (
        <div>
          {item.children.map((child: any) => (
            <FileTreeItem key={child.path} item={child} depth={depth + 1} activeFileName={activeFileName} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
};

export const FilesScreen = () => {
  const { activeFiles, currentRepo, githubToken, currentRepoOwner, currentBranch, theme, showToast } = useAppContext();
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const filesToDisplay = activeFiles;
  const [view, setView] = useState<'tree' | 'file'>('tree');
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
              const decoded = decodeURIComponent(atob(data.content.replace(/\s/g, '')).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
              }).join(''));
              setFileContent(decoded);
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
      setFileContent('// Please connect your GitHub account to fetch file content.');
    }
  }, [selectedFile, githubToken, currentRepo, currentRepoOwner, currentBranch]);

  if (filesToDisplay.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-8 text-center flex flex-col items-center justify-center my-4">
        <Folder size={32} className="text-text-muted mb-2" />
        <p className="font-semibold text-sm mb-1 text-text-main">No files found</p>
        <p className="text-xs text-text-muted max-w-[260px]">This repository currently has no files loaded.</p>
      </div>
    );
  }

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
      
      {view === 'tree' ? (
        <div className="flex-1 overflow-y-auto bg-card p-3">
          <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 px-2">Workspace Directory</div>
          <div className="space-y-0.5">
            {buildTree(filesToDisplay).map(item => (
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
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto bg-main select-text relative">
          {isLoadingFile ? (
            <div className="flex items-center justify-center h-full gap-2 text-text-muted text-xs">
              <span className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></span>
              <span>Fetching file...</span>
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
