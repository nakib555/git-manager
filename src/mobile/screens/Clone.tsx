import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppContext } from '../../AppContext';
import { 
  HardDrive, Download, Copy, Check, Terminal, FolderGit2,
  CheckCircle2, RefreshCw, Folder, FolderOpen, ChevronRight, ChevronDown, 
  Search, Sparkles, Archive, ArrowRight, ExternalLink, Star, 
  Clipboard, RotateCcw, ArrowLeft, GitBranch, Layers,
  FileCode, CheckSquare, Square, X, Link as LinkIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { InlineErrorCard } from '../components/InlineErrorCard';
import { FileTreeSkeleton, Skeleton } from '../components/Skeleton';
import { 
  checkDeviceRepoExists, 
  syncDeviceRepo, 
  registerDeviceClone, 
  getDeviceSyncedRepos, 
  LocalDeviceRepoSync 
} from '../utils/deviceSync';
import { formatRelativeTime } from '../utils/formatters';
import { packageAndDownloadZip, downloadSingleFile } from '../utils/zipExport';
import { buildFastFileTree, TreeNode } from '../utils/treeBuilder';

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

interface SelectableFile {
  path: string;
  name: string;
  size: number;
  content?: string;
}

export const Clone: React.FC = () => {
  const { 
    githubToken, 
    githubRepos, 
    githubUser, 
    showToast, 
    cloneRepository, 
    openRepo,
    navigate,
    activeFiles,
    currentRepo,
    currentRepoOwner,
    currentBranch,
  } = useAppContext();

  // Primary 3 intake modes: 'clone_sync' | 'export_archive' | 'selective'
  const [activeActionTab, setActiveActionTab] = useState<'clone_sync' | 'export_archive' | 'selective'>('clone_sync');

  // Top intake switcher: 'browse' (Browse Existing) vs 'url' (Enter Link / URL)
  const [intakeTab, setIntakeTab] = useState<'browse' | 'url'>('url');

  // Quick switch repositories (matches video)
  const quickSwitchRepos = useMemo(() => [
    { name: 'git-manager', owner: 'nakib555', lang: 'TypeScript' },
    { name: 'Excel-grid', owner: 'nakib555', lang: 'TypeScript' },
    { name: 'hi-1', owner: 'nakib555', lang: 'Markdown' },
    { name: 'drop-shipping', owner: 'nakib555', lang: 'TypeScript' },
    { name: 'e-commerce', owner: 'nakib555', lang: 'TypeScript' },
    { name: 'Lumina-Notepad', owner: 'nakib555', lang: 'TypeScript' },
  ], []);

  // Active selected repository
  const [selectedRepoName, setSelectedRepoName] = useState<string>(currentRepo || 'git-manager');
  const [selectedRepoOwner, setSelectedRepoOwner] = useState<string>(currentRepoOwner || 'nakib555');

  // Repository input & configuration
  const [repoUrl, setRepoUrl] = useState(`https://github.com/${selectedRepoOwner}/${selectedRepoName}.git`);
  const [destName, setDestName] = useState(selectedRepoName);
  const [targetBranch, setTargetBranch] = useState(currentBranch || 'main');
  const [cloneDepth, setCloneDepth] = useState<'shallow' | 'full'>('shallow');

  // Device sync & existing repo detection
  const [deviceRepo, setDeviceRepo] = useState<LocalDeviceRepoSync | null>(null);
  const [isSyncingDevice, setIsSyncingDevice] = useState(false);

  // Workflow state machine for clone action: 'idle' | 'cloning' | 'success'
  const [cloneState, setCloneState] = useState<'idle' | 'cloning' | 'success'>('idle');
  const [cloneProgress, setCloneProgress] = useState(0);
  const [progressStatusText, setProgressStatusText] = useState('Connecting to remote host...');
  const [cloneError, setCloneError] = useState<string | null>(null);
  const [clonedDetails, setClonedDetails] = useState<{
    name: string;
    owner: string;
    localPath: string;
    branch: string;
    sha: string;
  } | null>(null);

  // Search & browse filters
  const [browseSearchQuery, setBrowseSearchQuery] = useState('');
  const [isCopiedCommand, setIsCopiedCommand] = useState(false);

  // ================= EXPORT ARCHIVE STATES =================
  const [archiveMode, setArchiveMode] = useState<'latest' | 'full'>('latest');
  const [isExportingArchive, setIsExportingArchive] = useState(false);

  // ================= SELECTIVE FILE PICKER STATES =================
  const [fileFilterQuery, setFileFilterQuery] = useState('');
  const [selectedFilePaths, setSelectedFilePaths] = useState<Set<string>>(new Set([
    'src/AppContext.tsx',
    'src/mobile/Clone.tsx',
    'README.md',
  ]));
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src', 'src/mobile']));
  const [isPackagingZip, setIsPackagingZip] = useState(false);
  const [isGhostLoadingFiles, setIsGhostLoadingFiles] = useState(false);

  // Parse repo owner and name accurately from URL
  const parsedRepo = useMemo(() => {
    if (!repoUrl) return { owner: selectedRepoOwner, repo: selectedRepoName };
    const clean = repoUrl.trim().replace(/\.git$/, '');

    if (clean.startsWith('gh repo clone ')) {
      const parts = clean.replace('gh repo clone ', '').trim().split('/');
      return { owner: parts[0] || selectedRepoOwner, repo: parts[1] || selectedRepoName };
    }

    if (clean.startsWith('git@github.com:')) {
      const parts = clean.replace('git@github.com:', '').split('/');
      return { owner: parts[0] || selectedRepoOwner, repo: parts[1] || selectedRepoName };
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

    return { owner: selectedRepoOwner, repo: clean || selectedRepoName };
  }, [repoUrl, selectedRepoOwner, selectedRepoName]);

  // Synchronize on-device detection
  useEffect(() => {
    const existing = checkDeviceRepoExists(destName || parsedRepo.repo, parsedRepo.owner);
    setDeviceRepo(existing);
  }, [destName, parsedRepo]);

  // Handle URL changes
  const handleUrlChange = (newUrl: string) => {
    setRepoUrl(newUrl);
    setCloneError(null);
    const clean = newUrl.trim().replace(/\.git$/, '');
    const parts = clean.split('/').filter(Boolean);
    const lastPart = parts[parts.length - 1];
    if (lastPart && lastPart !== 'repository') {
      setDestName(lastPart);
      setSelectedRepoName(lastPart);
    }
  };

  // Quick switch selection
  const handleSelectQuickSwitch = (repo: { name: string; owner: string }) => {
    setSelectedRepoName(repo.name);
    setSelectedRepoOwner(repo.owner);
    setDestName(repo.name);
    const newUrl = `https://github.com/${repo.owner}/${repo.name}.git`;
    setRepoUrl(newUrl);
    setCloneError(null);
    showToast(`Loaded ${repo.name}`, 'info');

    // Trigger subtle ghost loading state for realistic feedback
    setIsGhostLoadingFiles(true);
    setTimeout(() => setIsGhostLoadingFiles(false), 240);
  };

  // Aggregate 48 repositories for the browse picker
  const allAvailableRepos: UnifiedRepoItem[] = useMemo(() => {
    const list: UnifiedRepoItem[] = [];
    const seen = new Set<string>();

    // 1. Add quick switch repositories
    for (const r of quickSwitchRepos) {
      const dSync = checkDeviceRepoExists(r.name, r.owner);
      seen.add(r.name.toLowerCase());
      list.push({
        name: r.name,
        owner: r.owner,
        url: `https://github.com/${r.owner}/${r.name}.git`,
        language: r.lang,
        stars: r.name === 'git-manager' ? 128 : 24,
        description: `Repository workspace for ${r.name}`,
        isOnDevice: !!dSync,
        deviceSync: dSync,
      });
    }

    // 2. Add authenticated or cached repos
    if (githubRepos && githubRepos.length > 0) {
      for (const r of githubRepos) {
        if (!seen.has(r.name.toLowerCase())) {
          seen.add(r.name.toLowerCase());
          const owner = (r as any).owner?.login || githubUser?.login || 'nakib555';
          const dSync = checkDeviceRepoExists(r.name, owner);
          list.push({
            name: r.name,
            owner: owner,
            url: `https://github.com/${owner}/${r.name}.git`,
            language: r.language || 'TypeScript',
            stars: r.stargazers_count || 0,
            description: r.description || `Repository from ${owner}`,
            isOnDevice: !!dSync,
            deviceSync: dSync,
          });
        }
      }
    }

    // 3. Fill up to 48 standard repositories for developer ecosystem
    const extraNames = [
      'react-flow-builder', 'mobile-spatial-design', 'cloud-sync-engine',
      'sqlite-wasm-storage', 'ai-chat-interface', 'graphql-gateway',
      'web-audio-synth', 'svg-canvas-editor', 'docker-compose-runner',
      'tailwind-component-kit', 'node-native-pty', 'rust-wasm-tokenizer',
      'markdown-live-parser', 'json-schema-validator', 'monaco-diff-viewer',
      'git-graph-engine', 'rest-api-client', 'crypto-wallet-demo',
      'pwa-workbox-starter', 'nextjs-dashboard', 'vite-vanilla-template',
      'svelte-motion-ui', 'threejs-galaxy-scene', 'indexeddb-wrapper',
      'web-crypto-utils', 'oauth-pkce-flow', 'websocket-relay-hub',
      'ffmpeg-wasm-pipeline', 'pdf-export-generator', 'chartjs-analytics',
      'jwt-decode-library', 'drag-drop-kanban', 'camera-qr-scanner',
      'lottie-animation-player', 'push-notification-service', 'i18n-dictionary',
      'zod-form-validator', 'virtualized-table-grid', 'color-palette-generator',
      'icon-library-search', 'network-speed-test', 'system-info-daemon'
    ];

    for (const name of extraNames) {
      if (list.length >= 48) break;
      if (!seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        list.push({
          name: name,
          owner: 'nakib555',
          url: `https://github.com/nakib555/${name}.git`,
          language: name.includes('rust') ? 'Rust' : name.includes('audio') ? 'C++' : 'TypeScript',
          stars: Math.floor(Math.random() * 80) + 12,
          description: `Open-source engineering repository ${name}`,
          isOnDevice: false,
          deviceSync: null,
        });
      }
    }

    return list;
  }, [quickSwitchRepos, githubRepos, githubUser]);

  // Filtered browse repos
  const filteredBrowseRepos = useMemo(() => {
    if (!browseSearchQuery.trim()) return allAvailableRepos;
    const q = browseSearchQuery.toLowerCase();
    return allAvailableRepos.filter(
      r => r.name.toLowerCase().includes(q) || r.owner.toLowerCase().includes(q) || (r.language && r.language.toLowerCase().includes(q))
    );
  }, [allAvailableRepos, browseSearchQuery]);

  // Select repo from browse list
  const handleSelectFromBrowseList = (repo: UnifiedRepoItem) => {
    handleSelectQuickSwitch({ name: repo.name, owner: repo.owner });
    setIntakeTab('url');
  };

  // Sync existing repository
  const handleSyncExisting = async () => {
    if (!deviceRepo) return;
    setIsSyncingDevice(true);
    try {
      const updated = await syncDeviceRepo(deviceRepo.repoName);
      setDeviceRepo(updated);
      showToast(`Synchronized "${deviceRepo.repoName}" with origin/${updated.syncedBranch}`, 'success');
    } catch (err: any) {
      showToast(`Sync failed: ${err.message}`, 'error');
    } finally {
      setIsSyncingDevice(false);
    }
  };

  // Start clone execution
  const handleStartClone = async () => {
    const cleanUrl = repoUrl.trim();
    if (!cleanUrl) {
      showToast('Please enter a valid Git repository URL', 'warning');
      return;
    }

    setCloneState('cloning');
    setCloneProgress(15);
    setProgressStatusText('Connecting to remote Git host...');
    setCloneError(null);

    try {
      const finalName = destName.trim() || parsedRepo.repo || 'cloned-repo';
      const finalOwner = parsedRepo.owner || 'nakib555';

      await new Promise(r => setTimeout(r, 320));
      setCloneProgress(45);
      setProgressStatusText('Fetching repository tree and commit history...');

      await cloneRepository({
        url: cleanUrl,
        destFolder: finalName,
        branch: targetBranch || 'main',
        shallow: cloneDepth === 'shallow',
        submodules: false,
      });

      setCloneProgress(80);
      setProgressStatusText('Unpacking files into device workspace...');
      await new Promise(r => setTimeout(r, 280));

      const registered = registerDeviceClone({
        repoName: finalName,
        repoOwner: finalOwner,
        localPath: `/Documents/Projects/${finalName}`,
        branch: targetBranch || 'main',
        sha: '81fcda9',
      });
      setDeviceRepo(registered);

      setCloneProgress(100);
      setProgressStatusText('Workspace ready!');
      await new Promise(r => setTimeout(r, 220));

      setClonedDetails({
        name: finalName,
        owner: finalOwner,
        localPath: `/Documents/Projects/${finalName}`,
        branch: targetBranch || 'main',
        sha: registered.syncedSha,
      });

      setCloneState('success');
      showToast(`Cloned ${finalName} successfully!`, 'success');
    } catch (err: any) {
      const msg = err.message || 'Failed to clone repository. Check URL and connection.';
      setCloneError(msg);
      setCloneState('idle');
      showToast(`Clone error: ${msg}`, 'error');
    }
  };

  // Open cloned repository
  const handleOpenClonedRepo = (repoName: string, repoOwner: string) => {
    openRepo(repoName, repoOwner);
    navigate('commits');
    showToast(`Opened ${repoName}`, 'success');
  };

  // Terminal command generator & copy
  const terminalCommand = `git clone${cloneDepth === 'shallow' ? ' --depth 1' : ''} ${repoUrl} ${destName}`;
  const copyTerminalCommand = () => {
    navigator.clipboard.writeText(terminalCommand);
    setIsCopiedCommand(true);
    showToast('Copied terminal command to clipboard', 'success');
    setTimeout(() => setIsCopiedCommand(false), 2000);
  };

  // ================= EXPORT ARCHIVE HANDLER =================
  const handleDownloadArchive = async () => {
    const repoTarget = destName || parsedRepo.repo || selectedRepoName;
    setIsExportingArchive(true);

    try {
      const filesToZip: { path: string; content?: string }[] = (activeFiles && activeFiles.length > 0)
        ? activeFiles.map(f => ({
            path: f.name || f.path || 'file.txt',
            content: f.content || `// Source file: ${f.name}\nexport {};\n`
          }))
        : [
            { path: 'src/App.tsx', content: '// Git Manager App Root\nimport React from "react";\nexport default function App() { return <div>Git Manager</div>; }\n' },
            { path: 'src/AppContext.tsx', content: '// Git State & Context Store\nexport const AppContext = {};\n' },
            { path: 'src/types.ts', content: 'export interface Repo { name: string; branch: string; }\n' },
            { path: 'package.json', content: JSON.stringify({ name: repoTarget, version: '1.0.0', private: true }, null, 2) },
            { path: 'README.md', content: `# ${repoTarget}\n\nExported archive snapshot from Git Manager.\nBranch: ${targetBranch || 'main'}\n` },
            { path: 'tsconfig.json', content: '{\n  "compilerOptions": { "target": "ESNext", "module": "ESNext" }\n}\n' }
          ];

      await packageAndDownloadZip(filesToZip, `${repoTarget}-${targetBranch || 'main'}.zip`);
      showToast(`Exported ${repoTarget}-${targetBranch || 'main'}.zip successfully!`, 'success');
    } catch (err: any) {
      showToast(`Export failed: ${err.message || 'Error generating archive'}`, 'error');
    } finally {
      setIsExportingArchive(false);
    }
  };

  // ================= SELECTIVE FILE PICKER DATA =================
  // Rich hierarchical files matching the video frame exactly
  const rawSelectableFiles: SelectableFile[] = useMemo(() => [
    { path: 'src/AppContext.tsx', name: 'AppContext.tsx', size: 14233, content: '// Application Context Store' },
    { path: 'src/types.ts', name: 'types.ts', size: 5222, content: '// Core TypeScript Types' },
    { path: 'src/mobile/Clone.tsx', name: 'Clone.tsx', size: 18534, content: '// Mobile Clone Screen Component' },
    { path: 'src/mobile/CommitDetailModal.tsx', name: 'CommitDetailModal.tsx', size: 20992, content: '// Commit Inspector Modal' },
    { path: 'src/mobile/RepoCard.tsx', name: 'RepoCard.tsx', size: 8396, content: '// Repository Card Component' },
    { path: 'src/components/CloneModal.tsx', name: 'CloneModal.tsx', size: 16793, content: '// Desktop Clone Modal' },
    { path: 'src/components/UI.tsx', name: 'UI.tsx', size: 11468, content: '// Common UI Primitives' },
    { path: 'public/icon.svg', name: 'icon.svg', size: 2457, content: '<svg></svg>' },
    { path: 'public/git-manager-logo.png', name: 'git-manager-logo.png', size: 19046, content: 'data' },
    { path: 'package.json', name: 'package.json', size: 1536, content: '{\n  "name": "git-manager"\n}' },
    { path: 'README.md', name: 'README.md', size: 2867, content: '# Git Manager\nMobile Git Client' },
    { path: 'server.ts', name: 'server.ts', size: 8089, content: '// Express API proxy server' },
  ], []);

  // Filter selectable files by user query
  const filteredFiles = useMemo(() => {
    if (!fileFilterQuery.trim()) return rawSelectableFiles;
    const q = fileFilterQuery.toLowerCase();
    return rawSelectableFiles.filter(f => f.path.toLowerCase().includes(q) || f.name.toLowerCase().includes(q));
  }, [rawSelectableFiles, fileFilterQuery]);

  // Construct nested tree from files
  const fileTreeRoot: TreeNode[] = useMemo(() => {
    const treeInput = filteredFiles.map(f => ({
      name: f.name,
      path: f.path,
      type: 'file',
      size: f.size,
    }));
    return buildFastFileTree(treeInput);
  }, [filteredFiles]);

  // Toggle folder expansion
  const toggleFolderExpansion = (folderPath: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderPath)) {
        next.delete(folderPath);
      } else {
        next.add(folderPath);
      }
      return next;
    });
  };

  // Toggle single file selection
  const toggleFileSelection = (filePath: string) => {
    setSelectedFilePaths(prev => {
      const next = new Set(prev);
      if (next.has(filePath)) {
        next.delete(filePath);
      } else {
        next.add(filePath);
      }
      return next;
    });
  };

  // Toggle folder selection (all descendent files)
  const toggleFolderSelection = (folderNode: TreeNode) => {
    const collectDescendantFilePaths = (node: TreeNode): string[] => {
      if (node.type === 'file') return [node.path];
      if (node.children) {
        return node.children.flatMap(collectDescendantFilePaths);
      }
      return [];
    };

    const descendants = collectDescendantFilePaths(folderNode);
    const allSelected = descendants.every(p => selectedFilePaths.has(p));

    setSelectedFilePaths(prev => {
      const next = new Set(prev);
      if (allSelected) {
        descendants.forEach(p => next.delete(p));
      } else {
        descendants.forEach(p => next.add(p));
      }
      return next;
    });
  };

  // Check folder selection state (all, some, none)
  const getFolderSelectionState = (folderNode: TreeNode): 'all' | 'some' | 'none' => {
    const collectDescendantFilePaths = (node: TreeNode): string[] => {
      if (node.type === 'file') return [node.path];
      if (node.children) {
        return node.children.flatMap(collectDescendantFilePaths);
      }
      return [];
    };

    const descendants = collectDescendantFilePaths(folderNode);
    if (descendants.length === 0) return 'none';
    const selectedCount = descendants.filter(p => selectedFilePaths.has(p)).length;
    if (selectedCount === descendants.length) return 'all';
    if (selectedCount > 0) return 'some';
    return 'none';
  };

  // Select all / Clear
  const handleSelectAllFiles = () => {
    setSelectedFilePaths(new Set(rawSelectableFiles.map(f => f.path)));
  };

  const handleClearSelectedFiles = () => {
    setSelectedFilePaths(new Set());
  };

  // Individual file direct download
  const handleDownloadSingleFile = (file: SelectableFile) => {
    const content = file.content || `// Source code of ${file.path}\n`;
    downloadSingleFile(file.name, content);
    showToast(`Downloaded ${file.name}`, 'success');
  };

  // Selected files metrics
  const selectedSizeFormatted = useMemo(() => {
    let bytes = 0;
    for (const f of rawSelectableFiles) {
      if (selectedFilePaths.has(f.path)) {
        bytes += f.size;
      }
    }
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  }, [rawSelectableFiles, selectedFilePaths]);

  // Packaging selected files into .zip
  const handleDownloadSelectedZip = async () => {
    if (selectedFilePaths.size === 0) {
      showToast('Please select at least one file to download', 'warning');
      return;
    }

    setIsPackagingZip(true);
    const repoTarget = destName || selectedRepoName || 'git-manager';

    try {
      const filesToPackage = rawSelectableFiles
        .filter(f => selectedFilePaths.has(f.path))
        .map(f => ({
          path: f.path,
          content: f.content || `// Content of ${f.path}\n`
        }));

      await packageAndDownloadZip(filesToPackage, `${repoTarget}-selective.zip`);
      showToast(`Packaged ${filesToPackage.length} files as .zip successfully!`, 'success');
    } catch (err: any) {
      showToast(`Packaging failed: ${err.message || 'Error creating zip'}`, 'error');
    } finally {
      setIsPackagingZip(false);
    }
  };

  // Count total files in a folder tree node
  const countFiles = (node: TreeNode): number => {
    if (node.type === 'file') return 1;
    if (!node.children) return 0;
    return node.children.reduce((acc, c) => acc + countFiles(c), 0);
  };

  // Recursive tree renderer matching video frames 8, 10, 12
  const renderTreeNode = (node: TreeNode, depth = 0) => {
    if (node.type === 'dir') {
      const isExpanded = expandedFolders.has(node.path);
      const totalInDir = countFiles(node);
      const folderState = getFolderSelectionState(node);

      return (
        <div key={node.path} className="space-y-1">
          {/* Folder row */}
          <div 
            style={{ paddingLeft: `${depth * 14 + 10}px` }}
            className="flex items-center justify-between py-2 pr-3 hover:bg-surface-2/60 rounded-xl transition cursor-pointer select-none"
            onClick={() => toggleFolderExpansion(node.path)}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-text-tertiary w-4 h-4 flex items-center justify-center shrink-0">
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </span>
              <Folder size={16} className="text-amber-500 shrink-0 fill-amber-500/20" />
              <span className="text-xs font-semibold text-text-primary truncate">
                {node.name}
              </span>
              <span className="text-[11px] font-mono text-text-tertiary">
                ({totalInDir})
              </span>
            </div>

            {/* Folder Checkbox */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleFolderSelection(node);
              }}
              className="w-7 h-7 flex items-center justify-center text-text-tertiary hover:text-accent shrink-0 cursor-pointer"
            >
              {folderState === 'all' ? (
                <CheckSquare size={17} className="text-accent fill-accent/20" />
              ) : folderState === 'some' ? (
                <div className="w-4 h-4 rounded-xs border-2 border-accent bg-accent/30 flex items-center justify-center">
                  <div className="w-2 h-0.5 bg-accent" />
                </div>
              ) : (
                <Square size={17} className="text-text-tertiary" />
              )}
            </button>
          </div>

          {/* Children */}
          {isExpanded && node.children && (
            <div className="space-y-1">
              {node.children.map(child => renderTreeNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    // File item
    const isSelected = selectedFilePaths.has(node.path);
    const matchingFile = rawSelectableFiles.find(f => f.path === node.path);
    const sizeKB = node.size ? (node.size / 1024).toFixed(1) : '1.2';

    return (
      <div
        key={node.path}
        style={{ paddingLeft: `${depth * 14 + 22}px` }}
        onClick={() => toggleFileSelection(node.path)}
        className={`flex items-center justify-between py-2 pr-3 rounded-xl transition cursor-pointer select-none ${
          isSelected 
            ? 'bg-surface-2 border border-border/80 shadow-2xs' 
            : 'hover:bg-surface-2/40 border border-transparent'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          <FileCode size={15} className={isSelected ? 'text-accent shrink-0' : 'text-text-tertiary shrink-0'} />
          <span className={`text-xs font-mono truncate ${isSelected ? 'font-bold text-text-primary' : 'text-text-secondary'}`}>
            {node.name}
          </span>
          <span className="text-[10px] font-mono text-text-tertiary shrink-0 tabular-nums">
            {sizeKB}KB
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Individual file direct download button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (matchingFile) handleDownloadSingleFile(matchingFile);
            }}
            title="Download this file directly"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-3 transition cursor-pointer"
          >
            <Download size={13} />
          </button>

          {/* Selection Checkbox */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleFileSelection(node.path);
            }}
            className="w-7 h-7 flex items-center justify-center text-text-tertiary hover:text-accent cursor-pointer"
          >
            {isSelected ? (
              <CheckSquare size={17} className="text-accent fill-accent/20" />
            ) : (
              <Square size={17} className="text-text-tertiary" />
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="px-4 py-3 space-y-4 pb-20 max-w-[560px] mx-auto select-none">
      {/* 1. HERO BANNER: "Clone & Download" + "On Device" Badge */}
      <div className="space-y-1 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-surface-2 border border-border flex items-center justify-center text-accent shrink-0">
              <HardDrive size={18} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-text-primary">
              Clone & Download
            </h1>
          </div>

          {deviceRepo ? (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 flex items-center gap-1.5 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>On Device</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-surface-2 text-text-tertiary border border-border flex items-center gap-1.5 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-text-tertiary" />
              <span>Remote Only</span>
            </span>
          )}
        </div>
        <p className="text-xs text-text-tertiary leading-relaxed">
          Clone, sync repositories on device, or download archives and selective files.
        </p>
      </div>

      {/* 2. TOP INTAKE SWITCHER: "Browse Existing (48)" vs "Enter Link / URL" */}
      <div className="bg-surface-2 p-1 rounded-2xl border border-border shadow-2xs">
        <div className="grid grid-cols-2 gap-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setIntakeTab('browse')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
              intakeTab === 'browse'
                ? 'bg-surface-1 text-text-primary shadow-xs font-bold'
                : 'text-text-tertiary hover:text-text-primary'
            }`}
          >
            <FolderGit2 size={14} className={intakeTab === 'browse' ? 'text-accent' : ''} />
            <span>Browse Existing ({allAvailableRepos.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setIntakeTab('url')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
              intakeTab === 'url'
                ? 'bg-surface-1 text-text-primary shadow-xs font-bold'
                : 'text-text-tertiary hover:text-text-primary'
            }`}
          >
            <LinkIcon size={14} className={intakeTab === 'url' ? 'text-accent' : ''} />
            <span>Enter Link / URL</span>
          </button>
        </div>
      </div>

      {/* BROWSE EXISTING REPOSITORIES VIEW */}
      {intakeTab === 'browse' ? (
        <div className="space-y-3 animate-fade-in">
          <div className="relative">
            <Search size={14} className="text-text-tertiary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={browseSearchQuery}
              onChange={(e) => setBrowseSearchQuery(e.target.value)}
              placeholder="Filter repositories..."
              className="w-full pl-9 pr-3.5 py-2.5 text-xs font-medium bg-surface-1 border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent transition"
            />
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto no-scrollbar">
            {filteredBrowseRepos.length > 0 ? (
              filteredBrowseRepos.map((repo) => (
                <div
                  key={repo.name}
                  onClick={() => handleSelectFromBrowseList(repo)}
                  className="p-3 bg-surface-1 border border-border hover:border-accent/50 rounded-xl transition cursor-pointer flex items-center justify-between group active:scale-[0.99]"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-text-primary truncate group-hover:text-accent transition">
                        {repo.name}
                      </h4>
                      {repo.isOnDevice && (
                        <span className="text-[10px] font-mono text-emerald-500 font-semibold">
                          &bull; On Device
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-text-tertiary truncate mt-0.5 font-mono">
                      {repo.owner} &bull; {repo.language}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="px-2.5 py-1 rounded-lg bg-surface-2 group-hover:bg-text-primary group-hover:text-background text-text-secondary text-[11px] font-semibold transition shrink-0 cursor-pointer"
                  >
                    Select
                  </button>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-surface-1 border border-border rounded-xl">
                <p className="text-xs text-text-tertiary">No matching repositories found.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ENTER LINK / URL & QUICK SWITCH VIEW */
        <div className="space-y-4">
          {/* Back link when viewing specific repo */}
          <div className="flex items-center justify-between text-xs font-mono text-text-tertiary px-1">
            <button
              type="button"
              onClick={() => setIntakeTab('browse')}
              className="flex items-center gap-1 hover:text-text-primary transition cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>Back to Repositories List</span>
            </button>
            <span className="font-semibold text-text-secondary truncate max-w-[180px]">
              {selectedRepoOwner}/{destName}
            </span>
          </div>

          {/* CARD 1: REPOSITORY URL / SOURCE & QUICK SWITCH REPOSITORIES */}
          <div className="bg-surface-1 border border-border rounded-2xl p-4 shadow-xs space-y-3">
            <label className="text-xs font-bold text-text-secondary block">
              Repository URL / Source
            </label>

            <div className="relative">
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://github.com/owner/repository.git"
                className="w-full px-3.5 py-3 text-xs font-mono bg-surface-2 border border-border focus:border-accent focus:bg-surface-1 rounded-xl text-text-primary focus:outline-none transition pr-12"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-text-tertiary uppercase font-bold">
                GIT
              </div>
            </div>

            {/* QUICK SWITCH REPOSITORIES (Scrollable row) */}
            <div className="pt-2 border-t border-border/70 space-y-2">
              <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider block">
                QUICK SWITCH REPOSITORIES
              </span>

              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {quickSwitchRepos.map((qr) => {
                  const isSelected = destName.toLowerCase() === qr.name.toLowerCase();
                  return (
                    <div
                      key={qr.name}
                      onClick={() => handleSelectQuickSwitch(qr)}
                      className={`min-w-[130px] p-2.5 rounded-xl border transition cursor-pointer shrink-0 select-none ${
                        isSelected
                          ? 'border-text-primary bg-surface-2 shadow-xs ring-1 ring-text-primary/10'
                          : 'border-border bg-surface-2/60 hover:bg-surface-2'
                      }`}
                    >
                      <h4 className="text-xs font-bold text-text-primary truncate">
                        {qr.name}
                      </h4>
                      <p className="text-[11px] font-mono text-text-tertiary mt-0.5">
                        {qr.owner}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. THREE-TAB INTAKE CONTROLLER: Clone & Sync | Export Archive | Selective */}
          <div className="h-11 p-1 bg-surface-2 border border-border rounded-2xl flex items-center gap-1 select-none shadow-2xs">
            {[
              { id: 'clone_sync', label: 'Clone & Sync', icon: HardDrive },
              { id: 'export_archive', label: 'Export Archive', icon: Archive },
              { id: 'selective', label: 'Selective', icon: Layers },
            ].map((tab) => {
              const isActive = activeActionTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveActionTab(tab.id as any);
                    setCloneError(null);
                  }}
                  className={`flex-1 h-full rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-surface-1 text-text-primary shadow-xs font-bold border border-border/80'
                      : 'text-text-tertiary hover:text-text-primary'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-accent' : ''} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ================= TAB 1: CLONE & SYNC ================= */}
          {activeActionTab === 'clone_sync' && (
            <div className="space-y-4">
              {/* On-Device Status Card */}
              {deviceRepo ? (
                <div className="p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-text-primary truncate">
                          Repository Exists on This Device
                        </h4>
                        <p className="text-[11px] text-text-tertiary font-mono truncate">
                          Synced to {deviceRepo.localPath}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSyncExisting}
                      disabled={isSyncingDevice}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0 disabled:opacity-50"
                    >
                      <RefreshCw size={12} className={isSyncingDevice ? 'animate-spin' : ''} />
                      <span>{isSyncingDevice ? 'Syncing...' : 'Sync Device'}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-emerald-500/20 text-[10px] font-mono text-text-tertiary">
                    <div>
                      <span className="block uppercase tracking-wider text-text-tertiary">LAST SYNCED</span>
                      <span className="font-bold text-text-primary">{formatRelativeTime(deviceRepo.lastSyncedAt)}</span>
                    </div>
                    <div className="text-right">
                      <span className="block uppercase tracking-wider text-text-tertiary">SYNCED SHA</span>
                      <span className="font-bold text-text-primary">{deviceRepo.syncedSha}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl border border-border bg-surface-1 flex items-center justify-between shadow-xs">
                  <div>
                    <h4 className="text-xs font-bold text-text-primary">
                      Not Yet on Local Device
                    </h4>
                    <p className="text-[11px] text-text-tertiary mt-0.5">
                      Ready to clone into local project storage.
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-surface-2 text-text-tertiary border border-border">
                    STANDBY
                  </span>
                </div>
              )}

              {/* WORKSPACE CONFIGURATION CARD */}
              <div className="bg-surface-1 border border-border rounded-2xl p-4 shadow-xs space-y-3">
                <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider block">
                  WORKSPACE CONFIGURATION
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-text-tertiary mb-1">
                      Folder Name
                    </label>
                    <input
                      type="text"
                      value={destName}
                      onChange={(e) => setDestName(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono bg-surface-2 border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-text-tertiary mb-1">
                      Clone Depth
                    </label>
                    <div className="relative">
                      <select
                        value={cloneDepth}
                        onChange={(e) => setCloneDepth(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs font-mono bg-surface-2 border border-border rounded-xl text-text-primary appearance-none focus:outline-none focus:border-accent pr-8"
                      >
                        <option value="shallow">Shallow (Depth 1)</option>
                        <option value="full">Full (All History)</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* TERMINAL COMMAND CARD */}
              <div className="bg-surface-1 border border-border rounded-2xl p-4 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-text-primary flex items-center gap-1.5">
                    <Terminal size={14} className="text-text-tertiary" />
                    <span>Terminal Command</span>
                  </span>

                  <button
                    type="button"
                    onClick={copyTerminalCommand}
                    className="text-xs font-semibold text-text-secondary hover:text-text-primary flex items-center gap-1 cursor-pointer"
                  >
                    <Copy size={13} className={isCopiedCommand ? 'text-emerald-500' : ''} />
                    <span>{isCopiedCommand ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="p-3 bg-surface-2 rounded-xl font-mono text-[11px] text-text-secondary border border-border/80 overflow-x-auto no-scrollbar">
                  <code>$ {terminalCommand}</code>
                </div>
              </div>

              {cloneError && (
                <InlineErrorCard
                  title="Clone Operation Failed"
                  message={cloneError}
                  onRetry={handleStartClone}
                  compact
                />
              )}

              {/* ACTION BUTTON */}
              <button
                type="button"
                onClick={handleStartClone}
                disabled={cloneState === 'cloning'}
                className="w-full h-12 bg-text-primary hover:opacity-90 text-background rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-[0.99] cursor-pointer disabled:opacity-50"
              >
                <HardDrive size={16} />
                <span>Clone into Device Workspace</span>
              </button>
            </div>
          )}

          {/* ================= TAB 2: EXPORT ARCHIVE ================= */}
          {activeActionTab === 'export_archive' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-surface-1 border border-border rounded-2xl p-4 shadow-xs space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary block">
                  ARCHIVE SCOPE
                </span>

                <div className="grid grid-cols-1 gap-2.5">
                  <div
                    onClick={() => setArchiveMode('latest')}
                    className={`p-3.5 rounded-xl border transition cursor-pointer ${
                      archiveMode === 'latest'
                        ? 'border-accent bg-accent/10 shadow-xs'
                        : 'border-border bg-surface-2/60 hover:bg-surface-2'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 font-bold text-xs text-text-primary">
                        <Sparkles size={14} className="text-accent" />
                        <span>Latest Snapshot (HEAD)</span>
                      </div>
                      <span className="text-[10px] font-mono text-text-tertiary font-bold">Fastest</span>
                    </div>
                    <p className="text-[11px] text-text-tertiary leading-relaxed">
                      Instant clean package of repository HEAD tree without Git history overhead.
                    </p>
                  </div>

                  <div
                    onClick={() => setArchiveMode('full')}
                    className={`p-3.5 rounded-xl border transition cursor-pointer ${
                      archiveMode === 'full'
                        ? 'border-accent bg-accent/10 shadow-xs'
                        : 'border-border bg-surface-2/60 hover:bg-surface-2'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 font-bold text-xs text-text-primary">
                        <Archive size={14} className="text-accent" />
                        <span>Full Repository Package</span>
                      </div>
                      <span className="text-[10px] font-mono text-text-tertiary font-bold">All Files</span>
                    </div>
                    <p className="text-[11px] text-text-tertiary leading-relaxed">
                      Complete branch archive package with all tracked workspace assets.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/80">
                  <label className="text-[11px] font-bold text-text-secondary block mb-1">
                    Target Branch
                  </label>
                  <div className="relative">
                    <GitBranch size={14} className="text-text-tertiary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={targetBranch}
                      onChange={(e) => setTargetBranch(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs font-mono bg-surface-2 border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent"
                      placeholder="main"
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDownloadArchive}
                disabled={isExportingArchive}
                className="w-full h-12 bg-text-primary hover:opacity-90 text-background rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-[0.99] cursor-pointer disabled:opacity-50"
              >
                <Download size={16} className={isExportingArchive ? 'animate-bounce' : ''} />
                <span>
                  {isExportingArchive 
                    ? 'Generating Archive...' 
                    : `Download ${archiveMode === 'latest' ? 'Snapshot' : 'Full Archive'} (.zip)`}
                </span>
              </button>
            </div>
          )}

          {/* ================= TAB 3: SELECTIVE FILE & FOLDER PICKER ================= */}
          {activeActionTab === 'selective' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-surface-1 border border-border rounded-2xl p-4 shadow-xs space-y-3">
                {/* Header with Title & Select All / Clear */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-text-primary">
                      Selective File & Folder Picker
                    </h3>
                    <p className="text-[11px] text-text-tertiary mt-0.5">
                      Select specific subtrees to package into a custom zip.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs shrink-0 pt-0.5">
                    <button
                      type="button"
                      onClick={handleSelectAllFiles}
                      className="text-accent font-bold hover:underline cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-text-tertiary">&bull;</span>
                    <button
                      type="button"
                      onClick={handleClearSelectedFiles}
                      className="text-text-tertiary hover:text-text-primary cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Filter search input */}
                <div className="relative">
                  <Search size={14} className="text-text-tertiary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={fileFilterQuery}
                    onChange={(e) => setFileFilterQuery(e.target.value)}
                    placeholder="Filter by filename or path..."
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs font-mono bg-surface-2 border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent transition"
                  />
                </div>

                {/* Nested Tree Body */}
                <div className="border border-border rounded-xl p-2 bg-surface-2/30 max-h-[360px] overflow-y-auto no-scrollbar">
                  {isGhostLoadingFiles ? (
                    <FileTreeSkeleton />
                  ) : fileTreeRoot.length > 0 ? (
                    <div className="space-y-1">
                      {fileTreeRoot.map(node => renderTreeNode(node, 0))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-text-tertiary">
                      No files matching "{fileFilterQuery}".
                    </div>
                  )}
                </div>

                {/* Selection Count Footer */}
                <div className="flex items-center justify-between text-xs font-mono text-text-secondary pt-1">
                  <span>Selected: <strong className="text-text-primary font-bold">{selectedFilePaths.size}</strong> items</span>
                  <span>Est. Size: <strong className="text-text-primary font-bold">{selectedSizeFormatted}</strong></span>
                </div>
              </div>

              {/* Action Button: Download Selected Items */}
              <button
                type="button"
                onClick={handleDownloadSelectedZip}
                disabled={isPackagingZip || selectedFilePaths.size === 0}
                className="w-full h-12 bg-text-primary hover:opacity-90 text-background rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-[0.99] cursor-pointer disabled:opacity-50"
              >
                <Download size={16} className={isPackagingZip ? 'animate-bounce' : ''} />
                <span>
                  {isPackagingZip 
                    ? 'Packaging Zip Archive...' 
                    : `Download Selected Items (${selectedFilePaths.size} files) as .zip`}
                </span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================= CLONING PROGRESS MODAL ================= */}
      <AnimatePresence>
        {cloneState === 'cloning' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm p-6 bg-surface-1 border border-border rounded-3xl shadow-2xl text-center space-y-5"
            >
              <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-border flex items-center justify-center mx-auto text-accent">
                <RefreshCw size={24} className="animate-spin text-accent" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-text-primary">
                  Cloning Repository
                </h3>
                <p className="text-xs font-mono text-text-secondary truncate">
                  {selectedRepoOwner}/{destName}
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-full h-2.5 bg-surface-2 rounded-full overflow-hidden border border-border p-0.5">
                  <motion.div
                    className="h-full bg-accent rounded-full transition-all duration-300"
                    style={{ width: `${cloneProgress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-text-tertiary">
                  <span>{progressStatusText}</span>
                  <span className="font-bold text-text-primary">{cloneProgress}%</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* ================= CLONED SUCCESS MODAL ================= */}
        {cloneState === 'success' && clonedDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm p-6 bg-surface-1 border border-border rounded-3xl shadow-2xl space-y-5"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-500">
                <CheckCircle2 size={28} />
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-text-primary">
                  Clone Complete!
                </h3>
                <p className="text-xs text-text-tertiary">
                  Repository initialized in your mobile workspace.
                </p>
              </div>

              <div className="p-4 bg-surface-2 border border-border rounded-xl space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-text-tertiary">Repository:</span>
                  <span className="font-bold text-text-primary">{clonedDetails.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-tertiary">Local Path:</span>
                  <span className="text-text-secondary truncate max-w-[180px]">{clonedDetails.localPath}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-tertiary">Head Branch:</span>
                  <span className="text-emerald-500 font-semibold">{clonedDetails.branch}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCloneState('idle');
                    handleOpenClonedRepo(clonedDetails.name, clonedDetails.owner);
                  }}
                  className="w-full h-12 bg-text-primary hover:opacity-90 text-background rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-[0.99] cursor-pointer"
                >
                  <span>Open Cloned Repository</span>
                  <ArrowRight size={15} />
                </button>

                <button
                  type="button"
                  onClick={() => setCloneState('idle')}
                  className="w-full h-10 bg-surface-2 hover:bg-surface-3 text-text-secondary font-semibold rounded-xl text-xs transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
