import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../../AppContext';
import { CloneProtocol, CloneStep, CloneProgressInfo, UnifiedRepoItem } from '../../clone/types';
import { CloneFormInputs } from '../../clone/components/CloneFormInputs';
import { CloneProgressView } from '../../clone/components/CloneProgressView';
import { CloneSuccessView } from '../../clone/components/CloneSuccessView';
import { CloneArchiveTab } from '../../clone/components/CloneArchiveTab';
import { CloneSelectiveTab } from '../../clone/components/CloneSelectiveTab';
import { CloneTabHeader } from '../../clone/components/CloneTabHeader';
import { CloneBrowseSection } from '../../clone/components/CloneBrowseSection';
import { CloneQrCodeModal } from '../../clone/components/CloneQrCodeModal';
import { executeCloneWorkflow } from '../../clone/utils/cloneWorkflow';

export const DesktopCloneScreen: React.FC = () => {
  const { cloneRepository, recentClones, openRepo, currentRepo, currentRepoOwner, githubToken, showToast } = useAppContext();
  
  const [activeTab, setActiveTab] = useState<'clone' | 'archive' | 'selective'>('clone');
  const [intakeMode, setIntakeMode] = useState<'url' | 'browse'>('url');
  const [url, setUrl] = useState(currentRepo && currentRepoOwner ? `https://github.com/${currentRepoOwner}/${currentRepo}.git` : 'https://github.com/nakib555/git-manager.git');
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
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto pr-1 no-scrollbar p-6 max-w-4xl mx-auto w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-text-main">Clone & Export Workbench</h1>
          <p className="text-xs text-text-muted mt-0.5">Clone repositories, export release archives, or select specific source files.</p>
        </div>
        <CloneTabHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        {activeTab === 'clone' && step === 'config' && (
          <div className="space-y-4">
            <div className="flex bg-main p-1 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setIntakeMode('url')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${intakeMode === 'url' ? 'bg-card text-text-main shadow-xs' : 'text-text-muted'}`}
              >
                Remote URL
              </button>
              <button
                type="button"
                onClick={() => setIntakeMode('browse')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${intakeMode === 'browse' ? 'bg-card text-text-main shadow-xs' : 'text-text-muted'}`}
              >
                Recent Repositories
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
            onOpenRepo={() => openRepo(parsedRepoInfo.repo, parsedRepoInfo.owner)}
            onCloneAnother={() => setStep('config')}
          />
        )}

        {activeTab === 'archive' && <CloneArchiveTab repoName={parsedRepoInfo.repo} repoOwner={parsedRepoInfo.owner} />}
        {activeTab === 'selective' && <CloneSelectiveTab repoName={parsedRepoInfo.repo} />}
      </div>

      <CloneQrCodeModal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} url={url} />
    </div>
  );
};

export const CloneScreen = DesktopCloneScreen;
