import React, { useState, useEffect } from 'react';
import { useAppContext } from '../AppContext';
import { 
  X, GitBranch, Folder, HardDrive, Check, Play, Activity, 
  ExternalLink, Github, Monitor, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CloneModal = () => {
  const { closeModal, cloneRepository, recentClones, openRepo, currentRepo, currentRepoOwner, githubUser } = useAppContext();
  
  const getRepoUrl = () => {
    if (currentRepo && currentRepoOwner) {
      return `https://github.com/${currentRepoOwner}/${currentRepo}.git`;
    }
    if (currentRepo) {
      const owner = githubUser?.login || "mockuser";
      return `https://github.com/${owner}/${currentRepo}.git`;
    }
    return '';
  };
  
  const [url, setUrl] = useState(getRepoUrl());
  const [dest, setDest] = useState(currentRepo ? `/Documents/Projects/${currentRepo}` : '/Documents/Projects/');
  const [branch, setBranch] = useState('');
  const [depth, setDepth] = useState<'full' | 'shallow'>('full');
  const [submodules, setSubmodules] = useState(true);

  const [step, setStep] = useState<'config' | 'progress' | 'success'>('config');
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('Starting...');

  // Mock cloning process
  useEffect(() => {
    let timer: any;
    if (step === 'progress') {
      let p = 0;
      timer = setInterval(() => {
        p += Math.random() * 8 + 2;
        if (p > 100) p = 100;
        
        setProgress(p);
        
        if (p < 30) setProgressText('Receiving objects...');
        else if (p < 60) setProgressText('Resolving deltas...');
        else if (p < 95) setProgressText('Checking out files...');
        else setProgressText('Finalizing...');

        if (p === 100) {
          clearInterval(timer);
          setTimeout(() => {
            cloneRepository({ url, destFolder: dest, branch, shallow: depth === 'shallow', submodules });
            setStep('success');
          }, 500);
        }
      }, 300);
    }
    return () => clearInterval(timer);
  }, [step]);

  const handleStartClone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setStep('progress');
  };

  const setRecentClone = (rcUrl: string, rcDest: string) => {
    setUrl(rcUrl);
    setDest(rcDest);
  };

  return (
    <div className="space-y-4">
      {step === 'config' && (
        <form onSubmit={handleStartClone} className="space-y-4 animate-fade-in">
          {recentClones && recentClones.length > 0 && !url && (
            <div className="mb-4">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 block">Recent Clones</label>
              <div className="space-y-2">
                {recentClones.slice(0, 3).map((rc, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setRecentClone(rc.url, rc.dest)}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-border/50 bg-main/30 hover:bg-hover cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Folder size={12} />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-text-main group-hover:text-primary transition-colors truncate">{rc.name}</div>
                        <div className="text-[10px] text-text-muted truncate">{rc.url}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Repository URL</label>
            <input 
              type="text" 
              placeholder="https://github.com/user/project.git"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-main/50 text-sm font-semibold px-4 py-3 rounded-xl border border-border/50 focus:outline-none focus:border-primary/50 text-text-main transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Destination Folder</label>
            <div className="relative">
              <Folder className="absolute left-3.5 top-[13px] text-text-muted" size={16} />
              <input 
                type="text" 
                value={dest}
                onChange={(e) => setDest(e.target.value)}
                className="w-full bg-main/50 text-sm font-semibold pl-10 pr-4 py-3 rounded-xl border border-border/50 focus:outline-none focus:border-primary/50 text-text-main transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Branch (Optional)</label>
            <div className="relative">
              <GitBranch className="absolute left-3.5 top-[13px] text-text-muted" size={16} />
              <input 
                type="text" 
                placeholder="Default"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full bg-main/50 text-sm font-semibold pl-10 pr-4 py-3 rounded-xl border border-border/50 focus:outline-none focus:border-primary/50 text-text-main transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Depth</label>
            <div className="flex border border-border/50 rounded-xl overflow-hidden bg-main/50">
              <button
                type="button"
                onClick={() => setDepth('full')}
                className={`flex-1 py-2.5 text-xs font-bold transition-colors ${
                  depth === 'full' ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-hover'
                }`}
              >
                Full History
              </button>
              <button
                type="button"
                onClick={() => setDepth('shallow')}
                className={`flex-1 py-2.5 text-xs font-bold border-l border-border/50 transition-colors ${
                  depth === 'shallow' ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-hover'
                }`}
              >
                Latest Commit Only
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-2">
            <input 
              type="checkbox" 
              checked={submodules}
              onChange={(e) => setSubmodules(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary"
            />
            <span className="text-xs font-semibold text-text-main">Recursive Submodules</span>
          </label>

          <div className="flex gap-3 pt-4 border-t border-border/40">
             <button 
                type="button"
                onClick={closeModal}
                className="flex-1 bg-card border border-border hover:bg-hover text-text-main text-sm font-bold py-3 rounded-xl transition-all cursor-pointer shadow-sm"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={!url.trim()}
                className="flex-[2] bg-primary hover:bg-primary-hover text-white font-semibold text-sm py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <HardDrive size={16} strokeWidth={2.5} /> Clone Repository
              </button>
          </div>
        </form>
      )}

      {step === 'progress' && (
        <div className="py-8 space-y-6 animate-fade-in text-center">
          <Activity size={40} className="text-primary mx-auto animate-pulse" />
          <div>
             <h3 className="text-lg font-bold text-text-main mb-1">Cloning repository...</h3>
             <p className="text-xs text-text-muted">{progressText}</p>
          </div>

          <div className="px-4">
             <div className="flex h-2 rounded-full overflow-hidden w-full bg-main border border-border/50 mb-2">
                 <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="bg-primary h-full" 
                 />
             </div>
             <div className="text-xs font-mono font-bold text-primary">{Math.round(progress)}%</div>
          </div>

          <button 
            onClick={closeModal}
            className="text-xs font-bold text-danger hover:text-rose-600 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}

      {step === 'success' && (
        <div className="py-6 space-y-6 animate-fade-in text-center">
          <div className="w-16 h-16 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto">
             <Check size={32} strokeWidth={3} />
          </div>
          <div>
             <h3 className="text-lg font-bold text-text-main mb-1">Repository Cloned!</h3>
             <p className="text-xs text-text-muted">Successfully cloned to <code className="font-mono text-[10px] bg-main px-1 py-0.5 rounded border border-border">{dest}</code></p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-border/40 text-left">
             <button onClick={() => {
                 closeModal();
                 const parts = url.split('/');
                 let n = parts[parts.length - 1] || 'repo';
                 if (n.endsWith('.git')) n = n.slice(0, -4);
                 openRepo(n);
             }} className="flex items-center gap-3 p-3 bg-card border border-border hover:border-primary/50 hover:bg-primary/5 rounded-xl transition-all cursor-pointer group">
                <Folder size={18} className="text-primary" />
                <span className="text-xs font-bold text-text-main group-hover:text-primary transition-colors">Open Repository</span>
             </button>
             <button onClick={() => {
                 closeModal();
             }} className="flex items-center gap-3 p-3 bg-card border border-border hover:border-text-main/50 hover:bg-hover rounded-xl transition-all cursor-pointer group">
                <Monitor size={18} className="text-text-muted" />
                <span className="text-xs font-bold text-text-main">Open in Git Manager</span>
             </button>
             <button onClick={() => {
                 closeModal();
                 window.open(`${url.replace('.git', '')}#readme`, '_blank');
             }} className="flex items-center gap-3 p-3 bg-card border border-border hover:border-text-main/50 hover:bg-hover rounded-xl transition-all cursor-pointer group">
                <ExternalLink size={18} className="text-text-muted" />
                <span className="text-xs font-bold text-text-main">View README</span>
             </button>
             <button onClick={() => {
                 closeModal();
                 window.open(url.replace('.git', ''), '_blank');
             }} className="flex items-center gap-3 p-3 bg-card border border-border hover:border-text-main/50 hover:bg-hover rounded-xl transition-all cursor-pointer group">
                <Github size={18} className="text-text-muted" />
                <span className="text-xs font-bold text-text-main">Open GitHub</span>
             </button>
          </div>
        </div>
      )}
    </div>
  );
};
