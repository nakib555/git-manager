import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext, getLocalRepoDetails } from '../../AppContext';
import { 
  X, Upload, FileArchive, CheckCircle, AlertCircle, ArrowRight, 
  ArrowLeft, GitCommit, GitPullRequest, GitBranch, Sparkles, 
  RefreshCw, Check, CheckSquare, Square, ExternalLink, HardDrive, 
  Filter, FileCode, Layers, ShieldCheck, ChevronRight, Sliders, AlertTriangle
} from 'lucide-react';
import { 
  parseZipArchive, compareZipWithRepo, commitSyncToGitHub, 
  ZipExtractedFile, DiffFileItem, TreeDiffResult, FileChangeStatus 
} from '../../mobile/utils/zipSyncEngine';
import { analyzeZipRoots, RootCandidate, DirectoryNode } from '../../mobile/utils/zipAutoDetect';
import { VisualRootTreePicker } from './VisualRootTreePicker';
import { SyncConflictResolver, ConflictResolution } from './SyncConflictResolver';
import { MonacoDiffViewer } from './MonacoDiffViewer';
import { RepoReferenceTree } from './RepoReferenceTree';
import { fetchFileContentSafe } from '../../mobile/utils/gitApi';

interface ZipSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ZipSyncModal: React.FC<ZipSyncModalProps> = ({ isOpen, onClose }) => {
  const { 
    currentRepo, 
    currentRepoOwner, 
    currentBranch, 
    activeFiles, 
    githubToken, 
    githubUser, 
    theme, 
    showToast,
    refreshData,
    createLocalCommit,
    createLocalBranch,
    createLocalPR,
  } = useAppContext();

  // Wizard Step: 1 = Upload & Root Alignment, 2 = Conflict Resolver & Monaco Diff, 3 = Git Commit & PR
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Upload & Zip Data
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [isParsingZip, setIsParsingZip] = useState(false);
  const [zipExtractedFiles, setZipExtractedFiles] = useState<ZipExtractedFile[]>([]);
  const [rawZipPaths, setRawZipPaths] = useState<string[]>([]);
  const [samplePath, setSamplePath] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Root Auto-Detection State
  const [suggestedRoot, setSuggestedRoot] = useState<string>('');
  const [activeRoot, setActiveRoot] = useState<string>('');
  const [rootCandidates, setRootCandidates] = useState<RootCandidate[]>([]);
  const [directoryTree, setDirectoryTree] = useState<DirectoryNode>({ name: 'Root', fullPath: '', children: [] });

  // Diff & Conflict Resolutions State
  const [isComparing, setIsComparing] = useState(false);
  const [diffItems, setDiffItems] = useState<DiffFileItem[]>([]);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [resolutions, setResolutions] = useState<Map<string, ConflictResolution>>(new Map());

  // Mobile Layout Specific States
  const [activeMobileDiffFile, setActiveMobileDiffFile] = useState<DiffFileItem | null>(null);
  const [isRepoTreeExpandedMobile, setIsRepoTreeExpandedMobile] = useState<boolean>(false);

  // Commit & PR State
  const [commitMessage, setCommitMessage] = useState('Sync updates from AI Studio package');
  const [commitMode, setCommitMode] = useState<'direct' | 'pr'>('direct');
  const [newBranchName, setNewBranchName] = useState(`sync-aistudio-${Date.now().toString(36).slice(-4)}`);
  const [prTitle, setPrTitle] = useState('Sync updates from AI Studio package');
  const [prBody, setPrBody] = useState('This pull request synchronizes updated code files exported from AI Studio.');
  
  // Progress & Execution State
  const [isCommitting, setIsCommitting] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [commitSuccess, setCommitSuccess] = useState<{
    commitSha: string;
    branchName: string;
    prNumber?: number;
    prUrl?: string;
    htmlUrl: string;
  } | null>(null);
  const [commitError, setCommitError] = useState<string | null>(null);

