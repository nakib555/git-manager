import React, { useState } from 'react';
import { AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useAppContext } from '../AppContext';
import { Home, FileCode, FileText, Copy, GitMerge, AlertTriangle, GitPullRequest, Search, Folder, GitCommit, GitBranch } from 'lucide-react';

const getLanguageColor = (lang: string | null) => {
  if (!lang) return '#8F8F9D';
  const colors: Record<string, string> = {
    TypeScript: '#3178c6',
    JavaScript: '#f7df1e',
    Python: '#3572A5',
    Rust: '#DEA584',
    Swift: '#F05138',
    Go: '#00ADD8',
    Java: '#b07219',
    HTML: '#e34c26',
    CSS: '#563d7c',
  };
  return colors[lang] || '#8F8F9D';
};

export const RepoDetails: React.FC = () => {
  const { currentScreen, isLoadingRepoDetails } = useAppContext();

  return (
    <div className="animate-fade-up">
      {isLoadingRepoDetails ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-10 h-10 border-[3px] border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-text-muted font-semibold uppercase tracking-wider">Syncing details from GitHub...</p>
        </div>
      ) : (
        <>
          {currentScreen === 'files' && <FilesScreen />}
          {currentScreen === 'commits' && <CommitsScreen />}
          {currentScreen === 'branches' && <BranchesScreen />}
          {currentScreen === 'insights' && <InsightsScreen />}
          {currentScreen === 'prs' && <PRsScreen />}
        </>
      )}
    </div>
  );
};

