import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import { useAppContext } from '../../AppContext';
import { X, ArrowLeft, ArrowRight, GitCommit, Ban } from 'lucide-react';
import {
  parseZipArchive,
  compareZipWithRepo,
  commitSyncToGitHub,
  isSyncAbortError,
  ZipExtractedFile,
  DiffFileItem,
  BulkResolutionType,
  ConflictResolution,
  applyBulkResolution,
  buildAlignedZipMap,
  computeSyncSummary,
} from '../../mobile/utils/zipSyncEngine';
import { analyzeZipRoots, RootCandidate, DirectoryNode } from '../../mobile/utils/zipAutoDetect';
import { fetchFileContentSafe } from '../../mobile/utils/gitApi';
import { ZipSyncStepper } from '../../features/sync/components/ZipSyncStepper';
import { ZipSyncStepUpload } from '../../features/sync/components/ZipSyncStepUpload';
import { ZipSyncStepReview } from '../../features/sync/components/ZipSyncStepReview';
import { ZipSyncStepCommit } from '../../features/sync/components/ZipSyncStepCommit';
import { ZipSyncSuccessView } from '../../features/sync/components/ZipSyncSuccessView';

export const ZipSyncModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { currentRepo, currentRepoOwner, currentBranch, activeFiles, githubToken, theme, showToast, refreshData } = useAppContext();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [stepDirection, setStepDirection] = useState<1 | -1>(1);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [isParsingZip, setIsParsingZip] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [compareProgress, setCompareProgress] = useState<{ completed: number; total: number } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [commitError, setCommitError] = useState<string | null>(null);
  const [cancelNotice, setCancelNotice] = useState<string | null>(null);

  const [zipExtractedFiles, setZipExtractedFiles] = useState<ZipExtractedFile[]>([]);
  const [suggestedRoot, setSuggestedRoot] = useState('');
  const [activeRoot, setActiveRoot] = useState('');
  const [rootCandidates, setRootCandidates] = useState<RootCandidate[]>([]);
  const [directoryTree, setDirectoryTree] = useState<DirectoryNode>({ name: 'Root', fullPath: '', children: [] });
  const [diffItems, setDiffItems] = useState<DiffFileItem[]>([]);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [resolutions, setResolutions] = useState<Map<string, ConflictResolution>>(new Map());

  const [commitMessage, setCommitMessage] = useState('Sync updates from AI Studio package');
  const [commitMode, setCommitMode] = useState<'direct' | 'pr'>('direct');
  const [newBranchName, setNewBranchName] = useState(() => `sync-aistudio-${Date.now().toString(36).slice(-4)}`);
  const [prTitle, setPrTitle] = useState('Sync updates from AI Studio package');
  const [prBody, setPrBody] = useState('This pull request synchronizes updated code files exported from AI Studio.');
  const [isCommitting, setIsCommitting] = useState(false);
  const [progressStatus, setProgressStatus] = useState('');
  const [commitProgress, setCommitProgress] = useState<{ completed: number; total: number } | null>(null);
  const [commitSuccess, setCommitSuccess] = useState<any>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (isOpen) {
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
      setCurrentStep(1);
      setStepDirection(1);
      setZipFile(null);
      setIsParsingZip(false);
      setIsComparing(false);
      setCompareProgress(null);
      setUploadError(null);
      setCommitError(null);
      setCancelNotice(null);
      setZipExtractedFiles([]);
      setSuggestedRoot('');
      setActiveRoot('');
      setRootCandidates([]);
      setDirectoryTree({ name: 'Root', fullPath: '', children: [] });
      setDiffItems([]);
      setSelectedFilePath(null);
      setCommitSuccess(null);
      setResolutions(new Map());
      setNewBranchName(`sync-aistudio-${Date.now().toString(36).slice(-4)}`);
      setProgressStatus('');
      setCommitProgress(null);
      setIsCommitting(false);
    } else {
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
    }
  }, [isOpen]);

  const handleCancelSync = (targetStep?: 1 | 2) => {
    if (!isCommitting) return;
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsCommitting(false);
    setProgressStatus('');
    setCommitProgress(null);
    setCommitError(null);
    setCancelNotice('Synchronization cancelled safely. No commit was created on your branch.');
    showToast('Synchronization cancelled', 'warning');
    if (targetStep && targetStep !== currentStep) {
      setStepDirection(targetStep > currentStep ? 1 : -1);
      setCurrentStep(targetStep);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isCommitting) {
          handleCancelSync();
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isCommitting, onClose]);

  const goToStep = (nextStep: 1 | 2 | 3) => {
    if (isCommitting || nextStep === currentStep) return;
    setStepDirection(nextStep > currentStep ? 1 : -1);
    setCurrentStep(nextStep);
  };

  const runComparison = async (files: ZipExtractedFile[], root: string) => {
    if (isCommitting) return;
    setIsComparing(true);
    setCompareProgress({ completed: 0, total: 0 });
    try {
      const res = await compareZipWithRepo({
        zipFiles: files,
        repoFiles: activeFiles,
        rootPrefixToStrip: root,
        fetchOldContent: async (filePath: string) =>
          fetchFileContentSafe({
            filePath,
            repoName: currentRepo || '',
            owner: currentRepoOwner || '',
            branch: currentBranch || 'main',
            token: githubToken,
          }),
        onProgress: (completed, total) => {
          setCompareProgress({ completed, total });
        },
      });
      setDiffItems(res.files);
      setResolutions(new Map());
      const firstChanged = res.files.find((f) => f.status !== 'unchanged') || res.files[0];
      setSelectedFilePath(firstChanged ? firstChanged.path : null);
    } catch (err: any) {
      const msg = err?.message || 'Error comparing files against repository.';
      setUploadError(msg);
      showToast(msg, 'error');
    } finally {
      setIsComparing(false);
    }
  };

  const handleFileSelected = async (file: File) => {
    if (isCommitting) return;
    setUploadError(null);
    setCommitError(null);
    setCancelNotice(null);
    setZipFile(file);
    setIsParsingZip(true);
    try {
      const parsed = await parseZipArchive(file);
      setZipExtractedFiles(parsed.files);
      const analysis = analyzeZipRoots(parsed.rawPaths);
      setSuggestedRoot(analysis.suggestedRoot);
      setActiveRoot(analysis.suggestedRoot);
      setRootCandidates(analysis.candidates);
      setDirectoryTree(analysis.directoryTree);
      setIsParsingZip(false);
      await runComparison(parsed.files, analysis.suggestedRoot);
    } catch (e: any) {
      const msg = e?.message || 'Failed to parse ZIP archive.';
      setUploadError(msg);
      setZipExtractedFiles([]);
      setDiffItems([]);
      showToast(msg, 'error');
    } finally {
      setIsParsingZip(false);
    }
  };

  const handleBulkResolve = (type: BulkResolutionType) => {
    if (isCommitting) return;
    setResolutions((prev) => applyBulkResolution(diffItems, prev, type));
    const labels: Record<BulkResolutionType, string> = {
      all_zip: 'Selected all ZIP updates',
      all_original: 'Kept all existing repository files',
      all_restore: 'Retained all missing repository files',
      all_delete: 'Marked all missing files for deletion',
    };
    showToast(labels[type], 'info');
  };

  const summaryCounts = useMemo(() => computeSyncSummary(diffItems, resolutions), [diffItems, resolutions]);

  const handleExecuteSync = async () => {
    if (!currentRepo || isCommitting) return;
    if (!commitMessage.trim()) {
      setCommitError('Please enter a commit message.');
      return;
    }
    if (commitMode === 'pr' && !newBranchName.trim()) {
      setCommitError('Please enter a branch name for the Pull Request.');
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setCommitError(null);
    setCancelNotice(null);
    setIsCommitting(true);
    setCommitProgress({ completed: 0, total: summaryCounts.toUpload });

    try {
      const zipMap = buildAlignedZipMap(zipExtractedFiles, activeRoot);
      const res = await commitSyncToGitHub({
        token: githubToken || '',
        owner: currentRepoOwner || 'custom',
        repo: currentRepo,
        branch: currentBranch || 'main',
        commitMessage: commitMessage.trim(),
        selectedDiffFiles: diffItems,
        zipFilesMap: zipMap,
        fileResolutions: resolutions,
        createPR: commitMode === 'pr',
        newBranchName: newBranchName.trim(),
        prTitle: prTitle.trim(),
        prBody: prBody.trim(),
        signal: controller.signal,
        onProgress: (step, completed, total) => {
          setProgressStatus(step);
          if (typeof completed === 'number' && typeof total === 'number') {
            setCommitProgress({ completed, total });
          }
        },
      });
      if (!controller.signal.aborted) {
        setCommitSuccess(res);
        refreshData();
      }
    } catch (err: any) {
      if (isSyncAbortError(err) || controller.signal.aborted) {
        return;
      }
      const msg = err?.message || 'Synchronization failed.';
      setCommitError(msg);
      showToast(msg, 'error');
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      setIsCommitting(false);
      setCommitProgress(null);
    }
  };

  const samplePath = zipExtractedFiles[0]?.originalPath || '';
  const hasExtracted = zipExtractedFiles.length > 0;
  const changedCount = useMemo(() => diffItems.filter((f) => f.status !== 'unchanged').length, [diffItems]);
  const unchangedCount = useMemo(() => diffItems.filter((f) => f.status === 'unchanged').length, [diffItems]);

  const canSubmitCommit =
    !isCommitting &&
    summaryCounts.totalToSync > 0 &&
    commitMessage.trim().length > 0 &&
    (commitMode !== 'pr' || newBranchName.trim().length > 0);

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => {
                if (!isCommitting) onClose();
              }}
              className="absolute inset-0 bg-black/75 cursor-pointer"
              aria-hidden="true"
            />
            <motion.div
              initial={{ y: 28, opacity: 0, scale: 0.985 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.985 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="zip-sync-modal-title"
              className="relative bg-surface-1 border-t sm:border border-border rounded-t-3xl sm:rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[94dvh] sm:max-h-[90vh] z-10"
            >
              <div className="w-10 h-1 bg-border rounded-full mx-auto mt-2.5 -mb-1 sm:hidden shrink-0" />

              <div className="px-4 sm:px-6 py-3.5 border-b border-border flex items-center justify-between gap-3 shrink-0">
                <div className="min-w-0">
                  <h2 id="zip-sync-modal-title" className="font-bold text-sm text-text-primary leading-tight text-balance">
                    ZIP Synchronization Wizard
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5 truncate">
                    {currentRepo ? `${currentRepoOwner ? `${currentRepoOwner}/` : ''}${currentRepo} · ${currentBranch || 'main'}` : 'Align, review diffs, and push updates'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (isCommitting) {
                      handleCancelSync();
                    } else {
                      onClose();
                    }
                  }}
                  aria-label={isCommitting ? 'Cancel active sync' : 'Close dialog'}
                  title={isCommitting ? 'Cancel active sync' : 'Close dialog'}
                  className="touch-target-44 rounded-xl hover:bg-surface-2 text-text-tertiary hover:text-text-primary btn-tactile cursor-pointer"
                >
                  <X size={17} />
                </button>
              </div>

              {!commitSuccess && (
                <ZipSyncStepper
                  currentStep={currentStep}
                  onSelectStep={goToStep}
                  canNavigateToStep2={hasExtracted && !isParsingZip}
                  canNavigateToStep3={hasExtracted && !isParsingZip && !isComparing}
                  isLocked={isCommitting}
                />
              )}

              <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0">
                <AnimatePresence mode="wait" initial={false}>
                  {commitSuccess ? (
                    <ZipSyncSuccessView key="success" success={commitSuccess} onClose={onClose} />
                  ) : (
                    <motion.div
                      key={`step-${currentStep}`}
                      initial={{ opacity: 0, x: stepDirection * 18 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: stepDirection * -18 }}
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {currentStep === 1 && (
                        <ZipSyncStepUpload
                          zipFile={zipFile}
                          isParsingZip={isParsingZip}
                          isComparing={isComparing}
                          compareProgress={compareProgress}
                          uploadError={uploadError}
                          onFileSelected={handleFileSelected}
                          onInvalidFile={(msg) => {
                            setUploadError(msg);
                            showToast(msg, 'error');
                          }}
                          activeRoot={activeRoot}
                          suggestedRoot={suggestedRoot}
                          rootCandidates={rootCandidates}
                          directoryTree={directoryTree}
                          samplePath={samplePath}
                          onRootChange={(r) => {
                            if (isCommitting) return;
                            setActiveRoot(r);
                            runComparison(zipExtractedFiles, r);
                          }}
                          totalExtractedFiles={zipExtractedFiles.length}
                        />
                      )}

                      {currentStep === 2 && (
                        <ZipSyncStepReview
                          diffItems={diffItems}
                          selectedFilePath={selectedFilePath}
                          onSelectFilePath={setSelectedFilePath}
                          resolutions={resolutions}
                          onSetResolution={(p, r) => setResolutions((prev) => new Map(prev).set(p, r))}
                          onUpdateResolutions={setResolutions}
                          onBulkResolve={handleBulkResolve}
                          isComparing={isComparing}
                          compareProgress={compareProgress}
                          theme={theme}
                        />
                      )}

                      {currentStep === 3 && (
                        <ZipSyncStepCommit
                          currentBranch={currentBranch || 'main'}
                          commitMessage={commitMessage}
                          setCommitMessage={setCommitMessage}
                          commitMode={commitMode}
                          setCommitMode={setCommitMode}
                          newBranchName={newBranchName}
                          setNewBranchName={setNewBranchName}
                          prTitle={prTitle}
                          setPrTitle={setPrTitle}
                          prBody={prBody}
                          setPrBody={setPrBody}
                          summaryCounts={summaryCounts}
                          unchangedCount={unchangedCount}
                          totalArchiveFiles={zipExtractedFiles.length}
                          isCommitting={isCommitting}
                          progressStatus={progressStatus}
                          commitProgress={commitProgress}
                          commitError={commitError}
                          cancelNotice={cancelNotice}
                          onCancelSync={() => handleCancelSync()}
                          onDismissNotice={() => setCancelNotice(null)}
                        />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Sticky Wizard Navigation Footer */}
              {!commitSuccess && (
                <div className="px-4 sm:px-6 py-3 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] border-t border-border bg-surface-2/35 flex items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {currentStep > 1 ? (
                      isCommitting ? (
                        <button
                          type="button"
                          onClick={() => handleCancelSync(2)}
                          className="min-h-[40px] px-3.5 rounded-xl border border-danger/35 bg-danger/10 hover:bg-danger/20 text-xs font-semibold text-danger inline-flex items-center gap-1.5 cursor-pointer btn-tactile whitespace-nowrap"
                        >
                          <Ban size={14} />
                          <span>Cancel & Back</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => goToStep(currentStep === 3 ? 2 : 1)}
                          className="min-h-[40px] px-3.5 rounded-xl border border-border bg-surface-1 hover:bg-surface-2 text-xs font-semibold text-text-primary inline-flex items-center gap-1.5 cursor-pointer btn-tactile whitespace-nowrap"
                        >
                          <ArrowLeft size={14} />
                          <span>Back</span>
                        </button>
                      )
                    ) : (
                      <span className="text-xs text-text-secondary tabular-nums truncate">
                        {hasExtracted
                          ? isComparing
                            ? 'Comparing against repo...'
                            : unchangedCount > 0
                              ? `${changedCount} changed · ${unchangedCount} identical`
                              : `${changedCount} changed files`
                          : 'Upload a .zip archive'}
                      </span>
                    )}

                    {currentStep === 2 && (
                      <span className="hidden sm:inline text-xs text-text-secondary tabular-nums truncate">
                        {summaryCounts.toUpload} upload · {summaryCounts.toDelete} delete · {summaryCounts.skipped} skipped
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {currentStep === 1 && (
                      <button
                        type="button"
                        disabled={!hasExtracted || isParsingZip || isComparing}
                        onClick={() => goToStep(2)}
                        className="min-h-[40px] px-4 rounded-xl bg-accent hover:opacity-90 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer btn-tactile disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        <span>Review Diffs</span>
                        <ArrowRight size={14} />
                      </button>
                    )}

                    {currentStep === 2 && (
                      <button
                        type="button"
                        disabled={!hasExtracted || isComparing}
                        onClick={() => goToStep(3)}
                        className="min-h-[40px] px-4 rounded-xl bg-accent hover:opacity-90 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer btn-tactile disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        <span>Continue to Commit</span>
                        <ArrowRight size={14} />
                      </button>
                    )}

                    {currentStep === 3 && (
                      isCommitting ? (
                        <button
                          type="button"
                          onClick={() => handleCancelSync()}
                          className="min-h-[40px] px-4 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-text-primary text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer btn-tactile whitespace-nowrap"
                        >
                          <Ban size={14} className="text-danger" />
                          <span>Cancel Sync</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={!canSubmitCommit}
                          onClick={handleExecuteSync}
                          className="min-h-[40px] px-4 rounded-xl bg-accent hover:opacity-90 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer btn-tactile disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                          <GitCommit size={14} />
                          <span>
                            {commitMode === 'pr' ? 'Push & Open PR' : 'Commit & Push'}
                          </span>
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
};
