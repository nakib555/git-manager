import React, { useState, useMemo } from 'react';
import { useAppContext } from '../AppContext';
import { motion } from 'motion/react';
import { CloneProtocol, CloneStep, CloneProgressInfo, UnifiedRepoItem } from '../features/clone/types';
import { CloneFormInputs } from '../features/clone/components/CloneFormInputs';
import { CloneProgressView } from '../features/clone/components/CloneProgressView';
import { CloneSuccessView } from '../features/clone/components/CloneSuccessView';
import { CloneArchiveTab } from '../features/clone/components/CloneArchiveTab';
import { CloneSelectiveTab } from '../features/clone/components/CloneSelectiveTab';
import { CloneTabHeader } from '../features/clone/components/CloneTabHeader';
import { CloneBrowseSection } from '../features/clone/components/CloneBrowseSection';
import { CloneQrCodeModal } from '../features/clone/components/CloneQrCodeModal';
import { executeCloneWorkflow } from '../features/clone/utils/cloneWorkflow';

export const CloneModal = () => {
  const { closeModal, cloneRepository, recentClones, openRepo, currentRepo, githubToken, showToast } = useAppContext();
  
  const [activeTab, setActiveTab] = useState<'clone' | 'archive' | 'selective'>('clone');
  const [intakeMode, setIntakeMode] = useState<'url' | 'browse'>('url');
  const [url, setUrl] = useState('https://github.com/nakib555/git-manager.git');
  const [urlMode, setUrlMode] = useState<CloneProtocol>('https');
  const [dest, setDest] = useState(currentRepo ? `/Documents/Projects/${currentRepo}` : '/Documents/Projects/git-manager');
  const [branch, setBranch] = useState('main');
  const [depth, setDepth] = useState<'full' | 'shallow'>('shallow');
  const [step, setStep] = useState<CloneStep>('config');
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [repoSearch, setRepoSearch] = useState('');

  const [progressInfo, setProgressInfo] = useState<CloneProgressInfo>({
    pct: 0, activity: 'Initializing clone request...', speed: '0 MB/s',
    timeRemaining: 'Calculating...', receivedObjects: { current: 0, total: 100 },
    resolvingDeltas: false,
  });

  const parsedRepoInfo = useMemo(() => {
    try {
      const clean = url.replace(/\.git$/, '');
      const parts = clean.split('/').filter(Boolean);
      return { owner: parts[parts.length - 2] || 'custom', repo: parts[parts.length - 1] || 'git-manager' };
    } catch {
      return { owner: 'nakib555', repo: 'git-manager' };
    }
  }, [url]);

  const recentList: UnifiedRepoItem[] = useMemo(() => {
    return (recentClones || []).map((r: any) => ({
      name: r.name,
      owner: r.owner || (r.url ? r.url.replace(/\.git$/, '').split('/').slice(-2)[0] : 'nakib555'),
      url: r.url || `https://github.com/nakib555/${r.name}.git`,
      language: r.lang || 'TypeScript',
      stars: r.stars || 42,
      isOnDevice: true,
    })).filter(r => r.name.toLowerCase().includes(repoSearch.toLowerCase()));
  }, [recentClones, repoSearch]);

  const handleStartClone = async () => {
    if (!url.trim()) return;
    setStep('progress');
    try {
      await executeCloneWorkflow({
        url, dest, branch, depth,
        owner: parsedRepoInfo.owner, repo: parsedRepoInfo.repo,
        token: githubToken, setProgressInfo, cloneRepository,
      });
      setTimeout(() => setStep('success'), 400);
    } catch (err: any) {
      showToast(err.message || 'Clone failed', 'error');
      setStep('config');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card border border-border rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        <CloneTabHeader activeTab={activeTab} setActiveTab={setActiveTab} onClose={closeModal} />

        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'clone' && step === 'config' && (
            <div className="space-y-4">
              <div className="flex bg-main p-1 rounded-xl border border-border">
                <button
                  type="button"
                  onClick={() => setIntakeMode('url')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    intakeMode === 'url' ? 'bg-card text-text-main shadow-xs' : 'text-text-muted'
                  }`}
                >
                  Remote URL
                </button>
                <button
                  type="button"
                  onClick={() => setIntakeMode('browse')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    intakeMode === 'browse' ? 'bg-card text-text-main shadow-xs' : 'text-text-muted'
                  }`}
                >
                  Recent Repos
                </button>
              </div>

              {intakeMode === 'url' ? (
                <CloneFormInputs
                  url={url} setUrl={setUrl} branch={branch} setBranch={setBranch}
                  dest={dest} setDest={setDest} urlMode={urlMode} setUrlMode={setUrlMode}
                  depth={depth} setDepth={setDepth} onOpenQr={() => setIsQrOpen(true)}
                  onSubmit={handleStartClone}
                />
              ) : (
                <CloneBrowseSection
                  repoSearch={repoSearch} setRepoSearch={setRepoSearch}
                  recentList={recentList} onSelectRepo={(r) => { setUrl(r.url); setIntakeMode('url'); }}
                />
              )}
            </div>
          )}

          {activeTab === 'clone' && step === 'progress' && (
            <CloneProgressView progressInfo={progressInfo} onCancel={() => setStep('config')} />
          )}

          {activeTab === 'clone' && step === 'success' && (
            <CloneSuccessView
              repoName={parsedRepoInfo.repo} destPath={dest}
              onOpenRepo={() => { openRepo(parsedRepoInfo.repo, parsedRepoInfo.owner); closeModal(); }}
              onCloneAnother={() => setStep('config')}
            />
          )}

          {activeTab === 'archive' && <CloneArchiveTab repoName={parsedRepoInfo.repo} repoOwner={parsedRepoInfo.owner} />}
          {activeTab === 'selective' && <CloneSelectiveTab repoName={parsedRepoInfo.repo} />}
        </div>
      </motion.div>

      <CloneQrCodeModal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} url={url} />
    </div>
  );
};
