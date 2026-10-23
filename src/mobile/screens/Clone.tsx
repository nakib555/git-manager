import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../../AppContext';
import { 
  HardDrive, Download, Copy, Check, Terminal, FolderGit2,
  CheckCircle2, RefreshCw, Folder, ChevronRight, Search, 
  Sparkles, Archive, ArrowRight, ExternalLink, Star, 
  Clipboard, RotateCcw, ArrowLeft, GitBranch
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { InlineErrorCard } from '../components/InlineErrorCard';
import { checkDeviceRepoExists, syncDeviceRepo, registerDeviceClone, getDeviceSyncedRepos, LocalDeviceRepoSync } from '../utils/deviceSync';
import { formatRelativeTime } from '../utils/formatters';

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
    openRepo,
    navigate,
  } = useAppContext();

  // Workflow state machine: 'config' | 'cloning' | 'success'
  const [step, setStep] = useState<'config' | 'cloning' | 'success'>('config');

  // Intake source: 'url' (enter link/shorthand) vs 'repos' (pick from GitHub or on-device)
  const [intakeTab, setIntakeTab] = useState<'url' | 'repos'>('url');

  // Repository input & configuration
  const [repoUrl, setRepoUrl] = useState('https://github.com/nakib555/git-manager.git');
  const [destName, setDestName] = useState('git-manager');
  const [targetBranch, setTargetBranch] = useState('main');
  const [cloneDepth, setCloneDepth] = useState<'shallow' | 'full'>('shallow');

  // Progress simulation & status
  const [cloneProgress, setCloneProgress] = useState(0);
  const [progressStatusText, setProgressStatusText] = useState('Connecting to remote...');
  const [cloneError, setCloneError] = useState<string | null>(null);

  // Success summary details
  const [clonedDetails, setClonedDetails] = useState<{
    name: string;
    owner: string;
    localPath: string;
    branch: string;
    sha: string;
  } | null>(null);

  // Device sync & existing repo detection
  const [deviceRepo, setDeviceRepo] = useState<LocalDeviceRepoSync | null>(null);
  const [isSyncingDevice, setIsSyncingDevice] = useState(false);

  // Repositories list search & filter
  const [repoSearchQuery, setRepoSearchQuery] = useState('');
  const [isCopiedCommand, setIsCopiedCommand] = useState(false);

  // Archive export state
  const [isExportingArchive, setIsExportingArchive] = useState(false);

  // Parse repo owner and name accurately from diverse URL formats
  const parsedRepo = useMemo(() => {
    if (!repoUrl) return { owner: 'nakib555', repo: 'git-manager' };
    const clean = repoUrl.trim().replace(/\.git$/, '');

    // GitHub CLI shorthand: gh repo clone owner/repo
    if (clean.startsWith('gh repo clone ')) {
      const parts = clean.replace('gh repo clone ', '').trim().split('/');
      return { owner: parts[0] || 'nakib555', repo: parts[1] || 'git-manager' };
    }

    // SSH format: git@github.com:owner/repo
    if (clean.startsWith('git@github.com:')) {
      const parts = clean.replace('git@github.com:', '').split('/');
      return { owner: parts[0] || 'nakib555', repo: parts[1] || 'git-manager' };
    }

    // Full URL or protocol-less URL
    try {
      const urlObj = clean.startsWith('http') ? new URL(clean) : new URL(`https://${clean}`);
      const segments = urlObj.pathname.split('/').filter(Boolean);
      if (segments.length >= 2) {
        return { owner: segments[segments.length - 2], repo: segments[segments.length - 1] };
      }
    } catch (_) {}

    // Shorthand format: owner/repo
    const parts = clean.split('/').filter(Boolean);
    if (parts.length >= 2) {
      return { owner: parts[parts.length - 2], repo: parts[parts.length - 1] };
    }

    return { owner: 'nakib555', repo: clean || 'git-manager' };
  }, [repoUrl]);

  // Sync folder name automatically when repo changes (unless user explicitly edited it)
  const handleUrlChange = (newUrl: string) => {
    setRepoUrl(newUrl);
    setCloneError(null);
    const clean = newUrl.trim().replace(/\.git$/, '');
    const parts = clean.split('/').filter(Boolean);
    const lastPart = parts[parts.length - 1];
    if (lastPart && lastPart !== 'repository') {
      setDestName(lastPart);
    }
  };

  // Check if repository exists on device
  useEffect(() => {
    const existing = checkDeviceRepoExists(destName || parsedRepo.repo, parsedRepo.owner);
    setDeviceRepo(existing);
  }, [destName, parsedRepo]);

  // Aggregate user repositories and on-device workspaces
  const availableRepos: UnifiedRepoItem[] = useMemo(() => {
    const map = new Map<string, UnifiedRepoItem>();
    const synced = getDeviceSyncedRepos();

    // 1. Authenticated or cached GitHub Repos
    if (githubRepos && githubRepos.length > 0) {
      for (const repo of githubRepos) {
        const ownerLogin = (repo as any).owner?.login || githubUser?.login || 'nakib555';
        const dSync = checkDeviceRepoExists(repo.name, ownerLogin);
        map.set(repo.name.toLowerCase(), {
          name: repo.name,
          owner: ownerLogin,
          url: `https://github.com/${ownerLogin}/${repo.name}.git`,
          language: repo.language || 'TypeScript',
          stars: repo.stargazers_count || 0,
          description: repo.description || 'Repository workspace',
          isOnDevice: !!dSync,
          deviceSync: dSync,
        });
      }
    }

    // 2. Synced on-device repositories
    for (const [key, devRepo] of Object.entries(synced)) {
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
          description: `Device workspace stored at ${devRepo.localPath}`,
          isOnDevice: true,
          deviceSync: devRepo,
        });
      }
    }

    // 3. Fallback standard sample repos if empty
    if (map.size === 0) {
      const samples = [
        { name: 'git-manager', owner: 'nakib555', lang: 'TypeScript', stars: 128, desc: 'Production-grade mobile and desktop Git client' },
        { name: 'Excel-grid', owner: 'nakib555', lang: 'TypeScript', stars: 84, desc: 'High-performance interactive data grid' },
        { name: 'hyper-term', owner: 'nakib555', lang: 'Rust', stars: 92, desc: 'Fast cross-platform GPU accelerated terminal' },
        { name: 'ai-studio-mobile', owner: 'nakib555', lang: 'TypeScript', stars: 45, desc: 'Mobile-first developer tools interface' },
      ];
      for (const s of samples) {
        const dSync = checkDeviceRepoExists(s.name, s.owner);
        map.set(s.name.toLowerCase(), {
          name: s.name,
          owner: s.owner,
          url: `https://github.com/${s.owner}/${s.name}.git`,
          language: s.lang,
          stars: s.stars,
          description: s.desc,
          isOnDevice: !!dSync,
          deviceSync: dSync,
        });
      }
    }

    return Array.from(map.values());
  }, [githubRepos, githubUser]);

  // Filtered repos for the picker
  const filteredRepos = useMemo(() => {
    if (!repoSearchQuery.trim()) return availableRepos;
    const q = repoSearchQuery.toLowerCase();
    return availableRepos.filter(
      r => r.name.toLowerCase().includes(q) || r.owner.toLowerCase().includes(q) || (r.language && r.language.toLowerCase().includes(q))
    );
  }, [availableRepos, repoSearchQuery]);

  // Handle repository selection from picker
  const handleSelectFromPicker = (repo: UnifiedRepoItem) => {
    setRepoUrl(repo.url);
    setDestName(repo.name);
    setDeviceRepo(repo.deviceSync || null);
    setIntakeTab('url');
    showToast(`Loaded ${repo.name}`, 'info');
  };

  // Paste from clipboard helper
  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        handleUrlChange(text.trim());
        showToast('Pasted URL from clipboard', 'success');
      } else {
        showToast('Clipboard is empty', 'info');
      }
    } catch {
      showToast('Clipboard access unavailable', 'warning');
    }
  };

  // Execute Clone Process with Smooth Progress Simulation
  const handleStartClone = async () => {
    const cleanUrl = repoUrl.trim();
    if (!cleanUrl || cleanUrl.includes('owner/repository')) {
      showToast('Please enter a valid Git repository URL', 'warning');
      return;
    }

    setStep('cloning');
    setCloneProgress(15);
    setProgressStatusText('Connecting to remote Git host...');
    setCloneError(null);

    try {
      const finalName = destName.trim() || parsedRepo.repo || 'cloned-repo';
      const finalOwner = parsedRepo.owner || 'nakib555';

      // Step 1: Remote connection
      await new Promise(r => setTimeout(r, 350));
      setCloneProgress(45);
      setProgressStatusText('Fetching repository tree and commit history...');

      // Step 2: Invoke Context Clone Method
      await cloneRepository({
        url: cleanUrl,
        destFolder: finalName,
        branch: targetBranch || 'main',
        shallow: cloneDepth === 'shallow',
        submodules: false,
      });

      // Step 3: Register in device sync
      setCloneProgress(80);
      setProgressStatusText('Unpacking files and configuring local workspace...');
      await new Promise(r => setTimeout(r, 300));

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
      await new Promise(r => setTimeout(r, 250));

      setClonedDetails({
        name: finalName,
        owner: finalOwner,
        localPath: `/Documents/Projects/${finalName}`,
        branch: targetBranch || 'main',
        sha: registered.syncedSha,
      });

      setStep('success');
      showToast(`Cloned ${finalName} successfully!`, 'success');
    } catch (err: any) {
      console.error('Clone failed:', err);
      const msg = err.message || 'Failed to clone repository. Check URL and connection.';
      setCloneError(msg);
      setStep('config');
      showToast(`Clone error: ${msg}`, 'error');
    }
  };

  // In-Device Sync for already existing repositories
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

  // Open the cloned repository and navigate immediately
  const handleOpenClonedRepo = (repoName: string, repoOwner: string) => {
    openRepo(repoName, repoOwner);
    navigate('commits');
    showToast(`Opened ${repoName}`, 'success');
  };

  // Download ZIP archive directly
  const handleDownloadZipArchive = async () => {
    if (!parsedRepo.owner || !parsedRepo.repo || parsedRepo.repo === 'repository') {
      showToast('Please enter a valid repository URL first', 'warning');
      return;
    }
    setIsExportingArchive(true);
    try {
      const tokenParam = githubToken ? `&token=${encodeURIComponent(githubToken)}` : '';
      const downloadUrl = `/api/github/download?owner=${encodeURIComponent(parsedRepo.owner)}&repo=${encodeURIComponent(parsedRepo.repo)}&ref=${encodeURIComponent(targetBranch || 'main')}${tokenParam}`;

      const res = await fetch(downloadUrl);
      if (!res.ok) {
        throw new Error(`Download failed with status ${res.status}`);
      }
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${parsedRepo.repo}-${targetBranch || 'main'}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      showToast(`Downloaded ${parsedRepo.repo}.zip snapshot!`, 'success');
    } catch (err: any) {
      showToast(`Archive error: ${err.message || 'Download failed'}`, 'error');
    } finally {
      setIsExportingArchive(false);
    }
  };

  // Copy terminal command
  const generatedCliCmd = `git clone${cloneDepth === 'shallow' ? ' --depth 1' : ''} ${repoUrl} ${destName}`;
  const copyCliCommand = () => {
    navigator.clipboard.writeText(generatedCliCmd);
    setIsCopiedCommand(true);
    showToast('Copied git clone command to clipboard', 'success');
    setTimeout(() => setIsCopiedCommand(false), 2000);
  };

  return (
    <div className="px-4 py-4 space-y-4 pb-16 max-w-[560px] mx-auto select-none">
      {/* 1. Header Section */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
            <HardDrive size={20} className="text-accent" />
            <span>Clone Repository</span>
          </h1>
          {deviceRepo && step === 'config' && (
            <span className="text-[11px] font-mono text-emerald-500 font-semibold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/25">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Saved Locally</span>
            </span>
          )}
        </div>
        <p className="text-xs text-text-tertiary">
          Clone any public or private Git repository to your mobile device workspace.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {/* ================= STEP 1: CONFIGURATION ================= */}
        {step === 'config' && (
          <motion.div
            key="clone_step_config"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
            {/* Top Intake Mode Switcher: "Clone via URL" vs "My Cloud Repos" */}
            <div className="bg-surface-2 p-1 rounded-2xl border border-border">
              <div className="grid grid-cols-2 gap-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setIntakeTab('url')}
                  className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    intakeTab === 'url'
                      ? 'bg-surface-1 text-text-primary shadow-xs font-bold'
                      : 'text-text-tertiary hover:text-text-primary'
                  }`}
                >
                  <Terminal size={14} className={intakeTab === 'url' ? 'text-accent' : ''} />
                  <span>Direct Git URL</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIntakeTab('repos')}
                  className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    intakeTab === 'repos'
                      ? 'bg-surface-1 text-text-primary shadow-xs font-bold'
                      : 'text-text-tertiary hover:text-text-primary'
                  }`}
                >
                  <FolderGit2 size={14} className={intakeTab === 'repos' ? 'text-accent' : ''} />
                  <span>My Cloud Repos ({availableRepos.length})</span>
                </button>
              </div>
            </div>

            {/* TAB CONTENT: PICK FROM EXISTING CLOUD REPOS */}
            {intakeTab === 'repos' ? (
              <div className="space-y-3">
                <div className="relative">
                  <Search size={14} className="text-text-tertiary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={repoSearchQuery}
                    onChange={(e) => setRepoSearchQuery(e.target.value)}
                    placeholder="Filter repositories..."
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs font-medium bg-surface-1 border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent transition"
                  />
                </div>

                <div className="space-y-2 max-h-[360px] overflow-y-auto no-scrollbar">
                  {filteredRepos.length > 0 ? (
                    filteredRepos.map((repo) => (
                      <div
                        key={repo.name}
                        onClick={() => handleSelectFromPicker(repo)}
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
                          className="px-2.5 py-1 rounded-lg bg-surface-2 group-hover:bg-accent group-hover:text-white text-text-secondary text-[11px] font-semibold transition shrink-0 cursor-pointer"
                        >
                          Select
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center bg-surface-1 border border-border rounded-xl">
                      <p className="text-xs text-text-tertiary">No matching repositories found.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* TAB CONTENT: DIRECT GIT URL INPUT */
              <div className="space-y-4">
                {/* On-Device Repo Banner if already downloaded */}
                {deviceRepo && (
                  <div className="p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-text-primary truncate">
                            Repository Saved on This Device
                          </h4>
                          <p className="text-[11px] text-text-tertiary font-mono truncate">
                            {deviceRepo.localPath}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleSyncExisting}
                        disabled={isSyncingDevice}
                        className="px-2.5 py-1 text-[11px] rounded-lg bg-emerald-500 text-black font-bold flex items-center gap-1 hover:bg-emerald-400 transition cursor-pointer disabled:opacity-50 shrink-0"
                      >
                        <RefreshCw size={11} className={isSyncingDevice ? 'animate-spin' : ''} />
                        <span>{isSyncingDevice ? 'Syncing...' : 'Sync'}</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-emerald-500/20 text-[11px]">
                      <span className="text-text-tertiary">
                        Synced {formatRelativeTime(deviceRepo.lastSyncedAt)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenClonedRepo(deviceRepo.repoName, deviceRepo.repoOwner)}
                        className="text-emerald-500 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Open Workspace</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Primary URL Input Card */}
                <div className="bg-surface-1 border border-border rounded-2xl p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-text-secondary">
                      Repository URL
                    </label>
                    <button
                      type="button"
                      onClick={handlePasteClipboard}
                      className="text-[11px] font-semibold text-accent hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Clipboard size={12} />
                      <span>Paste from Clipboard</span>
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={repoUrl}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      placeholder="https://github.com/owner/repository.git"
                      className="w-full px-3.5 py-3 text-xs font-mono bg-surface-2 border border-border focus:border-accent focus:bg-surface-1 rounded-xl text-text-primary focus:outline-none transition pr-10"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-text-tertiary uppercase">
                      GIT
                    </div>
                  </div>

                  {/* Detected Repository Pill */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-text-tertiary pt-0.5">
                    <span>Target: <strong className="text-text-primary">{parsedRepo.owner}/{parsedRepo.repo}</strong></span>
                    <span>Branch: <strong className="text-text-primary">{targetBranch}</strong></span>
                  </div>

                  {/* Quick Preset Chips */}
                  <div className="pt-1 border-t border-border/70">
                    <span className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider block mb-1.5">
                      Quick Preset Repositories
                    </span>
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                      {[
                        { name: 'git-manager', url: 'https://github.com/nakib555/git-manager.git' },
                        { name: 'Excel-grid', url: 'https://github.com/nakib555/Excel-grid.git' },
                        { name: 'hyper-term', url: 'https://github.com/nakib555/hyper-term.git' },
                        { name: 'react', url: 'https://github.com/facebook/react.git' },
                      ].map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => handleUrlChange(preset.url)}
                          className="px-2.5 py-1 text-[11px] font-mono bg-surface-2 hover:bg-surface-3 rounded-lg border border-border/80 text-text-secondary hover:text-text-primary transition shrink-0 cursor-pointer"
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Workspace Configuration Card */}
                <div className="bg-surface-1 border border-border rounded-2xl p-4 shadow-xs space-y-3">
                  <span className="text-xs font-bold text-text-secondary block">
                    Workspace Options
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
                        placeholder="project-name"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-text-tertiary mb-1">
                        Target Branch
                      </label>
                      <input
                        type="text"
                        value={targetBranch}
                        onChange={(e) => setTargetBranch(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono bg-surface-2 border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent"
                        placeholder="main"
                      />
                    </div>
                  </div>

                  {/* Clone Depth Segmented Toggle */}
                  <div className="pt-1">
                    <label className="block text-[11px] text-text-tertiary mb-1.5">
                      Commit History Depth
                    </label>
                    <div className="grid grid-cols-2 gap-1 bg-surface-2 p-1 rounded-xl border border-border text-xs">
                      <button
                        type="button"
                        onClick={() => setCloneDepth('shallow')}
                        className={`py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                          cloneDepth === 'shallow'
                            ? 'bg-surface-1 text-text-primary shadow-xs font-bold'
                            : 'text-text-tertiary hover:text-text-primary'
                        }`}
                      >
                        Shallow (Fastest, Depth 1)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCloneDepth('full')}
                        className={`py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                          cloneDepth === 'full'
                            ? 'bg-surface-1 text-text-primary shadow-xs font-bold'
                            : 'text-text-tertiary hover:text-text-primary'
                        }`}
                      >
                        Full History Lineage
                      </button>
                    </div>
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

                {/* Primary Action Button: 48px natural thumb zone */}
                <button
                  type="button"
                  onClick={handleStartClone}
                  className="w-full h-12 bg-text-primary hover:opacity-90 text-background rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-[0.99] cursor-pointer"
                >
                  <HardDrive size={16} />
                  <span>{deviceRepo ? 'Re-Clone & Overwrite Workspace' : 'Clone Repository to Device'}</span>
                </button>

                {/* Secondary Option: Export ZIP Archive */}
                <div className="pt-2 flex items-center justify-between text-xs text-text-tertiary px-1">
                  <span>Need just the code package?</span>
                  <button
                    type="button"
                    onClick={handleDownloadZipArchive}
                    disabled={isExportingArchive}
                    className="font-semibold text-accent hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <Download size={13} />
                    <span>{isExportingArchive ? 'Preparing ZIP...' : 'Download ZIP Archive'}</span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ================= STEP 2: CLONING LIVE PROGRESS ================= */}
        {step === 'cloning' && (
          <motion.div
            key="clone_step_progress"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="p-6 bg-surface-1 border border-border rounded-3xl shadow-sm text-center space-y-5"
          >
            <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/25 flex items-center justify-center mx-auto text-accent">
              <RefreshCw size={26} className="animate-spin text-accent" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-text-primary">
                Cloning Repository
              </h3>
              <p className="text-xs font-mono text-text-secondary truncate">
                {parsedRepo.owner}/{destName || parsedRepo.repo}
              </p>
            </div>

            {/* Visual Progress Bar */}
            <div className="space-y-2">
              <div className="w-full h-2.5 bg-surface-2 rounded-full overflow-hidden border border-border/80 p-0.5">
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

            <div className="p-3 bg-surface-2/60 border border-border/60 rounded-xl text-[11px] text-text-tertiary text-left space-y-1 font-mono">
              <p>&bull; Target: /Documents/Projects/{destName}</p>
              <p>&bull; Branch: {targetBranch} ({cloneDepth === 'shallow' ? 'Depth 1' : 'Full history'})</p>
            </div>
          </motion.div>
        )}

        {/* ================= STEP 3: SUCCESS WITH OPEN REPO ACTION ================= */}
        {step === 'success' && clonedDetails && (
          <motion.div
            key="clone_step_success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="p-6 bg-surface-1 border border-border rounded-3xl shadow-sm space-y-5"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-500">
              <CheckCircle2 size={28} />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-text-primary">
                Clone Complete!
              </h3>
              <p className="text-xs text-text-tertiary">
                Repository is initialized and ready in your mobile workspace.
              </p>
            </div>

            {/* Cloned Details Card */}
            <div className="p-4 bg-surface-2 border border-border rounded-2xl space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center">
                <span className="text-text-tertiary">Repository:</span>
                <span className="font-bold text-text-primary">{clonedDetails.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-tertiary">Local Path:</span>
                <span className="text-text-secondary truncate max-w-[200px]">{clonedDetails.localPath}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-tertiary">Head Branch:</span>
                <span className="text-emerald-500 font-semibold">{clonedDetails.branch}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-tertiary">Synced SHA:</span>
                <span className="text-text-primary">{clonedDetails.sha}</span>
              </div>
            </div>

            {/* Working Action Triggers */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => handleOpenClonedRepo(clonedDetails.name, clonedDetails.owner)}
                className="w-full h-12 bg-accent hover:opacity-90 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.99] cursor-pointer"
              >
                <span>Open Cloned Repository</span>
                <ArrowRight size={15} />
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('config');
                  setRepoUrl('');
                  setDestName('');
                }}
                className="w-full h-10 bg-surface-2 hover:bg-surface-3 text-text-secondary font-semibold rounded-xl text-xs transition cursor-pointer"
              >
                Clone Another Repository
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
