import React, { useState } from 'react';
import { useAppContext } from '../../AppContext';
import { Download, Copy, Check, Terminal, ExternalLink, HardDrive } from 'lucide-react';

export const MobileClone: React.FC = () => {
  const { currentRepo, githubUser, showToast, createLocalRepo, navigate } = useAppContext();

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

  const handleSimulateClone = () => {
    if (!repoUrl.trim()) return;
    setIsCloning(true);
    setTimeout(() => {
      setIsCloning(false);
      const name = destName || repoUrl.split('/').pop()?.replace('.git', '') || 'cloned-repo';
      createLocalRepo({
        name,
        desc: `Cloned from ${repoUrl}`,
        isPrivate: false,
        lang: 'TypeScript',
      });
      showToast(`Repository "${name}" ready in workspace!`, 'success');
      navigate('repos');
    }, 1200);
  };

  return (
    <div className="px-4 py-4 space-y-6">
      {/* Title Header */}
      <div>
        <h2 className="text-lg font-semibold text-[#F4F4F5] tracking-tight">Clone Repository</h2>
        <p className="text-xs text-[#71717A] mt-0.5">
          Download remote repositories into your local browser workspace.
        </p>
      </div>

      {/* Step 1: Remote Repository URL */}
      <div className="bg-[#121214] border border-[#2A2A2E] rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#71717A]">
          <span className="w-5 h-5 rounded-full bg-[#3B82F6]/15 text-[#3B82F6] flex items-center justify-center text-[10px]">1</span>
          <span>Remote Source</span>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
            Git HTTPS / SSH URL
          </label>
          <input
            type="url"
            placeholder="https://github.com/facebook/react.git"
            value={repoUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            className="w-full h-11 px-3.5 bg-[#0A0A0B] border border-[#2A2A2E] rounded-xl text-xs text-[#F4F4F5] placeholder:text-[#71717A] outline-none focus:border-[#3B82F6] font-mono transition-colors"
          />
        </div>
      </div>

      {/* Step 2: Destination & Options */}
      <div className="bg-[#121214] border border-[#2A2A2E] rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#71717A]">
          <span className="w-5 h-5 rounded-full bg-[#3B82F6]/15 text-[#3B82F6] flex items-center justify-center text-[10px]">2</span>
          <span>Destination & Options</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
              Folder Name
            </label>
            <input
              type="text"
              placeholder="my-project"
              value={destName}
              onChange={(e) => setDestName(e.target.value)}
              className="w-full h-10 px-3 bg-[#0A0A0B] border border-[#2A2A2E] rounded-xl text-xs text-[#F4F4F5] placeholder:text-[#71717A] outline-none focus:border-[#3B82F6] font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
              Clone Depth
            </label>
            <select
              value={cloneDepth}
              onChange={(e) => setCloneDepth(e.target.value ? Number(e.target.value) : '')}
              className="w-full h-10 px-3 bg-[#0A0A0B] border border-[#2A2A2E] rounded-xl text-xs text-[#F4F4F5] outline-none focus:border-[#3B82F6]"
            >
              <option value="1">Shallow (Depth 1)</option>
              <option value="5">Depth 5</option>
              <option value="">Full History</option>
            </select>
          </div>
        </div>
      </div>

      {/* Step 3: Terminal Command & Execution */}
      <div className="bg-[#121214] border border-[#2A2A2E] rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#71717A]">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#3B82F6]/15 text-[#3B82F6] flex items-center justify-center text-[10px]">3</span>
            <span>CLI Command Preview</span>
          </div>
          <button
            onClick={copyCloneCmd}
            className="flex items-center gap-1 text-[11px] font-semibold text-[#3B82F6] hover:text-[#2563EB] cursor-pointer"
          >
            {isCopied ? <Check size={12} className="text-[#22C55E]" /> : <Copy size={12} />}
            <span>{isCopied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <div className="bg-[#0A0A0B] p-3 rounded-xl border border-[#2A2A2E] font-mono text-[11px] text-[#A1A1AA] break-all leading-relaxed select-all">
          <span className="text-[#3B82F6]">$</span> {generatedCommand}
        </div>

        <button
          onClick={handleSimulateClone}
          disabled={!repoUrl.trim() || isCloning}
          className="w-full h-12 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold text-xs rounded-xl shadow-sm shadow-[#3B82F6]/25 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
        >
          <Download size={15} />
          <span>{isCloning ? 'Cloning to Workspace...' : 'Clone Repository Now'}</span>
        </button>
      </div>
    </div>
  );
};
