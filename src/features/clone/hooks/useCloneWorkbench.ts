import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useAppContext } from '../../../AppContext';
import { CloneProtocol, CloneStep, CloneProgressInfo, UnifiedRepoItem, CloneTab } from '../types';
import { parseGitUrl, formatGitUrl } from '../utils/gitUrlParser';
import { executeCloneWorkflow } from '../utils/cloneWorkflow';
import { fetchRemoteBranches } from '../utils/cloneService';

export interface UseCloneWorkbenchOptions {
  onCloseModal?: () => void;
  isModal?: boolean;
}

export function useCloneWorkbench(options: UseCloneWorkbenchOptions = {}) {
  const {
    cloneRepository,
    recentClones,
    openRepo,
    currentRepo,
    currentRepoOwner,
    githubToken,
    githubRepos,
    showToast,
    navigate,
  } = useAppContext();

  const [activeTab, setActiveTab] = useState<CloneTab>('clone_archive');
  const [archiveFormat, setArchiveFormat] = useState<'zip' | 'tar'>('zip');
  const [isDownloadingArchive, setIsDownloadingArchive] = useState(false);
  const [intakeMode, setIntakeMode] = useState<'url' | 'browse'>('url');
  const [browseCategory, setBrowseCategory] = useState<'user' | 'recent' | 'starters'>('user');

  // Default initial URL (including query param from mobile QR scan)
  const initialRepoName = currentRepo || 'git-manager';
  const initialRepoOwner = currentRepoOwner || 'nakib555';
  const queryCloneUrl = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('cloneUrl') : null;
  const [url, setUrl] = useState(queryCloneUrl || `https://github.com/${initialRepoOwner}/${initialRepoName}.git`);
  const [urlMode, setUrlMode] = useState<CloneProtocol>('https');

  // Destination path state - track whether user manually customized destination
  const [dest, setDest] = useState(options.isModal ? `/Documents/Projects/${initialRepoName}` : `/Documents/Projects/${initialRepoName}`);
  const hasUserCustomizedDest = useRef(false);

  const [branch, setBranch] = useState('main');
  const [availableBranches, setAvailableBranches] = useState<string[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(true);

  const [depth, setDepth] = useState<'full' | 'shallow'>('shallow');
  const [step, setStep] = useState<CloneStep>('config');
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [repoSearch, setRepoSearch] = useState('');
  const [dirHandle, setDirHandle] = useState<any>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const [progressInfo, setProgressInfo] = useState<CloneProgressInfo>({
    pct: 0,
    activity: 'Initializing clone request...',
    speed: '0 MB/s',
    timeRemaining: 'Calculating...',
    receivedObjects: { current: 0, total: 100 },
    resolvingDeltas: false,
  });

  // Parsed repository info
  const parsedRepoInfo = useMemo(() => {
    return parseGitUrl(url, { owner: initialRepoOwner, repo: initialRepoName });
  }, [url, initialRepoOwner, initialRepoName]);

  // Synchronize destination path when repo changes, unless user typed custom destination
  useEffect(() => {
    if (!hasUserCustomizedDest.current && parsedRepoInfo.repo) {
      setDest(`/Documents/Projects/${parsedRepoInfo.repo}`);
    }
  }, [parsedRepoInfo.repo]);

  // Fetch remote branches when owner and repo change
  useEffect(() => {
    let isCancelled = false;
    const fetchBranches = async () => {
      if (!parsedRepoInfo.owner || !parsedRepoInfo.repo) {
        setIsLoadingBranches(false);
        return;
      }
      setIsLoadingBranches(true);
      try {
        const branches = await fetchRemoteBranches(parsedRepoInfo.owner, parsedRepoInfo.repo, githubToken);
        if (!isCancelled) {
          if (branches.length > 0) {
            setAvailableBranches(branches);
            if (!branches.includes(branch)) {
              setBranch(branches.includes('main') ? 'main' : branches[0]);
            }
          } else {
            // Check if current user repo list has this repo's default branch
            const matchedRepo: any = (githubRepos || []).find(
              (r: any) => r.name?.toLowerCase() === parsedRepoInfo.repo?.toLowerCase()
            );
            if (matchedRepo?.default_branch) {
              setAvailableBranches([matchedRepo.default_branch]);
              setBranch(matchedRepo.default_branch);
            } else {
              setAvailableBranches([]);
            }
          }
        }
      } catch (_) {
        if (!isCancelled) setAvailableBranches([]);
      } finally {
        if (!isCancelled) setIsLoadingBranches(false);
      }
    };

    setIsLoadingBranches(true);
    const timer = setTimeout(fetchBranches, 250);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [parsedRepoInfo.owner, parsedRepoInfo.repo, githubToken, githubRepos]);

  // Handle switching protocol tab (HTTPS <-> SSH <-> CLI)
  const handleProtocolChange = useCallback((mode: CloneProtocol) => {
    setUrlMode(mode);
    const newFormattedUrl = formatGitUrl(parsedRepoInfo.owner, parsedRepoInfo.repo, mode, parsedRepoInfo.host);
    setUrl(newFormattedUrl);
  }, [parsedRepoInfo]);

  // Handle URL change from text input
  const handleUrlChange = useCallback((val: string) => {
    setUrl(val);
    const parsed = parseGitUrl(val, { owner: initialRepoOwner, repo: initialRepoName });
    if (parsed.protocol !== urlMode && (val.includes('git@') || val.startsWith('gh repo clone') || val.startsWith('git clone'))) {
      setUrlMode(parsed.protocol);
    }
  }, [urlMode, initialRepoOwner, initialRepoName]);

  // Handle Destination Manual Change
  const handleDestChange = useCallback((val: string) => {
    hasUserCustomizedDest.current = true;
    setDest(val);
  }, []);

  // Directory picker using window.showDirectoryPicker
  const handlePickDirectory = useCallback(async () => {
    try {
      if ('showDirectoryPicker' in window) {
        const handle = await (window as any).showDirectoryPicker();
        if (handle && handle.name) {
          setDirHandle(handle);
          hasUserCustomizedDest.current = true;
          setDest(`~/Local/${handle.name}/${parsedRepoInfo.repo}`);
          showToast(`Selected destination: ${handle.name}`, 'info');
        }
      } else {
        // Fallback quick prompt or preset
        const custom = window.prompt('Enter target filesystem destination directory:', dest);
        if (custom) {
          handleDestChange(custom);
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        showToast('Directory picker cancelled or unavailable', 'info');
      }
    }
  }, [dest, parsedRepoInfo.repo, handleDestChange, showToast]);

  // Repository Browse Lists
  const myGitHubRepos: UnifiedRepoItem[] = useMemo(() => {
    return (githubRepos || []).map((r: any) => ({
      name: r.name,
      owner: r.owner?.login || initialRepoOwner,
      url: r.html_url ? `${r.html_url}.git` : `https://github.com/${r.owner?.login || initialRepoOwner}/${r.name}.git`,
      language: r.language || 'TypeScript',
      stars: r.stargazers_count ?? 0,
      description: r.description || undefined,
      isOnDevice: true,
    })).filter(r => 
      r.name.toLowerCase().includes(repoSearch.toLowerCase()) || 
      r.owner.toLowerCase().includes(repoSearch.toLowerCase())
    );
  }, [githubRepos, initialRepoOwner, repoSearch]);

  const recentList: UnifiedRepoItem[] = useMemo(() => {
    return (recentClones || []).map((r: any) => ({
      name: r.name,
      owner: r.owner || (r.url ? r.url.replace(/\.git$/, '').split('/').slice(-2)[0] : initialRepoOwner),
      url: r.url || `https://github.com/${initialRepoOwner}/${r.name}.git`,
      language: r.lang || 'TypeScript',
      stars: r.stars || 42,
      isOnDevice: true,
    })).filter(r => 
      r.name.toLowerCase().includes(repoSearch.toLowerCase()) || 
      (r.owner && r.owner.toLowerCase().includes(repoSearch.toLowerCase()))
    );
  }, [recentClones, initialRepoOwner, repoSearch]);

  const starterRepos: UnifiedRepoItem[] = useMemo(() => [
    {
      name: 'git-manager',
      owner: 'nakib555',
      url: 'https://github.com/nakib555/git-manager.git',
      language: 'TypeScript',
      stars: 128,
      description: 'Clean Developer Studio Git manager and repository activity workbench.',
      isOnDevice: true,
    },
    {
      name: 'react',
      owner: 'facebook',
      url: 'https://github.com/facebook/react.git',
      language: 'JavaScript',
      stars: 228000,
      description: 'The library for web and native user interfaces.',
      isOnDevice: false,
    },
    {
      name: 'vscode',
      owner: 'microsoft',
      url: 'https://github.com/microsoft/vscode.git',
      language: 'TypeScript',
      stars: 165000,
      description: 'Visual Studio Code open source repository.',
      isOnDevice: false,
    },
    {
      name: 'next.js',
      owner: 'vercel',
      url: 'https://github.com/vercel/next.js.git',
      language: 'JavaScript',
      stars: 126000,
      description: 'The React Framework for the Web.',
      isOnDevice: false,
    },
  ].filter(r => 
    r.name.toLowerCase().includes(repoSearch.toLowerCase()) || 
    r.owner.toLowerCase().includes(repoSearch.toLowerCase())
  ), [repoSearch]);

  const activeBrowseList = useMemo(() => {
    if (browseCategory === 'user') {
      return myGitHubRepos.length > 0 ? myGitHubRepos : starterRepos;
    }
    if (browseCategory === 'recent') {
      return recentList;
    }
    return starterRepos;
  }, [browseCategory, myGitHubRepos, recentList, starterRepos]);

  // Selecting a repo from browse section
  const handleSelectRepo = useCallback((repoItem: UnifiedRepoItem) => {
    const formatted = formatGitUrl(repoItem.owner, repoItem.name, urlMode);
    setUrl(formatted);
    hasUserCustomizedDest.current = false;
    setDest(`/Documents/Projects/${repoItem.name}`);
    setIntakeMode('url');
    showToast(`Loaded ${repoItem.owner}/${repoItem.name}`, 'info');
  }, [urlMode, showToast]);

  // Start Clone
  const handleStartClone = useCallback(async () => {
    if (!url.trim()) return;
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setStep('progress');
    try {
      await executeCloneWorkflow({
        url,
        dest,
        branch,
        depth,
        owner: parsedRepoInfo.owner,
        repo: parsedRepoInfo.repo,
        token: githubToken,
        dirHandle,
        signal: controller.signal,
        setProgressInfo,
        cloneRepository,
      });
      setTimeout(() => setStep('success'), 400);
    } catch (err: any) {
      if (err.name === 'AbortError' || controller.signal.aborted) {
        showToast('Clone cancelled', 'info');
      } else {
        showToast(`Error cloning repo '${parsedRepoInfo.owner}/${parsedRepoInfo.repo}': ${err.message || 'Clone failed'}`, 'error');
      }
      setStep('config');
    } finally {
      abortControllerRef.current = null;
    }
  }, [url, dest, branch, depth, parsedRepoInfo, githubToken, dirHandle, cloneRepository, showToast]);

  // Cancel Clone
  const handleCancelClone = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setStep('config');
    showToast('Clone operation cancelled', 'info');
  }, [showToast]);

  // Open in Workspace Navigation
  const handleOpenWorkspace = useCallback(() => {
    openRepo(parsedRepoInfo.repo, parsedRepoInfo.owner);
    if (navigate) {
      navigate('files');
    }
    if (options.onCloseModal) {
      options.onCloseModal();
    }
  }, [parsedRepoInfo, openRepo, navigate, options]);

  // Handle Complete Archive Download
  const handleDownloadArchive = useCallback(async () => {
    const repoOwner = parsedRepoInfo.owner || initialRepoOwner;
    const repoName = parsedRepoInfo.repo || initialRepoName;
    const ref = branch.trim() || 'main';

    setIsDownloadingArchive(true);
    try {
      const tokenParam = githubToken ? `&token=${encodeURIComponent(githubToken)}` : '';
      const downloadUrl = `/api/github/download?owner=${encodeURIComponent(repoOwner)}&repo=${encodeURIComponent(repoName)}&ref=${encodeURIComponent(ref)}${tokenParam}`;

      let res: Response | null = null;
      try {
        res = await fetch(downloadUrl);
      } catch (_) {
        res = null;
      }

      if (!res || !res.ok) {
        // Fallback to direct public GitHub archive URL
        const ext = archiveFormat === 'tar' ? 'tar.gz' : 'zip';
        const directUrl = `https://github.com/${repoOwner}/${repoName}/archive/refs/heads/${ref}.${ext}`;
        const link = document.createElement('a');
        link.href = directUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.download = `${repoName}-${ref}.${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast(`Started direct archive download for ${repoName} (${ref})`, 'success');
        return;
      }

      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${repoName}-${ref}.${archiveFormat === 'tar' ? 'tar.gz' : 'zip'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      showToast(`Archive ${repoName}-${ref}.${archiveFormat === 'tar' ? 'tar.gz' : 'zip'} downloaded!`, 'success');
    } catch (err: any) {
      showToast(`Download error: ${err.message || 'Failed to download archive'}`, 'error');
    } finally {
      setIsDownloadingArchive(false);
    }
  }, [parsedRepoInfo, initialRepoOwner, initialRepoName, branch, archiveFormat, githubToken, showToast]);

  return {
    activeTab,
    setActiveTab,
    archiveFormat,
    setArchiveFormat,
    isDownloadingArchive,
    handleDownloadArchive,
    intakeMode,
    setIntakeMode,
    browseCategory,
    setBrowseCategory,
    url,
    urlMode,
    dest,
    branch,
    setBranch,
    availableBranches,
    isLoadingBranches,
    depth,
    setDepth,
    step,
    setStep,
    isQrOpen,
    setIsQrOpen,
    repoSearch,
    setRepoSearch,
    parsedRepoInfo,
    progressInfo,
    activeBrowseList,
    myGitHubReposCount: myGitHubRepos.length,
    recentCount: recentList.length,
    handleProtocolChange,
    handleUrlChange,
    handleDestChange,
    handlePickDirectory,
    handleSelectRepo,
    handleStartClone,
    handleCancelClone,
    handleOpenWorkspace,
  };
}
