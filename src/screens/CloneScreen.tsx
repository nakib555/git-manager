import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../AppContext';
import { 
  GitBranch, Folder, HardDrive, Check, Play, Activity, 
  ExternalLink, Github, Monitor, AlertCircle, Terminal, 
  Settings, Server, Cpu, Database, Trash2, RefreshCw, 
  FileText, ShieldAlert, Wifi, Download, ChevronRight, BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CloneScreen = () => {
  const { 
    cloneRepository, 
    recentClones, 
    openRepo, 
    currentRepo, 
    currentRepoOwner, 
    githubUser,
    addRecentClone,
    showToast
  } = useAppContext();
  
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
  
  // Advanced flags
  const [lfs, setLfs] = useState(true);
  const [sslVerify, setSslVerify] = useState(true);
  const [bandwidthLimit, setBandwidthLimit] = useState<'none' | '1mb' | '5mb' | '10mb'>('none');
  const [autoInstall, setAutoInstall] = useState(true);

  // States
  const [step, setStep] = useState<'config' | 'progress' | 'success'>('config');
  const [progress, setProgress] = useState(0);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Stats / Insights (Mocked but interactive)
  const [stats, setStats] = useState({
    totalCloned: recentClones?.length || 4,
    diskSpaceUsed: '1.24 GB',
    avgCloneSpeed: '12.4 MB/s',
    shallowCount: 2,
  });

  const [activeTab, setActiveTab] = useState<'clone' | 'manager' | 'insights'>('clone');

  // Sync destination name with URL repository name
  useEffect(() => {
    if (url) {
      const parts = url.split('/');
      let name = parts[parts.length - 1] || '';
      if (name.endsWith('.git')) {
        name = name.slice(0, -4);
      }
      if (name && !dest.endsWith(name)) {
        setDest(`/Documents/Projects/${name}`);
      }
    }
  }, [url]);

  // Terminal scroll handler
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs]);

  const handleStartClone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setStep('progress');
    setProgress(0);
    setTerminalLogs([]);

    const repoParts = url.split('/');
    let repoName = repoParts[repoParts.length - 1] || 'repository';
    if (repoName.endsWith('.git')) repoName = repoName.slice(0, -4);

    const logs = [
      `$ git clone ${depth === 'shallow' ? '--depth 1 ' : ''}${submodules ? '--recursive ' : ''}${!sslVerify ? '-c http.sslVerify=false ' : ''}${url} ${dest}`,
      `Cloning into '${dest}'...`,
      `Looking up ${url}...`,
      `Connecting to github.com (140.82.112.4)...`,
      `POST git-upload-pack (gzip mode)`
    ];

    let currentLogIndex = 0;
    const logInterval = setInterval(() => {
      if (currentLogIndex < logs.length) {
        setTerminalLogs(prev => [...prev, logs[currentLogIndex]]);
        currentLogIndex++;
      } else {
        clearInterval(logInterval);
        startProgressSimulation(repoName);
      }
    }, 400);
  };

  const startProgressSimulation = (repoName: string) => {
    let p = 0;
    const progressInterval = setInterval(() => {
      p += Math.random() * 12 + 3;
      if (p > 100) p = 100;

      setProgress(Math.round(p));

      // Append Git output logs dynamically based on progress
      if (p >= 5 && p < 15 && terminalLogs.length === 5) {
        setTerminalLogs(prev => [
          ...prev, 
          `remote: Enumerating objects: 4529, done.`,
          `remote: Counting objects: 100% (4529/4529), done.`
        ]);
      }
      if (p >= 20 && p < 40 && !terminalLogs.some(l => l.includes('Compressing'))) {
        setTerminalLogs(prev => [
          ...prev, 
          `remote: Compressing objects: 100% (1892/1892), done.`
        ]);
      }
      if (p >= 40 && p < 75 && !terminalLogs.some(l => l.includes('Receiving'))) {
        const speed = bandwidthLimit === '1mb' ? '1.00 MB/s' : bandwidthLimit === '5mb' ? '5.00 MB/s' : '15.42 MB/s';
        setTerminalLogs(prev => [
          ...prev, 
          `Receiving objects:  45% (2038/4529), 8.42 MiB | ${speed}`,
          `Receiving objects: 100% (4529/4529), 24.15 MiB | ${speed}, done.`
        ]);
      }
      if (p >= 75 && p < 90 && !terminalLogs.some(l => l.includes('Resolving'))) {
        setTerminalLogs(prev => [
          ...prev, 
          `Resolving deltas: 100% (2482/2482), done.`
        ]);
      }
      if (submodules && p >= 90 && !terminalLogs.some(l => l.includes('Submodule'))) {
        setTerminalLogs(prev => [
          ...prev,
          `Submodule 'themes/dark-theme' registered for path 'themes/dark-theme'`,
          `Cloning into '${dest}/themes/dark-theme'...`,
          `remote: Enumerating objects: 120, done.`,
          `remote: Counting objects: 100% (120/120), done.`,
          `Submodule path 'themes/dark-theme': checked out 'e4f2b1a3d902ff67'`
        ]);
      }
      if (autoInstall && p >= 95 && !terminalLogs.some(l => l.includes('npm install'))) {
        setTerminalLogs(prev => [
          ...prev,
          `$ npm install --no-audit --no-fund`,
          `added 342 packages from 180 contributors and audited 343 packages in 4.2s`,
          `found 0 vulnerabilities`
        ]);
      }

      if (p === 100) {
        clearInterval(progressInterval);
        setTimeout(() => {
          setTerminalLogs(prev => [
            ...prev,
            `Checking out files: 100% (1284/1284), done.`,
            `SUCCESS: Repository cloned successfully in 5.8s.`
          ]);
          // Commit to app state
          cloneRepository({ 
            url, 
            destFolder: dest, 
            branch: branch || 'main', 
            shallow: depth === 'shallow', 
            submodules 
          });
          setStep('success');
          showToast(`Cloned ${repoName} successfully!`);
        }, 800);
      }
    }, 250);
  };

  const handleManualAction = (action: string, repoName: string) => {
    showToast(`Executed mock command: git ${action} on ${repoName}`);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-main text-text-main">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-border pb-4 mb-6 shrink-0">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <HardDrive size={22} className="text-primary" />
            Clone Repository Station
          </h1>
          <p className="text-xs text-text-muted mt-1">Configure advanced cloning operations, run real-time logs, and manage local checkouts.</p>
        </div>

        {/* Action Tabs */}
        <div className="flex border border-border bg-hover/20 rounded-xl p-0.5">
          <button
            onClick={() => setActiveTab('clone')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'clone' ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:text-text-main'}`}
          >
            Clone Sandbox
          </button>
          <button
            onClick={() => setActiveTab('manager')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'manager' ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:text-text-main'}`}
          >
            Local checkouts
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'insights' ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:text-text-main'}`}
          >
            Network Stats
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pr-1 no-scrollbar space-y-6 pb-6">
        {activeTab === 'clone' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left form inputs - 7 Cols */}
            <div className="lg:col-span-7 bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
              {step === 'config' && (
                <form onSubmit={handleStartClone} className="space-y-4">
                  <div className="border border-primary/10 bg-primary/5 p-4 rounded-xl flex gap-3">
                    <ShieldAlert size={18} className="text-primary shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-primary">Intelligent Source Pre-population</h4>
                      <p className="text-[10.5px] text-text-muted leading-relaxed mt-0.5">
                        If you selected or browsed any repository, the system pre-fills the remote Git SSH/HTTPS endpoints and coordinates local relative paths automatically.
                      </p>
                    </div>
                  </div>

                  {/* Repo URL */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">Repository URL</label>
                    <div className="relative">
                      <Github size={16} className="absolute left-3.5 top-[13px] text-text-muted" />
                      <input 
                        type="text" 
                        required
                        placeholder="https://github.com/username/repository.git"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full bg-main/50 text-sm font-semibold pl-10 pr-4 py-3 rounded-xl border border-border/50 focus:outline-none focus:border-primary/50 text-text-main transition-colors"
                      />
                    </div>
                  </div>

                  {/* Destination folder */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">Local Project path</label>
                    <div className="relative">
                      <Folder size={16} className="absolute left-3.5 top-[13px] text-text-muted" />
                      <input 
                        type="text" 
                        required
                        placeholder="/Documents/Projects/my-app"
                        value={dest}
                        onChange={(e) => setDest(e.target.value)}
                        className="w-full bg-main/50 text-sm font-semibold pl-10 pr-4 py-3 rounded-xl border border-border/50 focus:outline-none focus:border-primary/50 text-text-main transition-colors"
                      />
                    </div>
                  </div>

                  {/* Branch and Depth Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">Checkout Branch</label>
                      <div className="relative">
                        <GitBranch size={16} className="absolute left-3.5 top-[13px] text-text-muted" />
                        <input 
                          type="text" 
                          placeholder="main"
                          value={branch}
                          onChange={(e) => setBranch(e.target.value)}
                          className="w-full bg-main/50 text-sm font-semibold pl-10 pr-4 py-3 rounded-xl border border-border/50 focus:outline-none focus:border-primary/50 text-text-main transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">History depth</label>
                      <div className="flex border border-border/50 rounded-xl overflow-hidden bg-main/50 h-[46px]">
                        <button
                          type="button"
                          onClick={() => setDepth('full')}
                          className={`flex-1 text-xs font-bold transition-colors ${depth === 'full' ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-hover'}`}
                        >
                          Full commits
                        </button>
                        <button
                          type="button"
                          onClick={() => setDepth('shallow')}
                          className={`flex-1 text-xs font-bold border-l border-border/50 transition-colors ${depth === 'shallow' ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-hover'}`}
                        >
                          Shallow (--depth 1)
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Advanced git checkboxes */}
                  <div className="pt-2 border-t border-border/50 space-y-3">
                    <span className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-1">Advanced Git Directives</span>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <label className="flex items-center gap-2.5 cursor-pointer bg-main/30 border border-border/40 hover:bg-hover/30 p-3 rounded-xl transition-all">
                        <input 
                          type="checkbox" 
                          checked={submodules}
                          onChange={(e) => setSubmodules(e.target.checked)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary"
                        />
                        <div>
                          <span className="block text-xs font-bold text-text-main">Recursive Submodules</span>
                          <span className="block text-[9.5px] text-text-muted">Clone nested libraries</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-2.5 cursor-pointer bg-main/30 border border-border/40 hover:bg-hover/30 p-3 rounded-xl transition-all">
                        <input 
                          type="checkbox" 
                          checked={lfs}
                          onChange={(e) => setLfs(e.target.checked)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary"
                        />
                        <div>
                          <span className="block text-xs font-bold text-text-main">Support Git LFS</span>
                          <span className="block text-[9.5px] text-text-muted">Pull pointers files</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-2.5 cursor-pointer bg-main/30 border border-border/40 hover:bg-hover/30 p-3 rounded-xl transition-all">
                        <input 
                          type="checkbox" 
                          checked={sslVerify}
                          onChange={(e) => setSslVerify(e.target.checked)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary"
                        />
                        <div>
                          <span className="block text-xs font-bold text-text-main">Strict SSL Check</span>
                          <span className="block text-[9.5px] text-text-muted">Enforce secure certs</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-2.5 cursor-pointer bg-main/30 border border-border/40 hover:bg-hover/30 p-3 rounded-xl transition-all">
                        <input 
                          type="checkbox" 
                          checked={autoInstall}
                          onChange={(e) => setAutoInstall(e.target.checked)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary"
                        />
                        <div>
                          <span className="block text-xs font-bold text-text-main">Auto npm install</span>
                          <span className="block text-[9.5px] text-text-muted">Run post-clone build</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Speed Throttling dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">Network Bandwidth Limit</label>
                    <div className="flex gap-2.5">
                      {[
                        { id: 'none', label: 'No Limit' },
                        { id: '1mb', label: '1 MB/s Throttle' },
                        { id: '5mb', label: '5 MB/s Throttle' },
                        { id: '10mb', label: '10 MB/s Throttle' },
                      ].map((bw) => (
                        <button
                          key={bw.id}
                          type="button"
                          onClick={() => setBandwidthLimit(bw.id as any)}
                          className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${bandwidthLimit === bw.id ? 'bg-primary/10 border-primary text-primary' : 'bg-main/30 border-border/60 text-text-muted hover:bg-hover'}`}
                        >
                          {bw.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submission buttons */}
                  <div className="pt-4 flex gap-3">
                    <button 
                      type="submit"
                      disabled={!url.trim()}
                      className="w-full bg-primary hover:bg-primary-hover text-white text-sm font-bold py-3.5 rounded-xl transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                    >
                      <Download size={16} strokeWidth={2.5} />
                      Initialize Clone Stream
                    </button>
                  </div>
                </form>
              )}

              {/* Progress and Streaming Logs View */}
              {(step === 'progress' || step === 'success') && (
                <div className="space-y-6">
                  {/* Visual loader header */}
                  <div className="flex items-center gap-4 border-b border-border/50 pb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
                      {step === 'progress' ? (
                        <RefreshCw size={24} className="animate-spin" />
                      ) : (
                        <Check size={24} className="text-success stroke-[3]" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-text-main">
                        {step === 'progress' ? 'Active Remote Streaming Pipeline' : 'Cloning Operation Completed'}
                      </h3>
                      <p className="text-[11px] text-text-muted mt-0.5">
                        {step === 'progress' ? `Bandwidth status: ${bandwidthLimit === 'none' ? 'Unlimited' : bandwidthLimit + ' limit'}` : 'Local workspace file indexing completed.'}
                      </p>
                    </div>
                  </div>

                  {/* Progress visual scale */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-semibold text-text-muted">
                      <span>Sync status</span>
                      <span className="font-mono text-primary font-bold">{progress}%</span>
                    </div>
                    <div className="h-3 bg-main border border-border/40 rounded-full overflow-hidden w-full relative">
                      <motion.div 
                        initial={{ width: '0%' }}
                        animate={{ width: `${progress}%` }}
                        className="bg-primary h-full rounded-full transition-all"
                      />
                    </div>
                  </div>

                  {/* Terminal stdout stream console log */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                        <Terminal size={14} className="text-primary" />
                        Live git standard output stream
                      </span>
                      <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 font-mono px-2 py-0.5 rounded-full font-bold animate-pulse">
                        STDOUT CONNECTED
                      </span>
                    </div>

                    <div className="bg-neutral-900 border border-neutral-800 text-neutral-200 font-mono text-[11px] p-4 rounded-xl h-64 overflow-y-auto no-scrollbar space-y-1.5 leading-relaxed shadow-inner">
                      {terminalLogs.map((log, index) => {
                        const isCmd = log && typeof log === 'string' && log.startsWith('$');
                        const isSuccess = log && typeof log === 'string' && log.includes('SUCCESS');
                        return (
                          <div 
                            key={index} 
                            className={`${isCmd ? 'text-primary font-bold' : isSuccess ? 'text-emerald-400 font-semibold border-t border-neutral-800 pt-2.5 mt-2' : 'text-neutral-300'}`}
                          >
                            {log}
                          </div>
                        );
                      })}
                      <div ref={terminalEndRef} />
                    </div>
                  </div>

                  {step === 'success' && (
                    <div className="flex gap-3 pt-2">
                      <button 
                        onClick={() => {
                          const parts = url.split('/');
                          let n = parts[parts.length - 1] || 'repository';
                          if (n.endsWith('.git')) n = n.slice(0, -4);
                          openRepo(n);
                        }}
                        className="flex-1 bg-primary hover:bg-primary-hover text-white py-3.5 px-4 rounded-xl text-xs font-bold transition-all shadow-sm shadow-primary/20 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Folder size={14} /> Open Cloned Repository
                      </button>
                      <button 
                        onClick={() => setStep('config')}
                        className="flex-1 bg-card border border-border hover:bg-hover text-text-main py-3.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw size={14} /> Start New Clone
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Quick Guides and Stats - 5 Cols */}
            <div className="lg:col-span-5 space-y-6">
              {/* Recent Clone Targets card */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3.5">
                <span className="block text-xs font-bold text-text-muted uppercase tracking-wider">Historical Clone cache</span>
                
                {recentClones && recentClones.length > 0 ? (
                  <div className="space-y-2.5">
                    {recentClones.slice(0, 4).map((clone, index) => (
                      <div 
                        key={index}
                        onClick={() => {
                          setUrl(clone.url);
                          setDest(clone.dest);
                        }}
                        className="p-3 bg-main/35 border border-border/50 rounded-xl hover:bg-hover hover:border-primary/30 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-text-main group-hover:text-primary transition-colors truncate max-w-[150px]">{clone.name}</span>
                          <span className="text-[9.5px] text-text-muted font-semibold">{new Date(clone.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p className="text-[10px] text-text-muted font-mono truncate mt-1">{clone.url}</p>
                        <div className="flex items-center gap-1 text-[9.5px] text-text-muted font-medium mt-1.5">
                          <Folder size={10} />
                          <span className="truncate">{clone.dest}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-main/20 border border-dashed border-border/80 rounded-xl">
                    <Folder size={24} className="text-text-muted/60 mx-auto mb-2" />
                    <p className="text-xs text-text-muted font-medium">No prior cloned history recorded</p>
                  </div>
                )}
              </div>

              {/* Developer Command Line Cheat sheet card */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
                <span className="block text-xs font-bold text-text-muted uppercase tracking-wider">Git Clone Command Presets</span>
                
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-main/50 border border-border/40 hover:bg-hover transition-colors">
                    <div className="flex justify-between items-center text-[10.5px] font-bold text-text-main mb-1">
                      <span>Standard HTTPS</span>
                      <button 
                        onClick={() => setUrl('https://github.com/facebook/react.git')}
                        className="text-[9.5px] text-primary hover:underline font-bold"
                      >
                        Load URL
                      </button>
                    </div>
                    <code className="font-mono text-[9px] text-text-muted break-all">git clone https://github.com/facebook/react.git</code>
                  </div>

                  <div className="p-2.5 rounded-xl bg-main/50 border border-border/40 hover:bg-hover transition-colors">
                    <div className="flex justify-between items-center text-[10.5px] font-bold text-text-main mb-1">
                      <span>Shallow Depth 1 (Fast)</span>
                      <button 
                        onClick={() => {
                          setUrl('https://github.com/vuejs/core.git');
                          setDepth('shallow');
                        }}
                        className="text-[9.5px] text-primary hover:underline font-bold"
                      >
                        Load URL
                      </button>
                    </div>
                    <code className="font-mono text-[9px] text-text-muted break-all">git clone --depth 1 https://github.com/vuejs/core.git</code>
                  </div>

                  <div className="p-2.5 rounded-xl bg-main/50 border border-border/40 hover:bg-hover transition-colors">
                    <div className="flex justify-between items-center text-[10.5px] font-bold text-text-main mb-1">
                      <span>Submodules Recursive</span>
                      <button 
                        onClick={() => {
                          setUrl('https://github.com/electron/electron.git');
                          setSubmodules(true);
                        }}
                        className="text-[9.5px] text-primary hover:underline font-bold"
                      >
                        Load URL
                      </button>
                    </div>
                    <code className="font-mono text-[9px] text-text-muted break-all">git clone --recursive https://github.com/electron/electron.git</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'manager' && (
          <div className="space-y-6">
            {/* Intro Header banner */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="font-bold text-sm text-text-main">Local Checked-out repositories directory</h3>
                <p className="text-[11px] text-text-muted mt-0.5">Control, analyze, and manage files cloned to the developer workspace.</p>
              </div>
              <button 
                onClick={() => showToast('Reindexed workspace files.')}
                className="bg-main border border-border hover:border-primary/40 text-text-main hover:text-primary text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <RefreshCw size={13} /> Re-scan directories
              </button>
            </div>

            {/* List of checked out repositories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentClones && recentClones.length > 0 ? (
                recentClones.map((repo, idx) => (
                  <div key={idx} className="bg-card border border-border hover:border-primary/20 rounded-2xl p-5 shadow-sm space-y-4 transition-all">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <HardDrive size={18} />
                        </div>
                        <div className="truncate">
                          <h4 className="font-bold text-xs text-text-main truncate">{repo.name}</h4>
                          <span className="text-[9.5px] font-mono text-text-muted truncate block">{repo.dest}</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase">
                        Indexed
                      </span>
                    </div>

                    <div className="bg-main/40 border border-border/40 rounded-xl p-3 space-y-2">
                      <div className="flex justify-between text-[10px] text-text-muted">
                        <span>Directory size</span>
                        <span className="font-bold text-text-main">{(142.5 + (idx * 23.4)).toFixed(1)} MB</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-text-muted">
                        <span>Branch HEAD</span>
                        <span className="font-bold font-mono text-primary flex items-center gap-1">
                          <GitBranch size={10} /> main
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px] text-text-muted">
                        <span>LFS Status</span>
                        <span className="font-semibold text-text-main">Enabled</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openRepo(repo.name)}
                        className="flex-1 bg-primary/10 text-primary hover:bg-primary hover:text-white py-1.5 rounded-lg text-[10px] font-bold transition-all text-center cursor-pointer"
                      >
                        Open Station
                      </button>
                      <button
                        onClick={() => handleManualAction('fsck', repo.name)}
                        className="px-2.5 border border-border hover:border-text-main/30 text-text-muted hover:text-text-main rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                        title="Run integrity check"
                      >
                        fsck
                      </button>
                      <button
                        onClick={() => handleManualAction('fetch', repo.name)}
                        className="px-2.5 border border-border hover:border-text-main/30 text-text-muted hover:text-text-main rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                        title="Fetch latest refs"
                      >
                        fetch
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 bg-card border border-dashed border-border rounded-2xl">
                  <Folder size={40} className="text-text-muted/50 mx-auto mb-2.5" />
                  <p className="text-sm text-text-muted font-bold">No active local repositories checked-out</p>
                  <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">Click the "Clone Sandbox" tab to spin up a new git download process.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-6">
            {/* Cards for key stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-1.5">
                <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider">Active clones</span>
                <span className="block font-bold text-xl text-text-main">{stats.totalCloned}</span>
                <span className="block text-[9.5px] text-emerald-500 font-semibold flex items-center gap-1 mt-1">
                  <Wifi size={11} /> Ready in local workspace
                </span>
              </div>

              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-1.5">
                <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider">Workspace Disk Allocation</span>
                <span className="block font-bold text-xl text-text-main">{stats.diskSpaceUsed}</span>
                <span className="block text-[9.5px] text-text-muted font-medium mt-1">
                  Average 324.5 MB per checkout
                </span>
              </div>

              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-1.5">
                <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider">Shallow clones saved</span>
                <span className="block font-bold text-xl text-text-main">412.5 MB</span>
                <span className="block text-[9.5px] text-primary font-semibold flex items-center gap-1 mt-1">
                  <Cpu size={11} /> 32% storage compression
                </span>
              </div>

              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-1.5">
                <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider">Average Bandwidth Speed</span>
                <span className="block font-bold text-xl text-text-main">{stats.avgCloneSpeed}</span>
                <span className="block text-[9.5px] text-emerald-500 font-semibold flex items-center gap-1 mt-1">
                  <Wifi size={11} /> Stable 100 Mbps line rate
                </span>
              </div>
            </div>

            {/* Simulated Visual charts / progress reports */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
                <span className="block text-xs font-bold text-text-muted uppercase tracking-wider">Network Throughput Logs</span>
                
                <div className="h-48 flex items-end justify-between pt-4 border-b border-border/60">
                  {[24, 45, 68, 12, 56, 89, 78, 64, 98, 110, 85, 95].map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer px-1">
                      <div className="w-full relative bg-primary/10 rounded-t-md hover:bg-primary/25 transition-colors" style={{ height: `${val}px` }}>
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[9px] font-mono font-bold px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          {val}M
                        </div>
                      </div>
                      <span className="text-[8.5px] font-bold text-text-muted font-mono">{idx + 1}h</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-text-muted font-medium">
                  <span>Throughput sampling history (past 12h)</span>
                  <span>Peak speed: 110 MB/s</span>
                </div>
              </div>

              <div className="lg:col-span-5 bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
                <span className="block text-xs font-bold text-text-muted uppercase tracking-wider">Storage allocation metrics</span>
                
                <div className="space-y-3 pt-2">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-semibold text-text-main">
                      <span>Standard Checked out repos</span>
                      <span>850 MB (68%)</span>
                    </div>
                    <div className="h-2 bg-main rounded-full overflow-hidden w-full">
                      <div className="bg-primary h-full rounded-full" style={{ width: '68%' }} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-semibold text-text-main">
                      <span>Git Submodules directory</span>
                      <span>280 MB (22%)</span>
                    </div>
                    <div className="h-2 bg-main rounded-full overflow-hidden w-full">
                      <div className="bg-sky-500 h-full rounded-full" style={{ width: '22%' }} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-semibold text-text-main">
                      <span>Network Caches & Configs</span>
                      <span>110 MB (10%)</span>
                    </div>
                    <div className="h-2 bg-main rounded-full overflow-hidden w-full">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: '10%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
