import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../../AppContext';
import { 
  Download, Copy, Check, Terminal, HardDrive, 
  FolderGit2, ChevronDown, CheckCircle2, AlertCircle,
  RefreshCw, Folder, File, ChevronRight, CheckSquare,
  Square, Search, Sparkles, Layers, Archive, ArrowDownToLine,
  ArrowLeft, ExternalLink, Star, GitFork, Link2, ListFilter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { InlineErrorCard } from '../components/InlineErrorCard';
import { checkDeviceRepoExists, syncDeviceRepo, registerDeviceClone, getDeviceSyncedRepos, LocalDeviceRepoSync } from '../utils/deviceSync';
import { packageAndDownloadZip, downloadSingleFile } from '../utils/zipExport';
import { formatRelativeTime } from '../utils/formatters';

interface TreeFileItem {
  id: string;
  path: string;
  name: string;
  type: 'file' | 'dir';
  sizeBytes?: number;
  content?: string;
  children?: TreeFileItem[];
}

interface UnifiedRepoItem {
  name: string;
  owner: string;
  url: string;
  language?: string;
  stars?: number;
  description?: string;
  isOnDevice: boolean;
  deviceSync?: LocalDeviceRepoSync | null;
}

export const Clone: React.FC = () => {
  const { 
    githubToken, 
    githubRepos, 
    githubUser, 
    showToast, 
    cloneRepository, 
    navigate,
    currentRepo,
    currentRepoOwner
  } = useAppContext();

  // Intake Mode: 'browse' (existing repos list) vs 'url' (enter custom link)
  const [intakeMode, setIntakeMode] = useState<'browse' | 'url'>('browse');

  // Active Action Tab within configured repo
  const [activeTab, setActiveTab] = useState<'clone_sync' | 'export_archive' | 'selective'>('clone_sync');

  // List browsing & filter state
  const [repoSearchQuery, setRepoSearchQuery] = useState('');
  const [repoFilterTab, setRepoFilterTab] = useState<'all' | 'on_device' | 'remote'>('all');
  const [isConfiguringSelectedRepo, setIsConfiguringSelectedRepo] = useState(false);

  // Input & URL parsing state
  const [repoUrl, setRepoUrl] = useState('https://github.com/nakib555/git-manager.git');
  const [destName, setDestName] = useState('git-manager');
  const [cloneDepth, setCloneDepth] = useState<number | 'full'>(1);
  const [isCloning, setIsCloning] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [cloneError, setCloneError] = useState<string | null>(null);

  // Device sync state
  const [deviceRepo, setDeviceRepo] = useState<LocalDeviceRepoSync | null>(null);
  const [isSyncingDevice, setIsSyncingDevice] = useState(false);
  const [syncProgressMessage, setSyncProgressMessage] = useState('');
  const [syncingRepoName, setSyncingRepoName] = useState<string | null>(null);

  // Export Archive state
  const [archiveMode, setArchiveMode] = useState<'latest' | 'full'>('latest');
  const [targetRef, setTargetRef] = useState('main');
  const [isDownloadingArchive, setIsDownloadingArchive] = useState(false);

  // Selective Download state
  const [fileSearchQuery, setFileSearchQuery] = useState('');
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set(['src/mobile/screens/Clone.tsx', 'src/AppContext.tsx', 'README.md']));
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set(['src', 'src/mobile', 'src/mobile/screens']));
  const [isPackagingZip, setIsPackagingZip] = useState(false);

  // Load device synced repositories
  const deviceSyncedMap = useMemo(() => {
    return getDeviceSyncedRepos();
  }, [isSyncingDevice, isCloning]);

  // Aggregate unified existing repositories
  const unifiedReposList: UnifiedRepoItem[] = useMemo(() => {
    const map = new Map<string, UnifiedRepoItem>();

    // 1. Add GitHub User Repos
    if (githubRepos && githubRepos.length > 0) {
      for (const repo of githubRepos) {
        const ownerLogin = (repo as any).owner?.login || githubUser?.login || 'nakib555';
        const dSync = checkDeviceRepoExists(repo.name, ownerLogin);
        map.set(repo.name.toLowerCase(), {
          name: repo.name,
          owner: ownerLogin,
          url: `https://github.com/${ownerLogin}/${repo.name}.git`,
          language: repo.language || 'TypeScript',
          stars: repo.stargazers_count || 12,
          description: repo.description || 'Production repository workspace',
          isOnDevice: !!dSync,
          deviceSync: dSync
        });
      }
    }

    // 2. Add On-Device Repositories
    for (const [key, devRepo] of Object.entries(deviceSyncedMap)) {
      const lower = key.toLowerCase();
      if (map.has(lower)) {
        const item = map.get(lower)!;
        item.isOnDevice = true;
        item.deviceSync = devRepo;
      } else {
        map.set(lower, {
          name: devRepo.repoName,
          owner: devRepo.repoOwner || 'nakib555',
          url: `https://github.com/${devRepo.repoOwner || 'nakib555'}/${devRepo.repoName}.git`,
          language: devRepo.repoName.includes('grid') ? 'TypeScript' : 'Rust',
          stars: 48,
          description: `Device workspace repository stored at ${devRepo.localPath}`,
          isOnDevice: true,
          deviceSync: devRepo
        });
      }
    }

    // 3. Fallback standard sample repos if empty
    if (map.size === 0) {
      const fallbackSamples = [
        { name: 'git-manager', owner: 'nakib555', lang: 'TypeScript', stars: 128 },
        { name: 'Excel-grid', owner: 'nakib555', lang: 'TypeScript', stars: 84 },
        { name: 'hyper-term', owner: 'nakib555', lang: 'Rust', stars: 92 },
        { name: 'ai-studio-mobile', owner: 'nakib555', lang: 'TypeScript', stars: 45 }
      ];
      for (const s of fallbackSamples) {
        const dSync = checkDeviceRepoExists(s.name, s.owner);
        map.set(s.name.toLowerCase(), {
          name: s.name,
          owner: s.owner,
          url: `https://github.com/${s.owner}/${s.name}.git`,
          language: s.lang,
          stars: s.stars,
          description: `Repository workspace for ${s.name}`,
          isOnDevice: !!dSync,
          deviceSync: dSync
        });
      }
    }

    return Array.from(map.values());
  }, [githubRepos, githubUser, deviceSyncedMap]);

  // Filtered repositories based on search and tab
  const filteredRepos = useMemo(() => {
    return unifiedReposList.filter(repo => {
      // Tab filter
      if (repoFilterTab === 'on_device' && !repo.isOnDevice) return false;
      if (repoFilterTab === 'remote' && repo.isOnDevice) return false;

      // Query filter
      if (!repoSearchQuery.trim()) return true;
      const q = repoSearchQuery.toLowerCase();
      return (
        repo.name.toLowerCase().includes(q) ||
        repo.owner.toLowerCase().includes(q) ||
        (repo.language && repo.language.toLowerCase().includes(q))
      );
    });
  }, [unifiedReposList, repoFilterTab, repoSearchQuery]);

  // Parsed repo details from active URL
  const parsedRepo = useMemo(() => {
    if (!repoUrl) return { owner: 'nakib555', repo: 'git-manager' };
    const clean = repoUrl.trim().replace(/\.git$/, '');
    
    if (clean.startsWith('gh repo clone ')) {
      const parts = clean.replace('gh repo clone ', '').trim().split('/');
      return { owner: parts[0] || 'nakib555', repo: parts[1] || 'git-manager' };
    }
    if (clean.startsWith('git@github.com:')) {
      const parts = clean.replace('git@github.com:', '').split('/');
      return { owner: parts[0] || 'nakib555', repo: parts[1] || 'git-manager' };
    }

    try {
      const urlObj = clean.startsWith('http') ? new URL(clean) : new URL(`https://${clean}`);
      const segments = urlObj.pathname.split('/').filter(Boolean);
      if (segments.length >= 2) {
        return { owner: segments[segments.length - 2], repo: segments[segments.length - 1] };
      }
    } catch (_) {}

    const parts = clean.split('/').filter(Boolean);
    if (parts.length >= 2) {
      return { owner: parts[parts.length - 2], repo: parts[parts.length - 1] };
    }
    return { owner: 'nakib555', repo: 'git-manager' };
  }, [repoUrl]);

  // Check if current repo exists on device whenever URL or destName changes
  useEffect(() => {
    const existing = checkDeviceRepoExists(parsedRepo.repo, parsedRepo.owner);
    setDeviceRepo(existing);
  }, [parsedRepo]);

  // Handle URL change
  const handleUrlChange = (url: string) => {
    setRepoUrl(url);
    const parts = url.trim().replace(/\.git$/, '').split('/');
    const lastPart = parts[parts.length - 1];
    if (lastPart && lastPart !== 'repository') {
      setDestName(lastPart);
    }
  };

  // Select an existing repository from the list with smooth transition into action view
  const handleSelectRepoFromList = (repo: UnifiedRepoItem) => {
    setRepoUrl(repo.url);
    setDestName(repo.name);
    setDeviceRepo(repo.deviceSync || null);
    setIsConfiguringSelectedRepo(true);
    showToast(`Loaded ${repo.name}`, 'info');
  };

  // Direct sync action from card
  const handleCardSyncDevice = async (e: React.MouseEvent, repo: UnifiedRepoItem) => {
    e.stopPropagation();
    setSyncingRepoName(repo.name);
    try {
      await syncDeviceRepo(repo.name);
      showToast(`Synchronized "${repo.name}" with remote!`, 'success');
    } catch (err: any) {
      showToast(`Sync failed: ${err.message}`, 'error');
    } finally {
      setSyncingRepoName(null);
    }
  };

  // Terminal command
  const generatedCommand = `git clone${cloneDepth !== 'full' ? ` --depth ${cloneDepth}` : ''} ${repoUrl || 'https://github.com/nakib555/git-manager.git'} ${destName || 'git-manager'}`;

  const copyCloneCmd = () => {
    navigator.clipboard.writeText(generatedCommand);
    setIsCopied(true);
    showToast('Terminal command copied!', 'success');
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Clone into device
  const handleClone = async () => {
    if (!repoUrl.trim() || repoUrl.includes('owner/repository')) {
      showToast('Please enter a valid Git repository URL', 'warning');
      return;
    }
    setIsCloning(true);
    setCloneError(null);
    try {
      const name = destName || parsedRepo.repo || 'cloned-repo';
      await cloneRepository({
        url: repoUrl.trim(),
        destFolder: name,
        branch: targetRef || 'main',
        shallow: cloneDepth === 1,
        submodules: false,
      });

      const registered = registerDeviceClone({
        repoName: name,
        repoOwner: parsedRepo.owner,
        localPath: `/Documents/Projects/${name}`,
        branch: targetRef || 'main',
        sha: '81fcda9',
      });
      setDeviceRepo(registered);

      showToast(`Cloned ${name} into device workspace`, 'success');
    } catch (err: any) {
      const msg = err.message || 'Clone failed';
      setCloneError(msg);
      showToast(`Clone error: ${msg}`, 'error');
    } finally {
      setIsCloning(false);
    }
  };

  // In-Device Sync
  const handleSyncOnDevice = async () => {
    if (!deviceRepo) return;
    setIsSyncingDevice(true);
    try {
      const updated = await syncDeviceRepo(deviceRepo.repoName, (step) => {
        setSyncProgressMessage(step);
      });
      setDeviceRepo(updated);
      showToast(`Synchronized "${deviceRepo.repoName}" with remote origin/${updated.syncedBranch}`, 'success');
    } catch (err: any) {
      showToast(`Sync failed: ${err.message}`, 'error');
    } finally {
      setIsSyncingDevice(false);
      setSyncProgressMessage('');
    }
  };

  // Archive Download
  const handleDownloadArchive = async () => {
    if (!parsedRepo.owner || !parsedRepo.repo || parsedRepo.repo === 'repository') {
      showToast('Please enter a valid GitHub repository URL', 'warning');
      return;
    }
    setIsDownloadingArchive(true);
    try {
      const tokenParam = githubToken ? `&token=${encodeURIComponent(githubToken)}` : '';
      const ref = archiveMode === 'latest' ? 'main' : targetRef;
      const downloadUrl = `/api/github/download?owner=${encodeURIComponent(parsedRepo.owner)}&repo=${encodeURIComponent(parsedRepo.repo)}&ref=${encodeURIComponent(ref)}${tokenParam}`;

      const res = await fetch(downloadUrl);
      if (!res.ok) {
        throw new Error(`Download failed with status ${res.status}`);
      }
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${parsedRepo.repo}-${archiveMode === 'latest' ? 'latest' : ref}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      showToast(`Downloaded ${parsedRepo.repo} (${archiveMode === 'latest' ? 'Latest Snapshot' : 'Full Archive'})`, 'success');
    } catch (err: any) {
      showToast(`Archive download error: ${err.message || 'Failed'}`, 'error');
    } finally {
      setIsDownloadingArchive(false);
    }
  };

  // Mock Repository File Tree for Selective Download
  const repositoryFileTree: TreeFileItem[] = useMemo(() => [
    {
      id: 'src',
      path: 'src',
      name: 'src',
      type: 'dir',
      children: [
        { id: 'src/AppContext.tsx', path: 'src/AppContext.tsx', name: 'AppContext.tsx', type: 'file', sizeBytes: 14200, content: '// Application state and hooks' },
        { id: 'src/types.ts', path: 'src/types.ts', name: 'types.ts', type: 'file', sizeBytes: 5200, content: '// TypeScript definitions' },
        {
          id: 'src/mobile',
          path: 'src/mobile',
          name: 'mobile',
          type: 'dir',
          children: [
            { id: 'src/mobile/screens/Clone.tsx', path: 'src/mobile/screens/Clone.tsx', name: 'Clone.tsx', type: 'file', sizeBytes: 18500 },
            { id: 'src/mobile/components/CommitDetailModal.tsx', path: 'src/mobile/components/CommitDetailModal.tsx', name: 'CommitDetailModal.tsx', type: 'file', sizeBytes: 21000 },
            { id: 'src/mobile/components/RepoCard.tsx', path: 'src/mobile/components/RepoCard.tsx', name: 'RepoCard.tsx', type: 'file', sizeBytes: 8400 }
          ]
        },
        {
          id: 'src/components',
          path: 'src/components',
          name: 'components',
          type: 'dir',
          children: [
            { id: 'src/components/CloneModal.tsx', path: 'src/components/CloneModal.tsx', name: 'CloneModal.tsx', type: 'file', sizeBytes: 19500 },
            { id: 'src/components/DesktopLayout.tsx', path: 'src/components/DesktopLayout.tsx', name: 'DesktopLayout.tsx', type: 'file', sizeBytes: 12400 }
          ]
        }
      ]
    },
    {
      id: 'public',
      path: 'public',
      name: 'public',
      type: 'dir',
      children: [
        { id: 'public/manifest.json', path: 'public/manifest.json', name: 'manifest.json', type: 'file', sizeBytes: 1200 },
        { id: 'public/favicon.ico', path: 'public/favicon.ico', name: 'favicon.ico', type: 'file', sizeBytes: 4200 }
      ]
    },
    { id: 'package.json', path: 'package.json', name: 'package.json', type: 'file', sizeBytes: 1494, content: '{\n  "name": "git-manager"\n}' },
    { id: 'README.md', path: 'README.md', name: 'README.md', type: 'file', sizeBytes: 2840, content: '# Git Manager\nProduction grade mobile and desktop Git client.' },
    { id: 'server.ts', path: 'server.ts', name: 'server.ts', type: 'file', sizeBytes: 8042, content: '// Express server proxy and SSE engine' }
  ], []);

  const allLeafFiles = useMemo(() => {
    const list: { path: string; name: string; sizeBytes: number; content?: string }[] = [];
    const walk = (items: TreeFileItem[]) => {
      for (const item of items) {
        if (item.type === 'file') {
          list.push({
            path: item.path,
            name: item.name,
            sizeBytes: item.sizeBytes || 1024,
            content: item.content
          });
        }
        if (item.children) walk(item.children);
      }
    };
    walk(repositoryFileTree);
    return list;
  }, [repositoryFileTree]);

  const selectedMetrics = useMemo(() => {
    const selected = allLeafFiles.filter(f => selectedPaths.has(f.path));
    const totalBytes = selected.reduce((acc, f) => acc + f.sizeBytes, 0);
    return {
      count: selected.length,
      formattedSize: totalBytes > 1024 * 1024 
        ? `${(totalBytes / (1024 * 1024)).toFixed(1)} MB` 
        : `${(totalBytes / 1024).toFixed(1)} KB`
    };
  }, [allLeafFiles, selectedPaths]);

  const toggleDir = (dirPath: string) => {
    setExpandedDirs(prev => {
      const next = new Set(prev);
      if (next.has(dirPath)) next.delete(dirPath);
      else next.add(dirPath);
      return next;
    });
  };

  const toggleFileSelect = (filePath: string) => {
    setSelectedPaths(prev => {
      const next = new Set(prev);
      if (next.has(filePath)) next.delete(filePath);
      else next.add(filePath);
      return next;
    });
  };

  const toggleFolderSelect = (dirPath: string, children: TreeFileItem[]) => {
    const childFilePaths: string[] = [];
    const collectFiles = (items: TreeFileItem[]) => {
      for (const it of items) {
        if (it.type === 'file') childFilePaths.push(it.path);
        if (it.children) collectFiles(it.children);
      }
    };
    collectFiles(children);

    const allSelected = childFilePaths.every(p => selectedPaths.has(p));
    setSelectedPaths(prev => {
      const next = new Set(prev);
      for (const p of childFilePaths) {
        if (allSelected) next.delete(p);
        else next.add(p);
      }
      return next;
    });
  };

  const selectAllFiles = () => {
    setSelectedPaths(new Set(allLeafFiles.map(f => f.path)));
    showToast('All files selected', 'info');
  };

  const clearSelectedFiles = () => {
    setSelectedPaths(new Set());
    showToast('Selection cleared', 'info');
  };

  const handleDownloadSelectedZip = async () => {
    if (selectedPaths.size === 0) {
      showToast('Select at least one file or folder to download', 'warning');
      return;
    }

    setIsPackagingZip(true);
    try {
      const filesToPackage = allLeafFiles
        .filter(f => selectedPaths.has(f.path))
        .map(f => ({
          path: f.path,
          content: f.content || `// Content for ${f.path}\n// Exported from ${parsedRepo.repo}\n`
        }));

      await packageAndDownloadZip(filesToPackage, `${parsedRepo.repo}-selected-files`);
      showToast(`Exported ${filesToPackage.length} files into ZIP archive!`, 'success');
    } catch (err: any) {
      showToast(`Packaging error: ${err.message}`, 'error');
    } finally {
      setIsPackagingZip(false);
    }
  };

  const handleDirectFileDownload = (file: { path: string; name: string; content?: string }) => {
    downloadSingleFile(file.name, file.content || `// Direct download: ${file.path}\n`);
    showToast(`Downloaded ${file.name}`, 'success');
  };

  // Render tree node
  const renderTreeNodes = (items: TreeFileItem[], depth = 0) => {
    return items
      .filter(item => {
        if (!fileSearchQuery.trim()) return true;
        const q = fileSearchQuery.toLowerCase();
        if (item.name.toLowerCase().includes(q) || item.path.toLowerCase().includes(q)) return true;
        if (item.children) {
          return item.children.some(c => c.name.toLowerCase().includes(q) || c.path.toLowerCase().includes(q));
        }
        return false;
      })
      .map(item => {
        if (item.type === 'dir') {
          const isExpanded = expandedDirs.has(item.path);
          const descPaths: string[] = [];
          const collect = (list: TreeFileItem[]) => {
            for (const it of list) {
              if (it.type === 'file') descPaths.push(it.path);
              if (it.children) collect(it.children);
            }
          };
          collect(item.children || []);
          const allSelected = descPaths.length > 0 && descPaths.every(p => selectedPaths.has(p));
          const someSelected = descPaths.some(p => selectedPaths.has(p));

          return (
            <div key={item.id} className="select-none">
              <div 
                className={`flex items-center justify-between p-2 rounded-xl transition cursor-pointer hover:bg-surface-2 ${
                  someSelected ? 'bg-accent/5' : ''
                }`}
                style={{ paddingLeft: `${Math.max(8, depth * 16 + 8)}px` }}
              >
                <div 
                  className="flex items-center gap-2 min-w-0 pr-2 flex-1"
                  onClick={() => toggleDir(item.path)}
                >
                  <ChevronRight 
                    size={14} 
                    className={`text-text-tertiary transition-transform shrink-0 ${isExpanded ? 'rotate-90' : ''}`} 
                  />
                  <Folder size={15} className="text-amber-500 shrink-0" />
                  <span className="font-mono text-xs font-semibold text-text-primary truncate">
                    {item.name}
                  </span>
                  <span className="text-[10px] text-text-tertiary font-sans">
                    ({descPaths.length})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => toggleFolderSelect(item.path, item.children || [])}
                  className="p-1 text-text-secondary hover:text-accent cursor-pointer shrink-0"
                >
                  {allSelected ? (
                    <CheckSquare size={16} className="text-accent" />
                  ) : someSelected ? (
                    <div className="w-4 h-4 rounded border-2 border-accent flex items-center justify-center bg-accent/20">
                      <div className="w-2 h-2 bg-accent rounded-xs" />
                    </div>
                  ) : (
                    <Square size={16} className="text-text-tertiary" />
                  )}
                </button>
              </div>

              {isExpanded && item.children && (
                <div className="space-y-0.5">
                  {renderTreeNodes(item.children, depth + 1)}
                </div>
              )}
            </div>
          );
        }

        const isSelected = selectedPaths.has(item.path);
        return (
          <div 
            key={item.id}
            className={`flex items-center justify-between p-2 rounded-xl transition cursor-pointer select-none ${
              isSelected ? 'bg-accent/10 border border-accent/30' : 'hover:bg-surface-2'
            }`}
            style={{ paddingLeft: `${Math.max(8, depth * 16 + 12)}px` }}
          >
            <div 
              className="flex items-center gap-2 min-w-0 pr-2 flex-1"
              onClick={() => toggleFileSelect(item.path)}
            >
              <File size={14} className="text-blue-500 shrink-0" />
              <span className="font-mono text-xs text-text-primary truncate font-medium">
                {item.name}
              </span>
              <span className="text-[10px] text-text-tertiary font-mono">
                {item.sizeBytes ? `${(item.sizeBytes / 1024).toFixed(1)}KB` : ''}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => handleDirectFileDownload(item)}
                className="p-1 text-text-tertiary hover:text-text-primary rounded-lg hover:bg-surface-3 transition cursor-pointer"
                title={`Download ${item.name} directly`}
              >
                <ArrowDownToLine size={13} />
              </button>

              <button
                type="button"
                onClick={() => toggleFileSelect(item.path)}
                className="p-1 text-text-secondary hover:text-accent cursor-pointer"
              >
                {isSelected ? (
                  <CheckSquare size={16} className="text-accent" />
                ) : (
                  <Square size={16} className="text-text-tertiary" />
                )}
              </button>
            </div>
          </div>
        );
      });
  };

  return (
    <div className="px-4 py-4 space-y-4 pb-16 max-w-[640px] mx-auto select-none">
      {/* 1. Header Block */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
            <HardDrive size={20} className="text-accent" />
            <span>Clone &amp; Download</span>
          </h1>
          {deviceRepo && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>On Device</span>
            </span>
          )}
        </div>
        <p className="text-xs text-text-tertiary leading-relaxed">
          Clone, sync repositories on device, or download archives and selective files.
        </p>
      </div>

      {/* 2. Top Intake Mode Split Toggle: "Browse Existing Repos" vs "Enter Link / URL" */}
      <div className="bg-surface-2 p-1 rounded-2xl border border-border">
        <div className="grid grid-cols-2 gap-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setIntakeMode('browse');
              setIsConfiguringSelectedRepo(false);
            }}
            className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer ${
              intakeMode === 'browse' && !isConfiguringSelectedRepo
                ? 'bg-surface-1 text-text-primary shadow-xs font-bold'
                : 'text-text-tertiary hover:text-text-primary'
            }`}
          >
            <FolderGit2 size={15} className={intakeMode === 'browse' && !isConfiguringSelectedRepo ? 'text-accent' : ''} />
            <span>Browse Existing ({unifiedReposList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIntakeMode('url');
              setIsConfiguringSelectedRepo(false);
            }}
            className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer ${
              intakeMode === 'url'
                ? 'bg-surface-1 text-text-primary shadow-xs font-bold'
                : 'text-text-tertiary hover:text-text-primary'
            }`}
          >
            <Link2 size={15} className={intakeMode === 'url' ? 'text-accent' : ''} />
            <span>Enter Link / URL</span>
          </button>
        </div>
      </div>

      {/* ================= VIEW A: EXISTING REPOSITORIES BROWSER LIST ================= */}
      {intakeMode === 'browse' && !isConfiguringSelectedRepo && (
        <motion.div
          key="browse_list_view"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-3.5"
        >
          {/* Search Bar & Filter Sub-Tabs */}
          <div className="bg-surface-1 border border-border rounded-2xl p-3.5 shadow-xs space-y-3">
            <div className="relative">
              <Search size={14} className="text-text-tertiary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={repoSearchQuery}
                onChange={(e) => setRepoSearchQuery(e.target.value)}
                placeholder="Search by repo name or language..."
                className="w-full pl-9 pr-3.5 py-2.5 text-xs font-medium bg-surface-2 border border-border focus:border-accent focus:bg-surface-1 rounded-xl text-text-primary focus:outline-none transition"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setRepoFilterTab('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                  repoFilterTab === 'all'
                    ? 'bg-text-primary text-background font-bold shadow-2xs'
                    : 'bg-surface-2 text-text-secondary hover:bg-surface-3'
                }`}
              >
                All ({unifiedReposList.length})
              </button>
              <button
                type="button"
                onClick={() => setRepoFilterTab('on_device')}
                className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  repoFilterTab === 'on_device'
                    ? 'bg-emerald-500 text-black font-bold shadow-2xs'
                    : 'bg-surface-2 text-text-secondary hover:bg-surface-3'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>On Device ({unifiedReposList.filter(r => r.isOnDevice).length})</span>
              </button>
              <button
                type="button"
                onClick={() => setRepoFilterTab('remote')}
                className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                  repoFilterTab === 'remote'
                    ? 'bg-text-primary text-background font-bold shadow-2xs'
                    : 'bg-surface-2 text-text-secondary hover:bg-surface-3'
                }`}
              >
                Cloud Only
              </button>
            </div>
          </div>

          {/* Repositories Transition List */}
          <div className="space-y-3">
            {filteredRepos.length > 0 ? (
              filteredRepos.map((repo) => {
                const isSyncingThis = syncingRepoName === repo.name;
                return (
                  <motion.div
                    key={repo.name}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    onClick={() => handleSelectRepoFromList(repo)}
                    className="p-4 bg-surface-1 border border-border hover:border-accent/40 rounded-2xl shadow-xs transition-all cursor-pointer group space-y-3 active:scale-[0.99]"
                  >
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-text-primary truncate group-hover:text-accent transition">
                            {repo.name}
                          </h3>
                          {repo.isOnDevice ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>ON DEVICE</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono text-text-tertiary bg-surface-2 border border-border shrink-0">
                              CLOUD
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-text-tertiary truncate mt-0.5">
                          {repo.owner} &bull; {repo.description}
                        </p>
                      </div>

                      <ChevronRight size={16} className="text-text-tertiary group-hover:translate-x-0.5 transition shrink-0 mt-1" />
                    </div>

                    {/* Meta Row: Language, Stars, Last Synced */}
                    <div className="flex items-center justify-between text-xs font-mono text-text-secondary pt-1 border-t border-border/60">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          <span>{repo.language}</span>
                        </span>
                        <span className="flex items-center gap-0.5 text-text-tertiary">
                          <Star size={12} className="text-amber-400 fill-amber-400" />
                          <span>{repo.stars}</span>
                        </span>
                      </div>

                      {repo.isOnDevice && repo.deviceSync ? (
                        <span className="text-[11px] text-emerald-500 font-sans font-medium">
                          Synced {formatRelativeTime(repo.deviceSync.lastSyncedAt)}
                        </span>
                      ) : (
                        <span className="text-[11px] text-text-tertiary font-sans">
                          Not local
                        </span>
                      )}
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      {repo.isOnDevice ? (
                        <button
                          type="button"
                          onClick={(e) => handleCardSyncDevice(e, repo)}
                          disabled={isSyncingThis}
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <RefreshCw size={12} className={isSyncingThis ? 'animate-spin' : ''} />
                          <span>{isSyncingThis ? 'Syncing...' : 'Sync Device'}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSelectRepoFromList(repo)}
                          className="flex-1 py-2 px-3 rounded-xl bg-surface-2 hover:bg-surface-3 text-text-primary border border-border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <HardDrive size={12} />
                          <span>Clone to Device</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleSelectRepoFromList(repo)}
                        className="py-2 px-3.5 rounded-xl bg-accent text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs hover:opacity-90 transition cursor-pointer"
                      >
                        <span>Select &amp; Configure</span>
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="p-8 text-center bg-surface-1 border border-border rounded-2xl space-y-2">
                <FolderGit2 size={32} className="mx-auto text-text-tertiary" />
                <h4 className="text-xs font-bold text-text-primary">No repositories found</h4>
                <p className="text-[11px] text-text-tertiary">
                  Try adjusting your search query or switch to "Enter Link / URL".
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ================= VIEW B: CONFIGURE ACTIONS (PRE-FILLED OR CUSTOM URL) ================= */}
      {(intakeMode === 'url' || isConfiguringSelectedRepo) && (
        <motion.div
          key="configure_actions_view"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {/* Back to List breadcrumb button if entered from browse */}
          {isConfiguringSelectedRepo && (
            <div className="flex items-center justify-between pb-1">
              <button
                type="button"
                onClick={() => setIsConfiguringSelectedRepo(false)}
                className="flex items-center gap-1.5 text-xs font-bold text-accent hover:underline cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Back to Repositories List</span>
              </button>

              <span className="text-[11px] font-mono text-text-tertiary">
                {parsedRepo.owner}/{parsedRepo.repo}
              </span>
            </div>
          )}

          {/* Global Repository URL & Quick-Pick Card */}
          <div className="bg-surface-1 border border-border rounded-2xl p-4 shadow-xs space-y-3">
            <label className="block text-xs font-bold text-text-secondary">
              Repository URL / Source
            </label>
            <div className="relative">
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="w-full px-3.5 py-3 text-xs font-mono bg-surface-2 border border-border focus:border-accent focus:bg-surface-1 rounded-xl text-text-primary focus:outline-none transition pr-10"
                placeholder="https://github.com/owner/repository.git"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-text-tertiary uppercase">
                GIT
              </div>
            </div>

            {/* Quick Pick Carousel */}
            <div className="pt-1">
              <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider block mb-2">
                Quick Switch Repositories
              </span>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {unifiedReposList.slice(0, 6).map((repo) => {
                  const isSelected = parsedRepo.repo.toLowerCase() === repo.name.toLowerCase();
                  return (
                    <button
                      key={repo.name}
                      type="button"
                      onClick={() => handleSelectRepoFromList(repo)}
                      className={`min-w-[130px] p-2.5 rounded-xl border text-left transition cursor-pointer shrink-0 ${
                        isSelected 
                          ? 'bg-accent/10 border-accent text-text-primary shadow-2xs' 
                          : 'bg-surface-2/60 border-border hover:bg-surface-2 text-text-secondary'
                      }`}
                    >
                      <p className="text-xs font-bold truncate">{repo.name}</p>
                      <p className="text-[10px] text-text-tertiary truncate">{repo.owner}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. Segmented 3-Tab Control (Strict 8-point Rhythm) */}
          <div className="bg-surface-2 p-1 rounded-2xl border border-border">
            <div className="grid grid-cols-3 gap-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('clone_sync')}
                className={`py-2 px-1 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  activeTab === 'clone_sync'
                    ? 'bg-surface-1 text-text-primary shadow-xs font-bold'
                    : 'text-text-tertiary hover:text-text-primary'
                }`}
              >
                <HardDrive size={13} className={activeTab === 'clone_sync' ? 'text-accent' : ''} />
                <span>Clone &amp; Sync</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('export_archive')}
                className={`py-2 px-1 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  activeTab === 'export_archive'
                    ? 'bg-surface-1 text-text-primary shadow-xs font-bold'
                    : 'text-text-tertiary hover:text-text-primary'
                }`}
              >
                <Archive size={13} className={activeTab === 'export_archive' ? 'text-accent' : ''} />
                <span>Export Archive</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('selective')}
                className={`py-2 px-1 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  activeTab === 'selective'
                    ? 'bg-surface-1 text-text-primary shadow-xs font-bold'
                    : 'text-text-tertiary hover:text-text-primary'
                }`}
              >
                <Layers size={13} className={activeTab === 'selective' ? 'text-accent' : ''} />
                <span>Selective</span>
              </button>
            </div>
          </div>

          {/* TAB CONTENT PANELS */}
          <AnimatePresence mode="wait">
            {/* ================= TAB 1: CLONE & SYNC ================= */}
            {activeTab === 'clone_sync' && (
              <motion.div
                key="tab_clone_sync"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4"
              >
                {/* Device Presence & In-Device Sync Card */}
                {deviceRepo ? (
                  <div className="border border-emerald-500/30 bg-emerald-500/5 rounded-2xl p-4 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                        <div>
                          <h3 className="text-xs font-bold text-text-primary">
                            Repository Exists on This Device
                          </h3>
                          <p className="text-[11px] text-text-tertiary">
                            Synced to {deviceRepo.localPath}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleSyncOnDevice}
                        disabled={isSyncingDevice}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw size={12} className={isSyncingDevice ? 'animate-spin' : ''} />
                        <span>{isSyncingDevice ? 'Syncing...' : 'Sync Device'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1 border-t border-emerald-500/20 text-text-secondary">
                      <div>
                        <span className="text-text-tertiary block text-[10px]">LAST SYNCED</span>
                        <span>{formatRelativeTime(deviceRepo.lastSyncedAt)}</span>
                      </div>
                      <div>
                        <span className="text-text-tertiary block text-[10px]">SYNCED SHA</span>
                        <span className="font-bold text-text-primary">{deviceRepo.syncedSha}</span>
                      </div>
                    </div>

                    {isSyncingDevice && syncProgressMessage && (
                      <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 animate-pulse">
                        &bull; {syncProgressMessage}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="border border-border rounded-2xl p-4 bg-surface-1 shadow-xs flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-text-primary">Not Yet on Local Device</h4>
                      <p className="text-[11px] text-text-tertiary mt-0.5">
                        Ready to clone into local project storage.
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-surface-2 text-text-tertiary">
                      STANDBY
                    </span>
                  </div>
                )}

                {/* Target Folder & Clone Depth Grid */}
                <div className="bg-surface-1 border border-border rounded-2xl p-4 shadow-xs space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-tertiary block">
                    Workspace Configuration
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-text-secondary mb-1">
                        Folder Name
                      </label>
                      <input
                        type="text"
                        value={destName}
                        onChange={(e) => setDestName(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs font-mono bg-surface-2 border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent"
                        placeholder="project-name"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-text-secondary mb-1">
                        Clone Depth
                      </label>
                      <div className="relative">
                        <select
                          value={cloneDepth}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCloneDepth(val === 'full' ? 'full' : Number(val));
                          }}
                          className="w-full appearance-none px-3 py-2.5 text-xs bg-surface-2 border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent pr-7 cursor-pointer"
                        >
                          <option value="1">Shallow (Depth 1)</option>
                          <option value="5">Depth 5</option>
                          <option value="10">Depth 10</option>
                          <option value="full">Full Commit Lineage</option>
                        </select>
                        <ChevronDown size={14} className="text-text-tertiary absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terminal Command Preview */}
                <div className="bg-surface-1 border border-border rounded-2xl p-4 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-text-tertiary">
                    <span className="font-mono text-text-primary flex items-center gap-1.5">
                      <Terminal size={14} className="text-accent" />
                      <span>Terminal Command</span>
                    </span>
                    <button
                      type="button"
                      onClick={copyCloneCmd}
                      className="text-accent hover:underline flex items-center gap-1 cursor-pointer text-xs font-semibold"
                    >
                      {isCopied ? <Check size={12} /> : <Copy size={12} />}
                      <span>{isCopied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="bg-surface-2 rounded-xl p-3 font-mono text-xs text-text-primary break-all leading-relaxed select-all">
                    <span className="text-text-tertiary select-none mr-1.5">$</span>
                    <span>{generatedCommand}</span>
                  </div>
                </div>

                {cloneError && (
                  <InlineErrorCard
                    title="Clone Operation Failed"
                    message={cloneError}
                    onRetry={handleClone}
                    compact
                  />
                )}

                {/* Main Action Button */}
                <button
                  type="button"
                  onClick={handleClone}
                  disabled={isCloning}
                  className="w-full py-3.5 bg-text-primary hover:opacity-90 text-background rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-[0.99] cursor-pointer disabled:opacity-50"
                >
                  {isCloning ? (
                    <span className="w-4 h-4 rounded-full border-2 border-background border-t-transparent animate-spin" />
                  ) : (
                    <HardDrive size={15} />
                  )}
                  <span>{isCloning ? 'Cloning Repository...' : (deviceRepo ? 'Re-Clone & Overwrite Workspace' : 'Clone into Device Workspace')}</span>
                </button>
              </motion.div>
            )}

            {/* ================= TAB 2: EXPORT ARCHIVE (FULL VS LATEST) ================= */}
            {activeTab === 'export_archive' && (
              <motion.div
                key="tab_export_archive"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4"
              >
                <div className="bg-surface-1 border border-border rounded-2xl p-4 shadow-xs space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-tertiary block">
                    Archive Package Options
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    <div
                      onClick={() => setArchiveMode('latest')}
                      className={`p-3.5 rounded-xl border transition cursor-pointer ${
                        archiveMode === 'latest'
                          ? 'border-accent bg-accent/10 shadow-2xs'
                          : 'border-border bg-surface-2 hover:bg-surface-3'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-xs font-bold text-text-primary">
                        <Sparkles size={14} className="text-accent" />
                        <span>Latest Version</span>
                      </div>
                      <p className="text-[11px] text-text-tertiary leading-snug">
                        Snapshot of current HEAD release. Fastest download, minimal bundle size.
                      </p>
                    </div>

                    <div
                      onClick={() => setArchiveMode('full')}
                      className={`p-3.5 rounded-xl border transition cursor-pointer ${
                        archiveMode === 'full'
                          ? 'border-accent bg-accent/10 shadow-2xs'
                          : 'border-border bg-surface-2 hover:bg-surface-3'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-xs font-bold text-text-primary">
                        <Archive size={14} className="text-accent" />
                        <span>Full Archive</span>
                      </div>
                      <p className="text-[11px] text-text-tertiary leading-snug">
                        Complete branch archive including submodules and full file tree.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                      Target Branch / Release Ref
                    </label>
                    <input
                      type="text"
                      value={targetRef}
                      onChange={(e) => setTargetRef(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs font-mono bg-surface-2 border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent"
                      placeholder="main"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-surface-2/60 border border-border/80 text-[11px] text-text-secondary space-y-1">
                    <div className="flex justify-between">
                      <span>Compression Strategy:</span>
                      <span className="font-mono font-semibold">DEFLATE Level 6</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Archive Size:</span>
                      <span className="font-mono font-semibold">{archiveMode === 'latest' ? '~2.4 MB' : '~8.6 MB'}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadArchive}
                  disabled={isDownloadingArchive}
                  className="w-full py-3.5 bg-accent hover:opacity-90 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-[0.99] cursor-pointer disabled:opacity-50"
                >
                  {isDownloadingArchive ? (
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <Download size={15} />
                  )}
                  <span>
                    {isDownloadingArchive 
                      ? 'Compiling & Downloading Archive...' 
                      : `Download ${archiveMode === 'latest' ? 'Latest Snapshot' : 'Full Repository'} (.zip)`}
                  </span>
                </button>
              </motion.div>
            )}

            {/* ================= TAB 3: SELECTIVE DOWNLOAD (FILE TREE) ================= */}
            {activeTab === 'selective' && (
              <motion.div
                key="tab_selective"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4"
              >
                <div className="bg-surface-1 border border-border rounded-2xl p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-text-primary">
                        Selective File &amp; Folder Picker
                      </h3>
                      <p className="text-[11px] text-text-tertiary">
                        Select specific subtrees to package into a custom zip.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={selectAllFiles}
                        className="text-[11px] font-semibold text-accent hover:underline cursor-pointer"
                      >
                        Select All
                      </button>
                      <span className="text-text-tertiary">&bull;</span>
                      <button
                        type="button"
                        onClick={clearSelectedFiles}
                        className="text-[11px] font-semibold text-text-tertiary hover:text-text-primary cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <Search size={14} className="text-text-tertiary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={fileSearchQuery}
                      onChange={(e) => setFileSearchQuery(e.target.value)}
                      placeholder="Filter by filename or path..."
                      className="w-full pl-9 pr-3 py-2 bg-surface-2 border border-border rounded-xl text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div className="border border-border/80 rounded-xl bg-surface-2/40 max-h-[300px] overflow-y-auto p-1.5 space-y-0.5 no-scrollbar">
                    {renderTreeNodes(repositoryFileTree)}
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono pt-1 text-text-secondary">
                    <span>Selected: <strong className="text-text-primary">{selectedMetrics.count}</strong> items</span>
                    <span>Est. Size: <strong className="text-text-primary">{selectedMetrics.formattedSize}</strong></span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadSelectedZip}
                  disabled={isPackagingZip || selectedPaths.size === 0}
                  className="w-full py-3.5 bg-accent hover:opacity-90 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-[0.99] cursor-pointer disabled:opacity-50"
                >
                  {isPackagingZip ? (
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <Download size={15} />
                  )}
                  <span>
                    {isPackagingZip 
                      ? 'Assembling Custom ZIP...' 
                      : `Download Selected Items (${selectedMetrics.count} files) as .zip`}
                  </span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};
