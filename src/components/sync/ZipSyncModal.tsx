import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { useAppContext } from '../../AppContext';
import { X } from 'lucide-react';
import { parseZipArchive, compareZipWithRepo, commitSyncToGitHub, ZipExtractedFile, DiffFileItem } from '../../mobile/utils/zipSyncEngine';
import { analyzeZipRoots, RootCandidate, DirectoryNode } from '../../mobile/utils/zipAutoDetect';
import { fetchFileContentSafe } from '../../mobile/utils/gitApi';
import { ConflictResolution } from './SyncConflictResolver';
import { ZipSyncStepper } from '../../features/sync/components/ZipSyncStepper';
import { ZipSyncStepUpload } from '../../features/sync/components/ZipSyncStepUpload';
import { ZipSyncStepReview } from '../../features/sync/components/ZipSyncStepReview';
import { ZipSyncStepCommit } from '../../features/sync/components/ZipSyncStepCommit';
import { ZipSyncSuccessView } from '../../features/sync/components/ZipSyncSuccessView';

export const ZipSyncModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { currentRepo, currentRepoOwner, currentBranch, activeFiles, githubToken, theme, showToast, refreshData } = useAppContext();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [isParsingZip, setIsParsingZip] = useState(false);
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
  const [newBranchName, setNewBranchName] = useState(`sync-aistudio-${Date.now().toString(36).slice(-4)}`);
  const [prTitle, setPrTitle] = useState('Sync updates from AI Studio package');
  const [prBody, setPrBody] = useState('This pull request synchronizes updated code files exported from AI Studio.');
  const [isCommitting, setIsCommitting] = useState(false);
  const [progressStatus, setProgressStatus] = useState('');
  const [commitSuccess, setCommitSuccess] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1); setZipFile(null); setZipExtractedFiles([]);
      setDiffItems([]); setCommitSuccess(null); setResolutions(new Map());
    }
  }, [isOpen]);

  const runComparison = async (files: ZipExtractedFile[], root: string) => {
    try {
      const res = await compareZipWithRepo({
        zipFiles: files, repoFiles: activeFiles, rootPrefixToStrip: root,
        fetchOldContent: async (filePath: string) => fetchFileContentSafe({
          filePath, repoName: currentRepo || '', owner: currentRepoOwner || '', branch: currentBranch || 'main', token: githubToken,
        })
      });
      setDiffItems(res.files);
      if (res.files.length > 0) setSelectedFilePath(res.files[0].path);
    } catch (_) { showToast('Error comparing files against repository.', 'error'); }
  };

  const handleFileSelected = async (file: File) => {
    setZipFile(file); setIsParsingZip(true);
    try {
      const parsed = await parseZipArchive(file);
      setZipExtractedFiles(parsed.files);
      const analysis = analyzeZipRoots(parsed.rawPaths);
      setSuggestedRoot(analysis.suggestedRoot); setActiveRoot(analysis.suggestedRoot);
      setRootCandidates(analysis.candidates); setDirectoryTree(analysis.directoryTree);
      await runComparison(parsed.files, analysis.suggestedRoot);
      setCurrentStep(2);
    } catch (e: any) { showToast(e.message || 'Failed to parse ZIP', 'error'); }
    finally { setIsParsingZip(false); }
  };

  const summaryCounts = useMemo(() => {
    let toUpload = 0, toDelete = 0;
    diffItems.forEach(item => {
      const res = resolutions.get(item.path);
      if (item.status === 'added' || item.status === 'modified') {
        if (res === 'take_zip' || res === undefined) toUpload++;
      } else if (item.status === 'removed' && res === 'delete') toDelete++;
    });
    return { toUpload, toDelete, totalToSync: toUpload + toDelete };
  }, [diffItems, resolutions]);

  const handleExecuteSync = async () => {
    if (!currentRepo) return;
    setIsCommitting(true);
    try {
      const zipMap = new Map<string, ZipExtractedFile>();
      zipExtractedFiles.forEach(f => zipMap.set(f.normalizedPath || f.originalPath, f));
      const res = await commitSyncToGitHub({
        token: githubToken || '', owner: currentRepoOwner || 'custom', repo: currentRepo,
        branch: currentBranch || 'main', commitMessage, selectedDiffFiles: diffItems,
        zipFilesMap: zipMap, fileResolutions: resolutions, createPR: commitMode === 'pr',
        newBranchName, prTitle, prBody, onProgress: setProgressStatus,
      });
      setCommitSuccess(res); refreshData();
    } catch (err: any) { showToast(err.message || 'Sync failed', 'error'); }
    finally { setIsCommitting(false); }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/65 backdrop-blur-xs cursor-pointer" aria-hidden="true" />
      <motion.div
        initial={{ y: '100%', opacity: 0.8 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        role="dialog"
        aria-modal="true"
        className="relative bg-surface-1 border-t sm:border border-border rounded-t-3xl sm:rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] z-10 pb-[env(safe-area-inset-bottom,0px)]"
      >
        <div className="w-10 h-1 bg-border rounded-full mx-auto mt-2.5 -mb-1 sm:hidden shrink-0" />
        <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-bold text-sm text-text-primary leading-tight">AI Studio ZIP Synchronization Wizard</h2>
            <p className="text-[11px] text-text-tertiary mt-0.5">3-step wizard to align, review diffs, and commit updates from AI Studio</p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-2 text-text-tertiary hover:text-text-primary cursor-pointer"><X size={16} /></button>
        </div>
        {!commitSuccess && (
          <ZipSyncStepper currentStep={currentStep} onSelectStep={setCurrentStep} canNavigateToStep2={zipExtractedFiles.length > 0} canNavigateToStep3={zipExtractedFiles.length > 0} />
        )}
        <div className="p-6 pb-[calc(env(safe-area-inset-bottom,0px)+24px)] overflow-y-auto flex-1">
          {commitSuccess ? (
            <ZipSyncSuccessView success={commitSuccess} onClose={onClose} />
          ) : (
            <>
              {currentStep === 1 && (
                <ZipSyncStepUpload zipFile={zipFile} isParsingZip={isParsingZip} onFileSelected={handleFileSelected} activeRoot={activeRoot} suggestedRoot={suggestedRoot} rootCandidates={rootCandidates} directoryTree={directoryTree} onRootChange={(r) => { setActiveRoot(r); runComparison(zipExtractedFiles, r); }} totalExtractedFiles={zipExtractedFiles.length} />
              )}
              {currentStep === 2 && (
                <ZipSyncStepReview diffItems={diffItems} selectedFilePath={selectedFilePath} onSelectFilePath={setSelectedFilePath} resolutions={resolutions} onSetResolution={(p, r) => setResolutions(prev => new Map(prev).set(p, r))} onBulkResolve={() => {}} theme={theme} />
              )}
              {currentStep === 3 && (
                <ZipSyncStepCommit commitMessage={commitMessage} setCommitMessage={setCommitMessage} commitMode={commitMode} setCommitMode={setCommitMode} newBranchName={newBranchName} setNewBranchName={setNewBranchName} prTitle={prTitle} setPrTitle={setPrTitle} prBody={prBody} setPrBody={setPrBody} summaryCounts={summaryCounts} isCommitting={isCommitting} progressStatus={progressStatus} onExecuteSync={handleExecuteSync} />
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};