  // Reset state whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setZipFile(null);
      setIsParsingZip(false);
      setZipExtractedFiles([]);
      setRawZipPaths([]);
      setSamplePath('');
      setSuggestedRoot('');
      setActiveRoot('');
      setRootCandidates([]);
      setDiffItems([]);
      setSelectedFilePath(null);
      setResolutions(new Map());
      setActiveMobileDiffFile(null);
      setIsRepoTreeExpandedMobile(false);
      setIsCommitting(false);
      setProgressStatus('');
      setCommitSuccess(null);
      setCommitError(null);
    }
  }, [isOpen]);

  // Map of normalized path -> ZipExtractedFile
  const zipFileMap = useMemo(() => {
    const map = new Map<string, ZipExtractedFile>();
    for (const zf of zipExtractedFiles) {
      let aligned = zf.originalPath;
      if (activeRoot && aligned.startsWith(activeRoot)) {
        aligned = aligned.slice(activeRoot.length);
      }
      aligned = aligned.replace(/^[\\\/]+/, '').replace(/\\/g, '/');
      if (aligned) {
        map.set(aligned, zf);
      }
    }
    return map;
  }, [zipExtractedFiles, activeRoot]);

  // Handle uploaded ZIP
  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.zip') && file.type !== 'application/zip') {
      showToast('Please upload a valid .zip archive.', 'warning');
      return;
    }

    setZipFile(file);
    setIsParsingZip(true);
    setCommitSuccess(null);
    setCommitError(null);

    try {
      const parsed = await parseZipArchive(file);
      setZipExtractedFiles(parsed.files);
      setRawZipPaths(parsed.rawPaths);
      setSamplePath(parsed.rawPaths.find(p => !p.endsWith('/')) || '');

      // Analyze project root candidates
      const rootAnalysis = analyzeZipRoots(parsed.rawPaths);
      setSuggestedRoot(rootAnalysis.suggestedRoot);
      setActiveRoot(rootAnalysis.suggestedRoot);
      setRootCandidates(rootAnalysis.candidates);
      setDirectoryTree(rootAnalysis.directoryTree);

      showToast(`ZIP unpacked: ${parsed.files.length} files detected.`, 'info');

      // Compare using detected root
      await runComparison(parsed.files, rootAnalysis.suggestedRoot);
    } catch (err: any) {
      console.error('Failed to parse ZIP archive:', err);
      showToast(`Failed to parse ZIP: ${err.message || err}`, 'error');
    } finally {
      setIsParsingZip(false);
    }
  };

  // Run or re-run comparison
  const runComparison = async (files: ZipExtractedFile[], rootPrefix: string) => {
    setIsComparing(true);
    try {
      const result = await compareZipWithRepo({
        zipFiles: files,
        repoFiles: activeFiles,
        rootPrefixToStrip: rootPrefix,
        fetchOldContent: async (path: string) => {
          return await fetchFileContentSafe({
            filePath: path,
            repoName: currentRepo || '',
            owner: currentRepoOwner,
            branch: currentBranch,
            token: githubToken,
          });
        },
      });

      setDiffItems(result.files);

      // Initialize default conflict resolutions
      const defaultResolutions = new Map<string, ConflictResolution>();
      for (const item of result.files) {
        if (item.status === 'modified' || item.status === 'added') {
          defaultResolutions.set(item.path, 'take_zip');
        } else if (item.status === 'removed') {
          // Default to restore for safety so accidental deletions don't occur
          defaultResolutions.set(item.path, 'restore');
        }
      }
      setResolutions(defaultResolutions);

      const firstChanged = result.files.find(f => f.status === 'modified' || f.status === 'added') || result.files[0];
      setSelectedFilePath(firstChanged?.path || null);
    } catch (err: any) {
      console.error('Error comparing ZIP with repository:', err);
      showToast('Error comparing files against repository.', 'error');
    } finally {
      setIsComparing(false);
    }
  };

  const handleRootChange = async (newRoot: string) => {
    setActiveRoot(newRoot);
    if (zipExtractedFiles.length > 0) {
      await runComparison(zipExtractedFiles, newRoot);
    }
  };

  const handleSetResolution = (path: string, resolution: ConflictResolution) => {
    setResolutions(prev => {
      const next = new Map(prev);
      next.set(path, resolution);
      return next;
    });
  };

  const handleBulkResolve = (type: 'all_zip' | 'all_original' | 'all_restore' | 'all_delete') => {
    setResolutions(prev => {
      const next = new Map(prev);
      for (const item of diffItems) {
        if (type === 'all_zip' && (item.status === 'modified' || item.status === 'added')) {
          next.set(item.path, 'take_zip');
        } else if (type === 'all_original' && (item.status === 'modified' || item.status === 'added')) {
          next.set(item.path, 'keep_original');
        } else if (type === 'all_restore' && item.status === 'removed') {
          next.set(item.path, 'restore');
        } else if (type === 'all_delete' && item.status === 'removed') {
          next.set(item.path, 'delete');
        }
      }
      return next;
    });
    showToast(`Applied bulk resolution for all matching files.`, 'info');
  };

  // Active diff item selected
  const activeDiffItem = useMemo(() => {
    return diffItems.find(f => f.path === selectedFilePath) || null;
  }, [diffItems, selectedFilePath]);

  // Counts of changes taking effect
  const summaryCounts = useMemo(() => {
    let toUpload = 0;
    let toDelete = 0;
    let keptOriginal = 0;
    let restored = 0;

    for (const item of diffItems) {
      const res = resolutions.get(item.path);
      if (item.status === 'added' || item.status === 'modified') {
        if (res === 'take_zip' || res === undefined) toUpload++;
        else keptOriginal++;
      } else if (item.status === 'removed') {
        if (res === 'delete') toDelete++;
        else restored++;
      }
    }

    return { toUpload, toDelete, keptOriginal, restored, totalToSync: toUpload + toDelete };
  }, [diffItems, resolutions]);

  // Execute Synchronization
  const handleExecuteSync = async () => {
    if (summaryCounts.totalToSync === 0) {
      showToast('No changes selected to synchronize.', 'warning');
      return;
    }

    setIsCommitting(true);
    setCommitError(null);
    setProgressStatus('Initializing atomic Git transaction...');

    try {
      if (githubToken && currentRepoOwner && currentRepo) {
        // Authenticated commit via Git Data Trees API
        const result = await commitSyncToGitHub({
          token: githubToken,
          owner: currentRepoOwner,
          repo: currentRepo,
          branch: currentBranch || 'main',
          commitMessage: commitMessage.trim() || 'Sync updates from AI Studio',
          selectedDiffFiles: diffItems,
          zipFilesMap: zipFileMap,
          fileResolutions: resolutions,
          createPR: commitMode === 'pr',
          newBranchName: newBranchName.trim(),
          prTitle: prTitle.trim(),
          prBody: prBody.trim(),
          onProgress: (step) => setProgressStatus(step),
        });

        setCommitSuccess(result);
        showToast(
          commitMode === 'pr'
            ? `Pull Request opened on branch ${result.branchName}!`
            : `Synchronized changes directly to ${currentBranch}!`,
          'success'
        );
        refreshData();
      } else {
        // Local Workspace / Demo Mode Fallback
        setProgressStatus('Saving changes to local workspace storage...');
        const existingFiles = (activeFiles && activeFiles.length > 0)
          ? [...activeFiles]
          : (getLocalRepoDetails(currentRepo || '', 'files') || []);
        let updatedFileList = [...existingFiles];

        for (const file of diffItems) {
          const res = resolutions.get(file.path);
          if (file.status === 'removed' && res === 'delete') {
            localStorage.removeItem(`local_file_${currentRepo}_${file.path}`);
            updatedFileList = updatedFileList.filter(f => (f.path || f.name) !== file.path);
          } else if ((file.status === 'added' || file.status === 'modified') && (res === 'take_zip' || res === undefined)) {
            if (file.newContent !== undefined) {
              localStorage.setItem(`local_file_${currentRepo}_${file.path}`, file.newContent);
            }
            const exists = updatedFileList.some(f => (f.path || f.name) === file.path);
            if (!exists) {
              updatedFileList.push({
                name: file.path.split('/').pop() || file.path,
                path: file.path,
                type: 'file',
                size: file.newContent?.length || 0,
              });
            }
          }
        }

        if (currentRepo) {
          try {
            localStorage.setItem(`local_details_${currentRepo}_files`, JSON.stringify(updatedFileList));
          } catch (_) {}
        }

        const localHash = Math.random().toString(16).slice(2, 9);
        await createLocalCommit({
          msg: commitMessage.trim() || 'Sync updates from AI Studio',
          author: githubUser?.name || githubUser?.login || 'Local Developer',
          hash: localHash,
          add: `+${summaryCounts.toUpload}`,
          del: `-${summaryCounts.toDelete}`,
          files: updatedFileList,
          updatedFileList: updatedFileList,
        });

        if (commitMode === 'pr') {
          createLocalBranch({
            name: newBranchName,
            desc: `Branch created for sync ${newBranchName}`,
          });
          createLocalPR({
            title: prTitle.trim() || commitMessage.trim() || 'Sync updates from AI Studio package',
            desc: prBody.trim() || 'This pull request synchronizes updated code files exported from AI Studio.',
            source: newBranchName,
            target: currentBranch || 'main',
          });
        }

        setCommitSuccess({
          commitSha: localHash,
          branchName: commitMode === 'pr' ? newBranchName : (currentBranch || 'main'),
          prNumber: commitMode === 'pr' ? Math.floor(Math.random() * 800 + 100) : undefined,
          htmlUrl: '#',
        });
        showToast(
          commitMode === 'pr'
            ? `Created branch ${newBranchName} and opened local PR!`
            : `Locally applied ${summaryCounts.totalToSync} synchronized files!`,
          'success'
        );
        refreshData();
      }
    } catch (err: any) {
      console.error('Failed to synchronize files:', err);
      setCommitError(err.message || 'Failed to complete synchronization.');
      showToast(`Sync failed: ${err.message || err}`, 'error');
    } finally {
      setIsCommitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/80 backdrop-blur-xs select-none">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-6xl h-[94vh] sm:h-[88vh] max-h-[860px] bg-background border border-border rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-text-primary"
      >
        {/* Mobile Pull Handle (Visible on small screens) */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center shrink-0">
          <div className="w-10 h-1.5 bg-surface-3 rounded-full" />
        </div>

        {/* 1. Header Toolbar (Professional 8-Point Design System) */}
        {/* Mobile Header: 2 Distinct Rows (Prevents clipping of repo identity & steps) */}
        <div className="sm:hidden border-b border-border bg-surface-1 shrink-0">
          {/* Row 1 (48px = 6x8pt): Brand Identity, Repo Tag & Close Hitbox */}
          <div className="h-12 px-3 flex items-center justify-between gap-2 border-b border-border/40">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-accent/15 text-accent flex items-center justify-center shrink-0">
                <Sparkles size={15} />
              </div>
              <div className="min-w-0 flex items-center gap-1.5">
                <h2 className="text-xs font-bold text-text-primary truncate">
                  ZIP Sync
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent/10 border border-accent/20 text-accent font-semibold truncate max-w-[170px]" title={`${currentRepoOwner}/${currentRepo} @ ${currentBranch || 'main'}`}>
                  {currentRepoOwner}/{currentRepo}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-11 h-11 rounded-xl flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors cursor-pointer shrink-0 active:scale-95"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Row 2 (44px): Segmented Progress Step Control (Full Width, >=40px touch target) */}
          <div className="p-1.5 bg-surface-2/60 flex items-center gap-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={`flex-1 min-h-[40px] px-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98 ${
                currentStep === 1
                  ? 'bg-card text-text-primary shadow-xs font-bold border border-border/60'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                currentStep === 1 ? 'bg-accent text-white' : 'bg-surface-3 text-text-secondary'
              }`}>1</span>
              <span>Root Align</span>
            </button>
            <button
              type="button"
              disabled={diffItems.length === 0}
              onClick={() => {
                setCurrentStep(2);
                setActiveMobileDiffFile(null);
              }}
              className={`flex-1 min-h-[40px] px-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98 ${
                currentStep === 2
                  ? 'bg-card text-text-primary shadow-xs font-bold border border-border/60'
                  : diffItems.length === 0
                  ? 'text-text-tertiary opacity-40 cursor-not-allowed'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                currentStep === 2 ? 'bg-accent text-white' : 'bg-surface-3 text-text-secondary'
              }`}>2</span>
              <span className="truncate">Diff ({diffItems.filter(f => f.status !== 'unchanged').length})</span>
            </button>
            <button
              type="button"
              disabled={diffItems.length === 0}
              onClick={() => setCurrentStep(3)}
              className={`flex-1 min-h-[40px] px-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98 ${
                currentStep === 3
                  ? 'bg-card text-text-primary shadow-xs font-bold border border-border/60'
                  : diffItems.length === 0
                  ? 'text-text-tertiary opacity-40 cursor-not-allowed'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                currentStep === 3 ? 'bg-accent text-white' : 'bg-surface-3 text-text-secondary'
              }`}>3</span>
              <span>Commit & PR</span>
            </button>
          </div>
        </div>

        {/* Desktop Header Toolbar (Single Row 56px = 7x8pt) */}
        <div className="hidden sm:flex h-14 px-6 border-b border-border bg-surface-1 items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-accent/15 text-accent flex items-center justify-center shrink-0">
              <Sparkles size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-text-primary truncate">
                  AI Studio ZIP Sync
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-accent/10 border border-accent/20 text-accent font-semibold shrink-0">
                  {currentRepoOwner}/{currentRepo} @ {currentBranch || 'main'}
                </span>
              </div>
              <p className="text-[11px] text-text-secondary truncate">
                Auto-detect root directory, resolve overlapping conflict changes, and commit atomically to Git.
              </p>
            </div>
          </div>

          {/* Desktop Step Indicator Tabs */}
          <div className="flex items-center bg-surface-2 p-1 rounded-xl border border-border text-xs font-semibold">
            <button
              onClick={() => setCurrentStep(1)}
              className={`min-h-[32px] px-3.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentStep === 1 ? 'bg-card text-text-primary shadow-xs font-bold' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                currentStep === 1 ? 'bg-accent text-white' : 'bg-surface-3 text-text-secondary'
              }`}>1</span>
              <span>Align Root</span>
            </button>
            <button
              disabled={diffItems.length === 0}
              onClick={() => {
                setCurrentStep(2);
                setActiveMobileDiffFile(null);
              }}
              className={`min-h-[32px] px-3.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentStep === 2 
                  ? 'bg-card text-text-primary shadow-xs font-bold' 
                  : diffItems.length === 0 
                  ? 'text-text-tertiary opacity-40 cursor-not-allowed' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                currentStep === 2 ? 'bg-accent text-white' : 'bg-surface-3 text-text-secondary'
              }`}>2</span>
              <span>Conflicts ({diffItems.filter(f => f.status !== 'unchanged').length})</span>
            </button>
            <button
              disabled={diffItems.length === 0}
              onClick={() => setCurrentStep(3)}
              className={`min-h-[32px] px-3.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentStep === 3 
                  ? 'bg-card text-text-primary shadow-xs font-bold' 
                  : diffItems.length === 0 
                  ? 'text-text-tertiary opacity-40 cursor-not-allowed' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                currentStep === 3 ? 'bg-accent text-white' : 'bg-surface-3 text-text-secondary'
              }`}>3</span>
              <span>Commit & PR</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors cursor-pointer shrink-0"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* 2. Main Workstation Viewport (Strict 8pt Spacing: 16px / 24px) */}
        <div className="flex-1 overflow-hidden min-h-0 flex flex-col p-4 sm:p-6 bg-background">
          {/* STEP 1: UPLOAD & AUTO-DETECTION VISUAL TREE PICKER */}
          {currentStep === 1 && (
            <div className="h-full flex flex-col gap-4 min-h-0">
              {/* Visual Root Tree Picker Bar if zip is parsed */}
              {zipExtractedFiles.length > 0 && (
                <VisualRootTreePicker
                  activeRoot={activeRoot}
                  suggestedRoot={suggestedRoot}
                  candidates={rootCandidates}
                  directoryTree={directoryTree}
                  samplePath={samplePath}
                  onSelectRoot={handleRootChange}
                />
              )}

              {/* 2-Column Split: Upload Dropzone + Reference Tree Preview */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
                {/* Left: Upload Dropzone (7 cols) */}
                <div className="lg:col-span-7 flex flex-col gap-4 min-h-0">
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleFileUpload(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex-1 border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                      zipFile 
                        ? 'border-accent/40 bg-accent/5' 
                        : 'border-border hover:border-accent/60 bg-surface-1/40 hover:bg-surface-1'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".zip,application/zip"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                    />

                    {isParsingZip ? (
                      <div className="flex flex-col items-center gap-3">
                        <span className="w-8 h-8 rounded-full border-3 border-accent border-t-transparent animate-spin" />
                        <span className="text-xs font-semibold text-text-primary">
                          Analyzing ZIP directory landmarks and project structure...
                        </span>
                      </div>
                    ) : zipFile ? (
                      <div className="flex flex-col items-center">
                        <div className="w-14 h-14 rounded-2xl bg-accent/15 text-accent flex items-center justify-center mb-3">
                          <FileArchive size={28} />
                        </div>
                        <span className="text-sm font-bold text-text-primary">{zipFile.name}</span>
                        <span className="text-xs text-text-secondary mt-1">
                          {(zipFile.size / (1024 * 1024)).toFixed(2)} MB · {zipExtractedFiles.length} files extracted
                        </span>

                        <div className="mt-4 px-3.5 py-2 rounded-xl bg-surface-2 border border-border text-xs text-text-secondary">
                          Drop another ZIP here to replace
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center max-w-sm">
                        <div className="w-14 h-14 rounded-2xl bg-surface-2 text-text-secondary flex items-center justify-center mb-3 border border-border">
                          <Upload size={26} />
                        </div>
                        <span className="text-sm font-bold text-text-primary">
                          Upload AI Studio Code Export (.ZIP)
                        </span>
                        <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                          We will analyze the archive, detect the true project root, and cross-reference with the target repository tree.
                        </p>
                        <span className="mt-4 min-h-[44px] px-5 py-2.5 bg-accent text-white rounded-xl text-xs font-bold shadow-xs hover:opacity-90 flex items-center justify-center">
                          Select ZIP Archive
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Summary card & proceed button */}
                  {diffItems.length > 0 && (
                    <div className="bg-surface-1 border border-border rounded-2xl p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                          <CheckCircle size={20} />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-text-primary block">
                            Analyzed: {diffItems.filter(f => f.status !== 'unchanged').length} Changed Files
                          </span>
                          <span className="text-[11px] text-text-secondary">
                            Root alignment mapped. Proceed to review diffs and resolve conflicts.
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="min-h-[44px] px-5 py-2 bg-accent hover:opacity-90 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs shrink-0 active:scale-95"
                      >
                        <span>Review Changes</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Right: Target Repo Tree Preview (5 cols on Desktop) */}
                <div className="hidden lg:block lg:col-span-5 h-full min-h-[280px]">
                  <RepoReferenceTree
                    repoName={currentRepo || 'repository'}
                    repoOwner={currentRepoOwner || 'owner'}
                    branch={currentBranch || 'main'}
                    files={activeFiles}
                  />
                </div>
              </div>

              {/* Mobile Target Repo Tree Accordion (Keeps dropzone & root candidate chips above fold) */}
              <div className="lg:hidden shrink-0 mt-1">
                <button
                  type="button"
                  onClick={() => setIsRepoTreeExpandedMobile(prev => !prev)}
                  className="w-full min-h-[44px] px-4 py-2.5 bg-surface-1 hover:bg-surface-2 border border-border rounded-xl text-xs font-bold text-text-primary flex items-center justify-between cursor-pointer active:scale-98"
                >
                  <div className="flex items-center gap-2">
                    <Layers size={15} className="text-accent shrink-0" />
                    <span>Target Repository Hierarchy ({activeFiles.length} files)</span>
                  </div>
                  <ChevronRight 
                    size={16} 
                    className={`text-text-secondary transition-transform ${isRepoTreeExpandedMobile ? 'rotate-90' : ''}`} 
                  />
                </button>
                {isRepoTreeExpandedMobile && (
                  <div className="mt-2 h-[260px] rounded-xl overflow-hidden border border-border">
                    <RepoReferenceTree
                      repoName={currentRepo || 'repository'}
                      repoOwner={currentRepoOwner || 'owner'}
                      branch={currentBranch || 'main'}
                      files={activeFiles}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: CONFLICT RESOLVER & MONACO DIFF PREVIEW (TWO-VIEW FLOW ON MOBILE) */}
          {currentStep === 2 && (
            <div className="h-full flex flex-col gap-3 sm:gap-4 min-h-0">
              {/* Desktop Dual-Column Split View (Hidden on Mobile) */}
              <div className="hidden lg:grid flex-1 grid-cols-12 gap-4 min-h-0">
                {/* Left: Conflict Resolver (5 cols) */}
                <div className="col-span-5 h-full min-h-0">
                  <SyncConflictResolver
                    files={diffItems}
                    resolutions={resolutions}
                    selectedFilePath={selectedFilePath}
                    onSelectFile={(path) => setSelectedFilePath(path)}
                    onSetResolution={handleSetResolution}
                    onBulkResolve={handleBulkResolve}
                  />
                </div>

                {/* Right: Monaco-Style Diff Viewer (7 cols) */}
                <div className="col-span-7 h-full min-h-[350px]">
                  <MonacoDiffViewer
                    file={activeDiffItem}
                    theme={theme}
                    resolution={activeDiffItem ? (resolutions.get(activeDiffItem.path) || 'take_zip') : 'take_zip'}
                    onResolve={(action) => {
                      if (activeDiffItem) {
                        handleSetResolution(activeDiffItem.path, action);
                      }
                    }}
                  />
                </div>
              </div>

              {/* Mobile Two-View Flow: File List First -> Tap File to Open Full Diff */}
              <div className="lg:hidden flex-1 h-full min-h-0">
                {!activeMobileDiffFile ? (
                  /* Mobile View 1: Full-Width Conflict Resolver & Categorized File Cards */
                  <div className="h-full min-h-0 flex flex-col">
                    <SyncConflictResolver
                      files={diffItems}
                      resolutions={resolutions}
                      selectedFilePath={selectedFilePath}
                      onSelectFile={(path) => {
                        setSelectedFilePath(path);
                        const target = diffItems.find(f => f.path === path);
                        if (target) setActiveMobileDiffFile(target);
                      }}
                      onViewDiffMobile={(file) => {
                        setSelectedFilePath(file.path);
                        setActiveMobileDiffFile(file);
                      }}
                      onSetResolution={handleSetResolution}
                      onBulkResolve={handleBulkResolve}
                    />
                  </div>
                ) : (
                  /* Mobile View 2: Full-Width Monaco Diff Inspector with Tabs & Pinned Resolution Bar */
                  <div className="h-full min-h-0 flex flex-col">
                    <MonacoDiffViewer
                      file={activeMobileDiffFile}
                      theme={theme}
                      resolution={resolutions.get(activeMobileDiffFile.path) || (activeMobileDiffFile.status === 'removed' ? 'restore' : 'take_zip')}
                      onResolve={(action) => {
                        handleSetResolution(activeMobileDiffFile.path, action);
                      }}
                      onBack={() => setActiveMobileDiffFile(null)}
                    />
                  </div>
                )}
              </div>

              {/* Bottom Footer Navigation Bar (Height: 48px = 6x8pt, Min Touch Target 44px) */}
              <div className="h-12 border-t border-border flex items-center justify-between gap-3 shrink-0 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (activeMobileDiffFile) {
                      setActiveMobileDiffFile(null);
                    } else {
                      setCurrentStep(1);
                    }
                  }}
                  className="min-h-[44px] px-4 py-2 bg-surface-2 hover:bg-surface-3 border border-border rounded-xl text-xs font-bold text-text-secondary hover:text-text-primary flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <ArrowLeft size={14} />
                  <span>{activeMobileDiffFile ? 'Back to Files' : 'Back to Align'}</span>
                </button>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-text-secondary font-mono hidden sm:inline">
                    {summaryCounts.totalToSync} files staged ({summaryCounts.toUpload} update, {summaryCounts.toDelete} delete)
                  </span>
                  <button
                    type="button"
                    disabled={summaryCounts.totalToSync === 0}
                    onClick={() => setCurrentStep(3)}
                    className="min-h-[44px] px-5 sm:px-6 py-2.5 bg-accent hover:opacity-90 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs disabled:cursor-not-allowed active:scale-95"
                  >
                    <span>Proceed to Commit</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: GIT COMMIT & BRANCH/PR DISPATCHER */}
          {currentStep === 3 && (
            <div className="h-full flex flex-col justify-between max-w-2xl mx-auto w-full py-2 min-h-0">
              {commitSuccess ? (
                /* Success Card */
                <div className="flex flex-col items-center justify-center text-center p-8 bg-surface-1 border border-border rounded-2xl my-auto">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-4">
                    <CheckCircle size={36} />
                  </div>
                  <h3 className="text-lg font-bold text-text-primary">
                    Synchronization Completed!
                  </h3>
                  <p className="text-xs text-text-secondary mt-1.5 max-w-md leading-relaxed">
                    {commitSuccess.prNumber 
                      ? `Pull Request #${commitSuccess.prNumber} opened successfully on '${commitSuccess.branchName}'.`
                      : `Committed ${summaryCounts.totalToSync} files directly to branch '${commitSuccess.branchName}'.`}
                  </p>

                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    {commitSuccess.prUrl && (
                      <a
                        href={commitSuccess.prUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[44px] px-5 py-2.5 bg-accent hover:opacity-90 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs"
                      >
                        <ExternalLink size={14} />
                        <span>View Pull Request #{commitSuccess.prNumber}</span>
                      </a>
                    )}
                    {commitSuccess.htmlUrl && commitSuccess.htmlUrl !== '#' && !commitSuccess.prUrl && (
                      <a
                        href={commitSuccess.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[44px] px-5 py-2.5 bg-surface-2 hover:bg-surface-3 border border-border text-text-primary font-bold rounded-xl text-xs flex items-center gap-2"
                      >
                        <ExternalLink size={14} />
                        <span>View Commit on GitHub</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        refreshData();
                      }}
                      className="min-h-[44px] px-5 py-2.5 bg-surface-2 hover:bg-surface-3 border border-border text-text-primary font-bold rounded-xl text-xs cursor-pointer"
                    >
                      Return to Workspace
                    </button>
                  </div>
                </div>
              ) : (
                /* Commit & PR Form */
                <div className="flex flex-col gap-4 min-h-0 overflow-y-auto no-scrollbar pb-4">
                  {/* Strategy Switcher */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-primary block">
                      Target Sync Strategy
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div
                        onClick={() => setCommitMode('direct')}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          commitMode === 'direct'
                            ? 'bg-accent/10 border-accent shadow-xs'
                            : 'bg-surface-1 border-border hover:bg-surface-2/60'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <GitCommit size={16} className={commitMode === 'direct' ? 'text-accent' : 'text-text-secondary'} />
                          <span className="font-bold text-xs text-text-primary">Direct Commit</span>
                        </div>
                        <span className="text-[11px] text-text-secondary mt-1 block">
                          Commit directly to <code className="font-mono text-accent">{currentBranch || 'main'}</code> in a single atomic Git tree.
                        </span>
                      </div>

                      <div
                        onClick={() => setCommitMode('pr')}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          commitMode === 'pr'
                            ? 'bg-accent/10 border-accent shadow-xs'
                            : 'bg-surface-1 border-border hover:bg-surface-2/60'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <GitPullRequest size={16} className={commitMode === 'pr' ? 'text-accent' : 'text-text-secondary'} />
                          <span className="font-bold text-xs text-text-primary">Branch & Pull Request</span>
                        </div>
                        <span className="text-[11px] text-text-secondary mt-1 block">
                          Create a new branch and open a review Pull Request for peer review.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Branch & PR inputs if in PR mode */}
                  {commitMode === 'pr' && (
                    <div className="bg-surface-1 border border-border rounded-2xl p-4 space-y-3">
                      <div>
                        <label className="text-[11px] font-bold text-text-secondary block mb-1">
                          New Feature Branch
                        </label>
                        <div className="flex items-center gap-2 px-3.5 py-2.5 bg-surface-2 border border-border rounded-xl text-xs font-mono">
                          <GitBranch size={14} className="text-accent" />
                          <input
                            type="text"
                            value={newBranchName}
                            onChange={(e) => setNewBranchName(e.target.value)}
                            className="w-full bg-transparent outline-none text-text-primary"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-text-secondary block mb-1">
                          Pull Request Title
                        </label>
                        <input
                          type="text"
                          value={prTitle}
                          onChange={(e) => setPrTitle(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-surface-2 border border-border rounded-xl text-xs text-text-primary outline-none focus:border-accent"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-text-secondary block mb-1">
                          Pull Request Description
                        </label>
                        <textarea
                          rows={2}
                          value={prBody}
                          onChange={(e) => setPrBody(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-surface-2 border border-border rounded-xl text-xs text-text-primary outline-none focus:border-accent resize-none font-sans"
                        />
                      </div>
                    </div>
                  )}

                  {/* Commit message */}
                  <div>
                    <label className="text-xs font-bold text-text-primary block mb-1.5">
                      Commit Message
                    </label>
                    <input
                      type="text"
                      value={commitMessage}
                      onChange={(e) => setCommitMessage(e.target.value)}
                      placeholder="Commit summary..."
                      className="w-full px-4 py-3 bg-surface-1 border border-border rounded-xl text-xs text-text-primary outline-none focus:border-accent font-medium min-h-[44px]"
                    />
                  </div>

                  {/* Summary Box */}
                  <div className="p-4 rounded-2xl bg-surface-2/60 border border-border flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 text-text-secondary">
                      <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
                      <span>
                        Syncing <strong className="text-text-primary">{summaryCounts.totalToSync} files</strong>: {summaryCounts.toUpload} update/add, {summaryCounts.toDelete} delete in Git.
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-text-tertiary">
                      Atomic Git Tree
                    </span>
                  </div>

                  {commitError && (
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle size={16} className="shrink-0 text-rose-400" />
                      <span>{commitError}</span>
                    </div>
                  )}

                  {isCommitting && (
                    <div className="p-4 rounded-xl bg-accent/10 border border-accent/20 flex items-center gap-3 text-xs text-accent">
                      <span className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin shrink-0" />
                      <span className="font-mono">{progressStatus || 'Synchronizing with GitHub...'}</span>
                    </div>
                  )}

                  {/* Bottom Action Buttons (Touch height >= 44-48px) with Safe Area Pinned Bar */}
                  <div className="sticky bottom-0 bg-background/95 backdrop-blur-xs pt-3 pb-[calc(env(safe-area-inset-bottom)+16px)] border-t border-border flex items-center justify-between gap-3 mt-auto">
                    <button
                      type="button"
                      disabled={isCommitting}
                      onClick={() => setCurrentStep(2)}
                      className="min-h-[44px] px-4 py-2 bg-surface-2 hover:bg-surface-3 border border-border rounded-xl text-xs font-bold text-text-secondary hover:text-text-primary flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
                    >
                      <ArrowLeft size={14} />
                      <span>Back to Diff</span>
                    </button>

                    <button
                      type="button"
                      disabled={isCommitting || summaryCounts.totalToSync === 0}
                      onClick={handleExecuteSync}
                      className="min-h-[48px] px-6 py-2.5 bg-accent hover:opacity-90 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md disabled:cursor-not-allowed active:scale-95"
                    >
                      {isCommitting ? (
                        <>
                          <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          <span>Pushing Git Tree...</span>
                        </>
                      ) : (
                        <>
                          <GitCommit size={15} />
                          <span>{commitMode === 'pr' ? 'Push & Open Pull Request' : 'Commit & Push Changes'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