const FilesScreen = () => {
  const { activeFiles, currentRepo } = useAppContext();
  const [selectedFile, setSelectedFile] = useState<string>(activeFiles[0]?.name || '');

  const getSimulatedCode = (fileName: string) => {
    if (!fileName) return '// Select a file to view content';
    if (fileName.toLowerCase().endsWith('.md')) {
      return `# ${currentRepo || 'Repository'}\n\nNo detailed documentation added yet.`;
    }
    return `// Content for ${fileName}\n// No preview content available for this file.`;
  };

  const filesToDisplay = activeFiles;

  if (filesToDisplay.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-8 text-center flex flex-col items-center justify-center my-4">
        <Folder size={32} className="text-text-muted mb-2" />
        <p className="font-semibold text-sm mb-1 text-text-main">No files found</p>
        <p className="text-xs text-text-muted max-w-[260px]">This repository currently has no files loaded.</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col h-[60vh]">
      <div className="px-4 py-3.5 text-xs text-text-muted border-b border-border flex items-center gap-1.5 font-medium">
        <Home size={14} className="text-primary" /> / <span className="text-text-main font-semibold">{currentRepo || 'repo'}</span> / <span className="text-text-main font-semibold">{selectedFile || filesToDisplay[0]?.name}</span>
      </div>
      <div className="flex overflow-x-auto p-3 gap-2 border-b border-border bg-hover/20 no-scrollbar shrink-0">
        {filesToDisplay.map(file => {
          const isSelected = (selectedFile || filesToDisplay[0]?.name) === file.name;
          const Icon = file.type === 'dir' ? Folder : file.name.endsWith('.md') ? FileText : FileCode;
          const iconColor = file.type === 'dir' ? 'text-info' : 'text-primary';
          return (
            <div 
              key={file.name}
              onClick={() => {
                if (file.type === 'file') {
                  setSelectedFile(file.name);
                }
              }}
              className={`border px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer flex items-center gap-1.5 transition-all duration-200 ${isSelected ? 'border-primary/40 text-primary bg-primary/10 shadow-sm' : 'border-border text-text-muted bg-card hover:border-text-muted/40'}`}
            >
              <Icon size={13} className={iconColor} /> {file.name}
            </div>
          );
        })}
      </div>
      <div className="flex-1 font-mono text-[11px] leading-relaxed p-4 overflow-auto bg-hover/10">
        {getSimulatedCode(selectedFile || filesToDisplay[0]?.name).trim().split('\n').map((line, idx) => (
          <div key={idx} className="flex">
            <span className="text-[#4B4B5E] w-6 select-none shrink-0">{idx + 1}</span>
            <span className="text-text-main/90 whitespace-pre">{line}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const CommitsScreen = () => {
  const { activeCommits, openModal } = useAppContext();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center bg-card border border-border rounded-xl p-3 mb-1">
        <span className="text-xs text-text-muted font-semibold uppercase tracking-wider">Ready to record state?</span>
        <button 
          onClick={() => openModal('commit')}
          className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-3 py-2 rounded-xl active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
        >
          <GitCommit size={14} strokeWidth={2.5} /> Commit Changes
        </button>
      </div>

      <div className="pl-5 border-l-2 border-border relative flex flex-col gap-6 pt-2">
        {activeCommits.map((commit, idx) => (
          <CommitItem 
            key={commit.hash + idx} 
            hash={commit.hash} 
            msg={commit.msg} 
            author={commit.author} 
            time={commit.time} 
            add={commit.add} 
            del={commit.del} 
            isPrimary={idx === 0} 
            avatar={commit.avatar}
          />
        ))}
        {activeCommits.length === 0 && (
          <div className="text-center py-8 text-text-muted text-xs font-semibold uppercase tracking-wider">No commits yet. Make your first staging commit!</div>
        )}
      </div>
    </div>
  );
};

const CommitItem = ({ hash, msg, author, time, add, del, isPrimary = false, avatar }: any) => {
  const { showToast } = useAppContext();
  return (
    <div className="relative">
      <div className={`absolute -left-[27px] top-1 w-3 h-3 bg-main border-2 rounded-full z-10 transition-colors ${isPrimary ? 'border-primary' : 'border-text-muted'}`}></div>
      <div 
        className="font-mono font-bold mb-1.5 inline-flex items-center gap-1 px-2.5 py-1 bg-card border border-border rounded-lg cursor-pointer hover:border-primary/40 active:opacity-75 text-xs text-primary transition-all"
        onClick={() => {
          navigator.clipboard.writeText(hash);
          showToast(`Hash ${hash} copied to clipboard`);
        }}
      >
        {hash} <Copy size={11} className="text-text-muted" />
      </div>
      <div className="text-[13px] text-text-main font-semibold mb-2 leading-relaxed">{msg}</div>
      <div className="text-xs text-text-muted flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <img src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${author.split(' ')[0]}`} className="w-5 h-5 rounded-full bg-border" alt="" /> 
          <span className="font-medium text-text-main/80">{author}</span> · {time}
        </div>
        <span className="text-[11px] font-bold text-success flex items-center gap-1">
          {add} <span className={del !== '-0' && del !== '0' ? 'text-danger' : 'text-text-muted'}>{del}</span>
        </span>
      </div>
    </div>
  );
};

const BranchesScreen = () => {
  const { activeBranches, openModal } = useAppContext();
  const [search, setSearch] = useState('');

  const filteredBranches = activeBranches.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <div className="bg-card rounded-xl p-3 flex items-center gap-3 mb-4 border border-border">
        <Search size={20} className="text-text-muted" />
        <input 
          type="text" 
          placeholder="Search branches..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none text-text-main w-full outline-none text-sm placeholder:text-text-muted" 
        />
      </div>
      <div className="flex justify-between items-center bg-card border border-border rounded-xl p-3 mb-4">
        <span className="text-xs text-text-muted font-semibold uppercase tracking-wider">Branch from main</span>
        <button 
          onClick={() => openModal('branch')}
          className="bg-info text-white text-xs font-bold px-3 py-2 rounded-xl active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
        >
          <GitBranch size={14} strokeWidth={2.5} /> New Branch
        </button>
      </div>
      <div className="flex flex-col gap-3">
        {filteredBranches.map(branch => (
          <BranchLabel 
            key={branch.name} 
            title={branch.name} 
            desc={branch.desc || 'Active branch'} 
            isDefault={branch.isDefault} 
            borderColor={branch.borderColor} 
          />
        ))}
        {filteredBranches.length === 0 && (
          <div className="text-center py-8 text-text-muted text-xs font-semibold uppercase tracking-wider">No branches found matching your search.</div>
        )}
      </div>
    </>
  );
};

const BranchLabel = ({ title, desc, isDefault = false, borderColor = 'transparent' }: any) => (
  <div 
    className="flex flex-col gap-1 bg-card p-3.5 rounded-2xl border transition-all" 
    style={{ borderColor: borderColor !== 'transparent' ? borderColor : 'var(--border)' }}
  >
    <div className="text-[14px] font-bold flex items-center justify-between text-text-main">
      <span className="flex items-center gap-1.5"><GitBranch size={14} className="text-primary" /> {title}</span>
      {isDefault && <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-info/10 text-info border border-info/20 font-bold">Default</span>}
    </div>
    <span className="text-[11px] text-text-muted font-medium">{desc}</span>
  </div>
);

const InsightsScreen = () => {
  const { activeLanguages, activeCommits, activePRs } = useAppContext();

  const commitCount = activeCommits.length;
  const uniqueAuthors = new Set(activeCommits.map(c => c.author)).size;
  const mergedPRsCount = activePRs.filter(pr => pr.status === 'Merged').length;

  const pieData = Object.entries(activeLanguages).map(([name, val]) => ({
    name,
    value: val as number,
    color: getLanguageColor(name)
  })).sort((a, b) => b.value - a.value);

  const displayPie = pieData.length > 4 
    ? [...pieData.slice(0, 3), { name: 'Others', value: pieData.slice(3).reduce((acc, curr) => acc + curr.value, 0), color: '#262636' }]
    : pieData;

  const finalTotal = displayPie.reduce((acc, curr) => acc + curr.value, 0) || 1;

  const chartData = commitCount > 0 ? [
    { name: 'Commits', uv: commitCount }
  ] : [
    { name: 'No data', uv: 0 }
  ];

  return (
    <>
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-card rounded-2xl p-3 border border-border flex flex-col items-center text-center">
          <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider mb-1">Commits</span>
          <span className="text-lg font-bold text-text-main">{commitCount}</span>
        </div>
        <div className="bg-card rounded-2xl p-3 border border-border flex flex-col items-center text-center">
          <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider mb-1">Contributors</span>
          <span className="text-lg font-bold text-warning">{uniqueAuthors}</span>
        </div>
        <div className="bg-card rounded-2xl p-3 border border-border flex flex-col items-center text-center">
          <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider mb-1">PRs Merged</span>
          <span className="text-lg font-bold text-text-main">{mergedPRsCount}</span>
        </div>
      </div>
      
      <div className="bg-card rounded-2xl p-4 mb-5 border border-border">
        <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Activity Overview</div>
        <div className="h-[120px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUvIns" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="uv" stroke="#7C3AED" strokeWidth={2.5} fillOpacity={1} fill="url(#colorUvIns)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-4 border border-border">
        <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">Languages</div>
        {displayPie.length === 0 ? (
          <div className="text-xs text-text-muted text-center py-4">No language breakdown available.</div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="w-[100px] h-[100px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={displayPie} innerRadius={28} outerRadius={46} paddingAngle={0} dataKey="value" stroke="none">
                    {displayPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)', fontSize: '11px' }} itemStyle={{ color: 'var(--text-main)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-xs flex flex-col gap-2 w-[50%]">
              {displayPie.map(lang => (
                <div key={lang.name} className="flex justify-between items-center text-text-main/90 font-medium">
                  <span className="font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: lang.color }} />
                    {lang.name}
                  </span> 
                  <span className="text-text-muted font-bold">{Math.round((lang.value / finalTotal) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const PRsScreen = () => {
  const { activePRs, openModal } = useAppContext();
  const [activeTab, setActiveTab] = useState('Open');

  const filteredPRs = activePRs.filter(pr => {
    if (activeTab === 'Open') return pr.status === 'Open' || pr.status === 'Review Req.' || pr.status === 'Draft' || pr.status === 'Approved';
    if (activeTab === 'Merged') return pr.status === 'Merged';
    if (activeTab === 'Closed') return pr.status === 'Closed';
    return true;
  });

  return (
    <>
      <div className="flex border-b border-border mb-4">
        {['Open', 'Merged', 'Closed'].map((tab) => {
          const count = activePRs.filter(pr => {
            if (tab === 'Open') return pr.status === 'Open' || pr.status === 'Review Req.' || pr.status === 'Draft' || pr.status === 'Approved';
            if (tab === 'Merged') return pr.status === 'Merged';
            if (tab === 'Closed') return pr.status === 'Closed';
            return false;
          }).length;
          
          return (
            <div 
              key={tab}
              className={`px-4 py-3 text-[13px] font-semibold relative cursor-pointer transition-colors ${activeTab === tab ? 'text-primary' : 'text-text-muted'}`}
              onClick={() => { setActiveTab(tab); }}
            >
              {tab}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ml-1.5 font-bold ${activeTab === tab ? 'bg-primary/20 text-primary border border-primary/25' : 'bg-hover/40 text-text-muted border border-border'}`}>
                {count}
              </span>
              {activeTab === tab && <div className="absolute -bottom-[1px] left-0 w-full h-[2.5px] bg-primary rounded-t-sm"></div>}
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center bg-card border border-border rounded-xl p-3 mb-4">
        <span className="text-xs text-text-muted font-semibold uppercase tracking-wider">Ready to merge changes?</span>
        <button 
          onClick={() => openModal('pr')}
          className="bg-success text-white text-xs font-bold px-3 py-2 rounded-xl active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
        >
          <GitPullRequest size={14} strokeWidth={2.5} /> Open PR
        </button>
      </div>

      <div className="space-y-3">
        {filteredPRs.map(pr => (
          <div key={pr.id} className="flex gap-3.5 p-4 border border-border rounded-2xl bg-card transition-all hover:border-primary/40">
            <GitPullRequest size={20} className={`${pr.status === 'Open' || pr.status === 'Approved' ? 'text-success' : pr.status === 'Merged' ? 'text-purple-500' : 'text-text-muted'} shrink-0`} strokeWidth={2.5} />
            <div className="flex-1">
              <div className="text-sm font-bold mb-1 leading-snug text-text-main">{pr.title}</div>
              <div className="text-xs text-text-muted mb-3 font-medium">#{pr.id} opened {pr.time} by {pr.author}</div>
              <div className="flex justify-between items-center">
                {pr.avatar ? (
                  <img src={pr.avatar} className="w-5 h-5 rounded-full bg-border" alt="" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-primary/20 text-[9px] font-bold flex items-center justify-center text-primary border border-primary/10">{pr.author.substring(0, 2).toUpperCase()}</div>
                )}
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${pr.status === 'Approved' || pr.status === 'Open' ? 'bg-success/10 text-success border-success/30' : pr.status === 'Merged' ? 'bg-primary/10 text-primary border-primary/30' : 'bg-hover text-text-muted border-border'}`}>
                  {pr.status}
                </span>
              </div>
            </div>
          </div>
        ))}
        {filteredPRs.length === 0 && (
          <div className="text-center py-10 text-text-muted text-xs font-semibold uppercase tracking-wider">No pull requests found.</div>
        )}
      </div>
    </>
  );
};
