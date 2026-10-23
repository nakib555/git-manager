import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../AppContext';
import { 
  X, GitBranch, Folder, HardDrive, Check, Play, Activity, 
  ExternalLink, Github, Monitor, AlertCircle, Copy, Star, GitFork, RefreshCw,
  Archive, Layers, Download, Sparkles, CheckCircle2, ChevronRight, CheckSquare,
  Square, Search, ArrowDownToLine, File, FolderGit2, Link2, ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { checkDeviceRepoExists, syncDeviceRepo, registerDeviceClone, getDeviceSyncedRepos, LocalDeviceRepoSync } from '../mobile/utils/deviceSync';
import { packageAndDownloadZip, downloadSingleFile } from '../mobile/utils/zipExport';
import { formatRelativeTime } from '../mobile/utils/formatters';

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

export const CloneModal = () => {
  const { closeModal, cloneRepository, recentClones, openRepo, currentRepo, currentRepoOwner, githubUser, githubToken, showToast } = useAppContext();
  
  // Intake Mode: 'browse' vs 'url'
  const [intakeMode, setIntakeMode] = useState<'browse' | 'url'>('browse');
  const [isConfiguringSelectedRepo, setIsConfiguringSelectedRepo] = useState(false);

  const [activeTab, setActiveTab] = useState<'clone_sync' | 'export_archive' | 'selective'>('clone_sync');
  const [url, setUrl] = useState('https://github.com/nakib555/git-manager.git');
  const [urlMode, setUrlMode] = useState<'https' | 'ssh' | 'cli'>('https');
  const [isCopied, setIsCopied] = useState(false);

  const [dest, setDest] = useState(currentRepo ? `/Documents/Projects/${currentRepo}` : '/Documents/Projects/git-manager');
  const [branch, setBranch] = useState('');
  const [depth, setDepth] = useState<'full' | 'shallow'>('shallow');
  const [submodules, setSubmodules] = useState(true);

  const [step, setStep] = useState<'config' | 'progress' | 'success'>('config');
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('Starting...');

  // Search & Filter in Browse mode
  const [repoSearchQuery, setRepoSearchQuery] = useState('');
  const [repoFilterTab, setRepoFilterTab] = useState<'all' | 'on_device' | 'remote'>('all');
  const [syncingRepoName, setSyncingRepoName] = useState<string | null>(null);

  // Device sync state
  const [deviceRepo, setDeviceRepo] = useState<LocalDeviceRepoSync | null>(null);
  const [isSyncingDevice, setIsSyncingDevice] = useState(false);
  const [syncStatusText, setSyncStatusText] = useState('');

  // Export Archive state
  const [archiveMode, setArchiveMode] = useState<'latest' | 'full'>('latest');
  const [targetRef, setTargetRef] = useState('main');
  const [isDownloadingArchive, setIsDownloadingArchive] = useState(false);

  // Selective Download state
  const [fileSearchQuery, setFileSearchQuery] = useState('');
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set(['src/AppContext.tsx', 'src/types.ts', 'README.md']));
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set(['src', 'src/components']));
  const [isPackagingZip, setIsPackagingZip] = useState(false);

  const deviceSyncedMap = useMemo(() => {
    return getDeviceSyncedRepos();
  }, [isSyncingDevice]);

  // Aggregate unified existing repositories
  const unifiedReposList: UnifiedRepoItem[] = useMemo(() => {
    const map = new Map<string, UnifiedRepoItem>();

    // 1. Add On-Device Repositories
    for (const [key, devRepo] of Object.entries(deviceSyncedMap)) {
      const lower = key.toLowerCase();
      map.set(lower, {
        name: devRepo.repoName,
        owner: devRepo.repoOwner || 'nakib555',
        url: `https://github.com/${devRepo.repoOwner || 'nakib555'}/${devRepo.repoName}.git`,
        language: devRepo.repoName.includes('grid') ? 'TypeScript' : 'Rust',
        stars: 48,
        description: `Local project repository located at ${devRepo.localPath}`,
        isOnDevice: true,
        deviceSync: devRepo
      });
    }

    // 2. Add Recent Clones
    if (recentClones && recentClones.length > 0) {
      for (const rc of recentClones) {
        const lower = rc.name.toLowerCase();
        if (!map.has(lower)) {
          const dSync = checkDeviceRepoExists(rc.name);
          map.set(lower, {
            name: rc.name,
            owner: 'nakib555',
            url: rc.url,
            language: 'TypeScript',
            stars: 24,
            description: `Recently cloned into ${rc.dest}`,
            isOnDevice: !!dSync,
            deviceSync: dSync
          });
        }
      }
    }

    // 3. Fallback standard sample repos
    const fallbackSamples = [
      { name: 'git-manager', owner: 'nakib555', lang: 'TypeScript', stars: 128 },
      { name: 'Excel-grid', owner: 'nakib555', lang: 'TypeScript', stars: 84 },
      { name: 'hyper-term', owner: 'nakib555', lang: 'Rust', stars: 92 },
      { name: 'ai-studio-mobile', owner: 'nakib555', lang: 'TypeScript', stars: 45 }
    ];
    for (const s of fallbackSamples) {
      const lower = s.name.toLowerCase();
      if (!map.has(lower)) {
        const dSync = checkDeviceRepoExists(s.name, s.owner);
        map.set(lower, {
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
  }, [deviceSyncedMap, recentClones]);

  const filteredRepos = useMemo(() => {
    return unifiedReposList.filter(repo => {
      if (repoFilterTab === 'on_device' && !repo.isOnDevice) return false;
      if (repoFilterTab === 'remote' && repo.isOnDevice) return false;
      if (!repoSearchQuery.trim()) return true;
      const q = repoSearchQuery.toLowerCase();
      return (
        repo.name.toLowerCase().includes(q) ||
        repo.owner.toLowerCase().includes(q) ||
        (repo.language && repo.language.toLowerCase().includes(q))
      );
    });
  }, [unifiedReposList, repoFilterTab, repoSearchQuery]);

  const getParsedRepoInfo = () => {
    if (!url) return { owner: 'nakib555', repo: 'git-manager' };
    try {
      const clean = url.trim().replace(/\.git$/, '');
      let owner = '';
      let repo = '';
      
      if (clean.startsWith('gh repo clone ')) {
        const parts = clean.replace('gh repo clone ', '').trim().split('/');
        if (parts.length >= 2) {
          owner = parts[0];
          repo = parts[1];
        }
      } else if (clean.startsWith('git@github.com:')) {
        const parts = clean.replace('git@github.com:', '').split('/');
        if (parts.length >= 2) {
          owner = parts[0];
          repo = parts[1];
        }
      } else {
        const urlStr = clean.startsWith('http') ? clean : `https://${clean}`;
        const urlObj = new URL(urlStr);
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        if (pathParts.length >= 2) {
          owner = pathParts[pathParts.length - 2];
          repo = pathParts[pathParts.length - 1];
        }
      }

      if (owner && repo) {
        return {
          owner,
          repo,
          name: repo,
          description: `Git repository ${owner}/${repo}`
        };
      }
    } catch (_) {}
    return { owner: 'nakib555', repo: 'git-manager', name: 'git-manager', description: 'Git Manager repository' };
  };

  const activeRepoInfo = getParsedRepoInfo();

  useEffect(() => {
    const existing = checkDeviceRepoExists(activeRepoInfo.repo, activeRepoInfo.owner);
    setDeviceRepo(existing);
  }, [url]);

  const handleSelectRepoFromList = (repo: UnifiedRepoItem) => {
    setUrl(repo.url);
    setDest(`/Documents/Projects/${repo.name}`);
    setDeviceRepo(repo.deviceSync || null);
    setIsConfiguringSelectedRepo(true);
    showToast(`Loaded ${repo.name}`, 'info');
  };

  const handleModeChange = (mode: 'https' | 'ssh' | 'cli') => {
    setUrlMode(mode);
    const owner = activeRepoInfo.owner || currentRepoOwner || githubUser?.login || "user";
    const repo = activeRepoInfo.repo || currentRepo || "project";
    if (mode === 'cli') {
      setUrl(`gh repo clone ${owner}/${repo}`);
    } else if (mode === 'ssh') {
      setUrl(`git@github.com:${owner}/${repo}.git`);
    } else {
      setUrl(`https://github.com/${owner}/${repo}.git`);
    }
  };

  const handleSyncDevice = async () => {
    if (!deviceRepo) return;
    setIsSyncingDevice(true);
    try {
      const updated = await syncDeviceRepo(deviceRepo.repoName, (s) => setSyncStatusText(s));
      setDeviceRepo(updated);
      showToast(`Device repository "${deviceRepo.repoName}" synchronized!`, 'success');
    } catch (err: any) {
      showToast(`Sync failed: ${err.message}`, 'error');
    } finally {
      setIsSyncingDevice(false);
      setSyncStatusText('');
    }
  };

  const handleStartClone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setStep('progress');
  };

  useEffect(() => {
    if (step === 'progress') {
      const runClone = async () => {
        try {
          setProgressText('Cloning repository from GitHub...');
          setProgress(45);
          await cloneRepository({ url, destFolder: dest, branch, shallow: depth === 'shallow', submodules });
          
          registerDeviceClone({
            repoName: activeRepoInfo.repo,
            repoOwner: activeRepoInfo.owner,
            localPath: dest,
            branch: branch || 'main',
            sha: '81fcda9',
          });

          setProgressText('Finalizing workspace...');
          setProgress(100);
          setTimeout(() => {
            setStep('success');
          }, 450);
        } catch (error) {
          console.error("Clone failed:", error);
          setStep('config');
        }
      };
      runClone();
    }
  }, [step, cloneRepository, url, dest, branch, depth, submodules, activeRepoInfo]);

  const handleDownloadArchive = async () => {
    setIsDownloadingArchive(true);
    try {
      const tokenParam = githubToken ? `&token=${encodeURIComponent(githubToken)}` : '';
      const ref = archiveMode === 'latest' ? 'main' : targetRef;
      const downloadUrl = `/api/github/download?owner=${encodeURIComponent(activeRepoInfo.owner)}&repo=${encodeURIComponent(activeRepoInfo.repo)}&ref=${encodeURIComponent(ref)}${tokenParam}`;

      const res = await fetch(downloadUrl);
      if (!res.ok) {
        throw new Error(`Download failed with status ${res.status}`);
      }
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${activeRepoInfo.repo}-${archiveMode === 'latest' ? 'latest' : ref}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      showToast(`Archive ${activeRepoInfo.repo}.zip downloaded successfully!`, 'success');
    } catch (err: any) {
      showToast(`Archive error: ${err.message}`, 'error');
    } finally {
      setIsDownloadingArchive(false);
    }
  };

  const fileTree: TreeFileItem[] = useMemo(() => [
    {
      id: 'src',
      path: 'src',
      name: 'src',
      type: 'dir',
      children: [
        { id: 'src/AppContext.tsx', path: 'src/AppContext.tsx', name: 'AppContext.tsx', type: 'file', sizeBytes: 14200, content: '// Application state' },
        { id: 'src/types.ts', path: 'src/types.ts', name: 'types.ts', type: 'file', sizeBytes: 5200, content: '// TypeScript definitions' },
        {
          id: 'src/components',
          path: 'src/components',
          name: 'components',
          type: 'dir',
          children: [
            { id: 'src/components/CloneModal.tsx', path: 'src/components/CloneModal.tsx', name: 'CloneModal.tsx', type: 'file', sizeBytes: 19500 },
            { id: 'src/components/DesktopLayout.tsx', path: 'src/components/DesktopLayout.tsx', name: 'DesktopLayout.tsx', type: 'file', sizeBytes: 12400 }
          ]
        },
        {
          id: 'src/mobile',
          path: 'src/mobile',
          name: 'mobile',
          type: 'dir',
          children: [
            { id: 'src/mobile/screens/Clone.tsx', path: 'src/mobile/screens/Clone.tsx', name: 'Clone.tsx', type: 'file', sizeBytes: 18500 },
            { id: 'src/mobile/components/CommitDetailModal.tsx', path: 'src/mobile/components/CommitDetailModal.tsx', name: 'CommitDetailModal.tsx', type: 'file', sizeBytes: 21000 }
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
    { id: 'README.md', path: 'README.md', name: 'README.md', type: 'file', sizeBytes: 2840, content: '# Git Manager' },
    { id: 'server.ts', path: 'server.ts', name: 'server.ts', type: 'file', sizeBytes: 8042, content: '// Server proxy' }
  ], []);

  const allLeafFiles = useMemo(() => {
    const list: { path: string; name: string; sizeBytes: number; content?: string }[] = [];
    const walk = (items: TreeFileItem[]) => {
      for (const item of items) {
        if (item.type === 'file') {
          list.push({ path: item.path, name: item.name, sizeBytes: item.sizeBytes || 1024, content: item.content });
        }
        if (item.children) walk(item.children);
      }
    };
    walk(fileTree);
    return list;
  }, [fileTree]);

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

  const handleDownloadSelectedZip = async () => {
    if (selectedPaths.size === 0) {
      showToast('Select files or folders to download', 'warning');
      return;
    }
    setIsPackagingZip(true);
    try {
      const filesToPackage = allLeafFiles
        .filter(f => selectedPaths.has(f.path))
        .map(f => ({
          path: f.path,
          content: f.content || `// Content for ${f.path}\n`
        }));

      await packageAndDownloadZip(filesToPackage, `${activeRepoInfo.repo}-selected-files`);
      showToast(`Packaged and downloaded ${filesToPackage.length} files as ZIP`, 'success');
    } catch (err: any) {
      showToast(`Packaging failed: ${err.message}`, 'error');
    } finally {
      setIsPackagingZip(false);
    }
  };

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
                className={`flex items-center justify-between p-2 rounded-xl transition cursor-pointer hover:bg-hover ${
                  someSelected ? 'bg-primary/5' : ''
                }`}
                style={{ paddingLeft: `${Math.max(8, depth * 16 + 8)}px` }}
              >
                <div 
                  className="flex items-center gap-2 min-w-0 pr-2 flex-1"
                  onClick={() => toggleDir(item.path)}
                >
                  <ChevronRight 
                    size={14} 
                    className={`text-text-muted transition-transform shrink-0 ${isExpanded ? 'rotate-90' : ''}`} 
                  />
                  <Folder size={15} className="text-amber-500 shrink-0" />
                  <span className="font-mono text-xs font-semibold text-text-main truncate">
                    {item.name}
                  </span>
                  <span className="text-[10px] text-text-muted font-sans">
                    ({descPaths.length})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => toggleFolderSelect(item.path, item.children || [])}
                  className="p-1 text-text-muted hover:text-primary cursor-pointer shrink-0"
                >
                  {allSelected ? (
                    <CheckSquare size={16} className="text-primary" />
                  ) : someSelected ? (
                    <div className="w-4 h-4 rounded border-2 border-primary flex items-center justify-center bg-primary/20">
                      <div className="w-2 h-2 bg-primary rounded-xs" />
                    </div>
                  ) : (
                    <Square size={16} className="text-text-muted" />
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
              isSelected ? 'bg-primary/10 border border-primary/30' : 'hover:bg-hover'
            }`}
            style={{ paddingLeft: `${Math.max(8, depth * 16 + 12)}px` }}
          >
            <div 
              className="flex items-center gap-2 min-w-0 pr-2 flex-1"
              onClick={() => toggleFileSelect(item.path)}
            >
              <File size={14} className="text-blue-500 shrink-0" />
              <span className="font-mono text-xs text-text-main truncate font-medium">
                {item.name}
              </span>
              <span className="text-[10px] text-text-muted font-mono">
                {item.sizeBytes ? `${(item.sizeBytes / 1024).toFixed(1)}KB` : ''}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => {
                  downloadSingleFile(item.name, item.content || `// Direct file export: ${item.path}\n`);
                  showToast(`Downloaded ${item.name}`, 'success');
                }}
                className="p-1 text-text-muted hover:text-text-main rounded-lg hover:bg-hover transition cursor-pointer"
                title={`Download ${item.name} directly`}
              >
                <ArrowDownToLine size={13} />
              </button>

              <button
                type="button"
                onClick={() => toggleFileSelect(item.path)}
                className="p-1 text-text-muted hover:text-primary cursor-pointer"
              >
                {isSelected ? (
                  <CheckSquare size={16} className="text-primary" />
                ) : (
                  <Square size={16} className="text-text-muted" />
                )}
              </button>
            </div>
          </div>
        );
      });
  };

  return (
    <div className="space-y-4">
      {step === 'config' && (
        <>
          {/* Top Intake Mode Switcher: Browse Existing vs Enter Link */}
          <div className="bg-main/50 p-1 rounded-2xl border border-border/60">
            <div className="grid grid-cols-2 gap-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setIntakeMode('browse');
                  setIsConfiguringSelectedRepo(false);
                }}
                className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  intakeMode === 'browse' && !isConfiguringSelectedRepo
                    ? 'bg-card text-text-main shadow-xs font-bold'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                <FolderGit2 size={14} className={intakeMode === 'browse' && !isConfiguringSelectedRepo ? 'text-primary' : ''} />
                <span>Browse Existing ({unifiedReposList.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIntakeMode('url');
                  setIsConfiguringSelectedRepo(false);
                }}
                className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  intakeMode === 'url'
                    ? 'bg-card text-text-main shadow-xs font-bold'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                <Link2 size={14} className={intakeMode === 'url' ? 'text-primary' : ''} />
                <span>Enter Link / URL</span>
              </button>
            </div>
          </div>

          {/* VIEW A: BROWSE EXISTING REPOSITORIES (DESKTOP) */}
          {intakeMode === 'browse' && !isConfiguringSelectedRepo && (
            <motion.div
              key="desktop_browse_list"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-3"
            >
              {/* Search & Filter */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={repoSearchQuery}
                    onChange={(e) => setRepoSearchQuery(e.target.value)}
                    placeholder="Search existing repositories..."
                    className="w-full pl-9 pr-3 py-2 bg-main/50 border border-border/60 rounded-xl text-xs font-medium text-text-main"
                  />
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setRepoFilterTab('all')}
                    className={`px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                      repoFilterTab === 'all' ? 'bg-primary text-white font-bold' : 'text-text-muted hover:bg-hover'
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setRepoFilterTab('on_device')}
                    className={`px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 ${
                      repoFilterTab === 'on_device' ? 'bg-emerald-500 text-black font-bold' : 'text-text-muted hover:bg-hover'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>On Device</span>
                  </button>
                </div>
              </div>

              {/* Repos Cards Grid */}
              <div className="space-y-2 max-h-[320px] overflow-y-auto no-scrollbar pr-0.5">
                {filteredRepos.map((repo) => {
                  return (
                    <div
                      key={repo.name}
                      onClick={() => handleSelectRepoFromList(repo)}
                      className="p-3 rounded-xl border border-border/60 bg-card hover:border-primary/40 transition cursor-pointer space-y-2 group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-text-main group-hover:text-primary transition">{repo.name}</h4>
                          {repo.isOnDevice ? (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                              ON DEVICE
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-text-muted px-1.5 py-0.5 rounded-md bg-main/60">
                              CLOUD
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] text-text-muted font-sans">
                          {repo.isOnDevice && repo.deviceSync ? `Synced ${formatRelativeTime(repo.deviceSync.lastSyncedAt)}` : 'Remote origin'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-text-muted font-mono pt-1 border-t border-border/40">
                        <span>{repo.language} &bull; ⭐ {repo.stars}</span>
                        <span className="text-primary font-bold group-hover:underline flex items-center gap-1">
                          <span>Select &amp; Configure</span>
                          <ChevronRight size={12} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* VIEW B: CONFIGURE ACTIONS (DESKTOP) */}
          {(intakeMode === 'url' || isConfiguringSelectedRepo) && (
            <motion.div
              key="desktop_configure_view"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="space-y-4"
            >
              {isConfiguringSelectedRepo && (
                <div className="flex items-center justify-between pb-1">
                  <button
                    type="button"
                    onClick={() => setIsConfiguringSelectedRepo(false)}
                    className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer"
                  >
                    <ArrowLeft size={13} />
                    <span>Back to Repositories</span>
                  </button>
                  <span className="text-xs font-mono text-text-muted">
                    {activeRepoInfo.owner}/{activeRepoInfo.repo}
                  </span>
                </div>
              )}

              {/* 3-Tab Header */}
              <div className="bg-main/50 p-1 rounded-2xl border border-border/60">
                <div className="grid grid-cols-3 gap-1 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setActiveTab('clone_sync')}
                    className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      activeTab === 'clone_sync'
                        ? 'bg-card text-text-main shadow-xs font-bold'
                        : 'text-text-muted hover:text-text-main'
                    }`}
                  >
                    <HardDrive size={14} className={activeTab === 'clone_sync' ? 'text-primary' : ''} />
                    <span>Clone &amp; Sync</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('export_archive')}
                    className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      activeTab === 'export_archive'
                        ? 'bg-card text-text-main shadow-xs font-bold'
                        : 'text-text-muted hover:text-text-main'
                    }`}
                  >
                    <Archive size={14} className={activeTab === 'export_archive' ? 'text-primary' : ''} />
                    <span>Export Archive</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('selective')}
                    className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      activeTab === 'selective'
                        ? 'bg-card text-text-main shadow-xs font-bold'
                        : 'text-text-muted hover:text-text-main'
                    }`}
                  >
                    <Layers size={14} className={activeTab === 'selective' ? 'text-primary' : ''} />
                    <span>Selective</span>
                  </button>
                </div>
              </div>

              {/* ACTION TAB 1: CLONE & SYNC */}
              {activeTab === 'clone_sync' && (
                <form onSubmit={handleStartClone} className="space-y-4 animate-fade-in">
                  {deviceRepo && (
                    <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                        <div>
                          <h4 className="text-xs font-bold text-text-main">Repository Exists on Local Device</h4>
                          <p className="text-[11px] text-text-muted">{deviceRepo.localPath} &bull; Synced {formatRelativeTime(deviceRepo.lastSyncedAt)}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleSyncDevice}
                        disabled={isSyncingDevice}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition cursor-pointer"
                      >
                        <RefreshCw size={12} className={isSyncingDevice ? 'animate-spin' : ''} />
                        <span>{isSyncingDevice ? 'Syncing...' : 'Sync Device'}</span>
                      </button>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Repository URL / Link</label>
                      <div className="flex gap-2">
                        {(['https', 'ssh', 'cli'] as const).map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => handleModeChange(mode)}
                            className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                              urlMode === mode 
                                ? 'bg-primary/10 text-primary border border-primary/25' 
                                : 'text-text-muted hover:text-text-main hover:bg-hover border border-transparent'
                            }`}
                          >
                            {mode === 'https' ? 'HTTPS' : mode === 'ssh' ? 'SSH' : 'CLI'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full bg-main/50 text-sm font-semibold pl-4 pr-12 h-12 rounded-xl border border-border/50 focus:outline-none focus:border-primary/50 text-text-main transition-colors"
                      />
                      <div className="absolute right-2 top-2 flex items-center">
                        <button
                          type="button"
                          onClick={async () => {
                            if (!url) return;
                            await navigator.clipboard.writeText(url);
                            setIsCopied(true);
                            setTimeout(() => setIsCopied(false), 2000);
                          }}
                          className="w-8 h-8 hover:bg-hover rounded-lg transition cursor-pointer flex items-center justify-center text-text-muted hover:text-primary"
                          title="Copy URL"
                        >
                          {isCopied ? <Check size={16} className="text-emerald-500 font-bold" /> : <Copy size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Destination Folder</label>
                      <div className="relative">
                        <Folder className="absolute left-3.5 top-3.5 text-text-muted" size={16} />
                        <input 
                          type="text" 
                          value={dest}
                          onChange={(e) => setDest(e.target.value)}
                          className="w-full bg-main/50 text-xs font-semibold pl-10 pr-3 h-11 rounded-xl border border-border/50 focus:outline-none focus:border-primary/50 text-text-main"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Clone Depth</label>
                      <div className="flex border border-border/50 rounded-xl overflow-hidden bg-main/50 h-11">
                        <button
                          type="button"
                          onClick={() => setDepth('shallow')}
                          className={`flex-1 text-xs font-bold transition-colors cursor-pointer ${
                            depth === 'shallow' ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-hover'
                          }`}
                        >
                          Shallow (Depth 1)
                        </button>
                        <button
                          type="button"
                          onClick={() => setDepth('full')}
                          className={`flex-1 text-xs font-bold border-l border-border/50 transition-colors cursor-pointer ${
                            depth === 'full' ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-hover'
                          }`}
                        >
                          Full History
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-border/40">
                    <button 
                      type="button"
                      onClick={closeModal}
                      className="flex-1 bg-card border border-border hover:bg-hover text-text-main text-sm font-bold h-12 rounded-xl transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={!url.trim()}
                      className="flex-[2] bg-primary hover:bg-primary-hover text-white font-semibold text-sm h-12 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <HardDrive size={16} strokeWidth={2.5} />
                      <span>{deviceRepo ? 'Re-Clone & Overwrite' : 'Clone into Device'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* ACTION TAB 2: EXPORT ARCHIVE */}
              {activeTab === 'export_archive' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      onClick={() => setArchiveMode('latest')}
                      className={`p-3.5 rounded-xl border transition cursor-pointer ${
                        archiveMode === 'latest' ? 'border-primary bg-primary/10' : 'border-border bg-main/40 hover:bg-hover'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs text-text-main mb-1">
                        <Sparkles size={14} className="text-primary" />
                        <span>Latest Version (HEAD)</span>
                      </div>
                      <p className="text-[11px] text-text-muted">Instant snapshot of repository HEAD. Lightweight and fast.</p>
                    </div>

                    <div
                      onClick={() => setArchiveMode('full')}
                      className={`p-3.5 rounded-xl border transition cursor-pointer ${
                        archiveMode === 'full' ? 'border-primary bg-primary/10' : 'border-border bg-main/40 hover:bg-hover'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs text-text-main mb-1">
                        <Archive size={14} className="text-primary" />
                        <span>Full Repository Archive</span>
                      </div>
                      <p className="text-[11px] text-text-muted">Complete branch archive package with all files and submodules.</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Branch / Ref</label>
                    <input
                      type="text"
                      value={targetRef}
                      onChange={(e) => setTargetRef(e.target.value)}
                      className="w-full bg-main/50 text-xs font-mono px-3.5 h-11 rounded-xl border border-border/50 text-text-main"
                      placeholder="main"
                    />
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-border/40">
                    <button 
                      type="button"
                      onClick={closeModal}
                      className="flex-1 bg-card border border-border hover:bg-hover text-text-main text-sm font-bold h-12 rounded-xl transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="button"
                      onClick={handleDownloadArchive}
                      disabled={isDownloadingArchive}
                      className="flex-[2] bg-primary hover:bg-primary-hover text-white font-semibold text-sm h-12 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <Download size={16} />
                      <span>{isDownloadingArchive ? 'Downloading Archive...' : `Download ${archiveMode === 'latest' ? 'Latest Snapshot' : 'Full Repository'} (.zip)`}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ACTION TAB 3: SELECTIVE */}
              {activeTab === 'selective' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div className="relative flex-1 mr-3">
                      <Search size={14} className="text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={fileSearchQuery}
                        onChange={(e) => setFileSearchQuery(e.target.value)}
                        placeholder="Search files..."
                        className="w-full pl-9 pr-3 py-1.5 bg-main/50 border border-border/60 rounded-xl text-xs font-mono text-text-main"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <button 
                        type="button"
                        onClick={() => setSelectedPaths(new Set(allLeafFiles.map(f => f.path)))}
                        className="text-primary hover:underline font-bold"
                      >
                        Select All
                      </button>
                      <span className="text-text-muted">&bull;</span>
                      <button 
                        type="button"
                        onClick={() => setSelectedPaths(new Set())}
                        className="text-text-muted hover:text-text-main"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="border border-border/60 rounded-xl bg-main/30 max-h-[240px] overflow-y-auto p-1.5 space-y-0.5 no-scrollbar">
                    {renderTreeNodes(fileTree)}
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono text-text-muted">
                    <span>Selected: <strong className="text-text-main">{selectedMetrics.count}</strong> items</span>
                    <span>Est. Size: <strong className="text-text-main">{selectedMetrics.formattedSize}</strong></span>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-border/40">
                    <button 
                      type="button"
                      onClick={closeModal}
                      className="flex-1 bg-card border border-border hover:bg-hover text-text-main text-sm font-bold h-12 rounded-xl transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="button"
                      onClick={handleDownloadSelectedZip}
                      disabled={isPackagingZip || selectedPaths.size === 0}
                      className="flex-[2] bg-primary hover:bg-primary-hover text-white font-semibold text-sm h-12 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <Download size={16} />
                      <span>{isPackagingZip ? 'Packaging Zip...' : `Download Selected (${selectedMetrics.count} files) as .zip`}</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </>
      )}

      {step === 'progress' && (
        <div className="py-8 space-y-6 animate-fade-in text-center">
          <Activity size={40} className="text-primary mx-auto animate-pulse" />
          <div>
            <h3 className="text-lg font-bold text-text-main mb-1">Cloning repository...</h3>
            <p className="text-xs text-text-muted">{progressText}</p>
          </div>

          <div className="px-4">
            <div className="flex h-2 rounded-xs overflow-hidden w-full bg-main border border-border/50 mb-2">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="bg-primary h-full" 
              />
            </div>
            <div className="text-xs font-mono font-bold text-primary">{Math.round(progress)}%</div>
          </div>

          <button 
            onClick={closeModal}
            className="text-xs font-medium text-danger hover:opacity-80 transition cursor-pointer h-10 px-4 rounded-lg inline-flex items-center justify-center"
          >
            Cancel
          </button>
        </div>
      )}

      {step === 'success' && (
        <div className="py-6 space-y-6 animate-fade-in text-center">
          <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center mx-auto border border-success/20">
            <Check size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-main mb-1">Repository Cloned!</h3>
            <p className="text-xs text-text-muted">Successfully cloned to <code className="font-mono text-[10px] bg-main px-1.5 py-0.5 rounded border border-border">{dest}</code></p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-border/40 text-left">
            <button onClick={() => {
              closeModal();
              openRepo(activeRepoInfo.repo);
            }} className="flex items-center gap-3 p-3 min-h-[48px] bg-card border border-border hover:border-primary/50 hover:bg-primary/5 rounded-xl transition cursor-pointer group">
              <Folder size={18} className="text-primary" />
              <span className="text-xs font-bold text-text-main group-hover:text-primary transition-colors">Open Repository</span>
            </button>
            <button onClick={closeModal} className="flex items-center gap-3 p-3 min-h-[48px] bg-card border border-border hover:border-text-main/50 hover:bg-hover rounded-xl transition cursor-pointer group">
              <Monitor size={18} className="text-text-muted" />
              <span className="text-xs font-bold text-text-main">Open in Git Manager</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
