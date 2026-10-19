import React, { useState } from 'react';
import { useAppContext } from '../../AppContext';
import { Download, Copy, Check, Terminal, ExternalLink, HardDrive } from 'lucide-react';

export const Clone: React.FC = () => {
  const { currentRepo, githubUser, showToast, cloneRepository, navigate } = useAppContext();

  const [repoUrl, setRepoUrl] = useState('');
  const [destName, setDestName] = useState('');
  const [cloneDepth, setCloneDepth] = useState<number | ''>(1);
  const [isCloning, setIsCloning] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Auto-fill destination folder name when URL changes
  const handleUrlChange = (url: string) => {
    setRepoUrl(url);
    const parts = url.trim().replace(/\.git$/, '').split('/');
    const lastPart = parts[parts.length - 1];
    if (lastPart && !destName) {
      setDestName(lastPart);
    }
  };

  const generatedCommand = `git clone ${cloneDepth ? `--depth ${cloneDepth} ` : ''}${repoUrl || 'https://github.com/owner/repository.git'} ${destName || 'my-project'}`;

  const copyCloneCmd = () => {
    navigator.clipboard.writeText(generatedCommand);
    setIsCopied(true);
    showToast('Clone command copied to clipboard!', 'success');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleClone = async () => {
    if (!repoUrl.trim()) {
      showToast('Please enter a Git repository URL', 'warning');
      return;
    }
    setIsCloning(true);
    try {
      const name = destName || repoUrl.split('/').pop()?.replace('.git', '') || 'cloned-repo';
      await cloneRepository({
        url: repoUrl.trim(),
        destFolder: name,
        branch: 'main',
        shallow: cloneDepth === 1,
        submodules: false,
      });
      navigate('repos');
    } catch (err: any) {
      showToast(`Clone error: ${err.message || err}`, 'error');
    } finally {
      setIsCloning(false);
    }
  };

  return (
    <div className="px-4 py-4 space-y-6">
      {/* Title Header */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary tracking-tight">Clone Repository</h2>
        <p className="text-xs text-text-tertiary mt-0.5">
          Download remote repositories into your local browser workspace.
        </p>
      </div>

      {/* Step 1: Remote Repository URL */}
      <div className="bg-surface-1 border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-tertiary">
          <span className="w-5 h-5 rounded-full bg-accent-soft text-accent flex items-center justify-center text-[10px]">1</span>
          <span>Remote Source</span>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Git HTTPS / SSH URL
          </label>
          <input
            type="url"
            placeholder="https://github.com/facebook/react.git"
            value={repoUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            className="w-full h-11 px-3.5 bg-surface-2 border border-border rounded-xl text-xs text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent font-mono transition-colors"
          />
        </div>
      </div>

      {/* Step 2: Destination & Options */}
      <div className="bg-surface-1 border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-tertiary">
          <span className="w-5 h-5 rounded-full bg-accent-soft text-accent flex items-center justify-center text-[10px]">2</span>
          <span>Target Directory & Depth</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Folder Name
            </label>
            <input
              type="text"
              placeholder="my-project"
              value={destName}
              onChange={(e) => setDestName(e.target.value)}
              className="w-full h-11 px-3.5 bg-surface-2 border border-border rounded-xl text-xs text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Clone Depth
            </label>
            <select
              value={cloneDepth}
              onChange={(e) => setCloneDepth(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full h-11 px-3 bg-surface-2 border border-border rounded-xl text-xs text-text-primary outline-none focus:border-accent transition-colors"
            >
              <option value={1}>Shallow (Depth 1 - Fast)</option>
              <option value={5}>Recent (Depth 5)</option>
              <option value={""}>Full History (All commits)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Step 3: Terminal Command Preview */}
      <div className="bg-surface-1 border border-border rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-tertiary">
            <Terminal size={14} className="text-accent" />
            <span>Terminal Command</span>
          </div>
          <button
            onClick={copyCloneCmd}
            className="flex items-center gap-1.5 text-xs text-accent font-semibold hover:underline cursor-pointer"
          >
            {isCopied ? <Check size={13} /> : <Copy size={13} />}
            <span>{isCopied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <div className="p-3 bg-surface-2 rounded-lg border border-border font-mono text-xs text-text-primary break-all">
          {generatedCommand}
        </div>
      </div>

      {/* Step 4: Action Button */}
      <button
        onClick={handleClone}
        disabled={!repoUrl.trim() || isCloning}
        className="w-full h-12 rounded-xl bg-accent hover:opacity-90 disabled:opacity-40 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm shadow-accent/25 active:scale-98 transition-all cursor-pointer"
      >
        <Download size={16} />
        <span>{isCloning ? 'Cloning into Workspace...' : 'Initialize Local Workspace Clone'}</span>
      </button>
    </div>
  );
};

// Aliases
export const MobileClone = Clone;
