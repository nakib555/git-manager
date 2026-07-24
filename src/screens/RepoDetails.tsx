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

const SkeletonDetails: React.FC<{ screen: string }> = ({ screen }) => {
  if (screen === 'files') {
    return (
      <div className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col h-[60vh] animate-pulse">
        {/* Breadcrumb Skeleton */}
        <div className="px-4 py-4 border-b border-border flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-border/60"></div>
          <div className="w-2 bg-border/40 h-3 rounded"></div>
          <div className="w-20 bg-border/60 h-3.5 rounded"></div>
          <div className="w-2 bg-border/40 h-3 rounded"></div>
          <div className="w-24 bg-border/45 h-3.5 rounded"></div>
        </div>
        {/* Pills Skeleton */}
        <div className="flex p-3 gap-2 border-b border-border bg-hover/10 overflow-x-auto no-scrollbar">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="px-4 py-2.5 rounded-full bg-border/50 border border-border/20 w-24 h-7 shrink-0"></div>
          ))}
        </div>
        {/* Code Content Area Skeleton */}
        <div className="flex-1 p-5 bg-hover/5 flex flex-col gap-3 font-mono">
          <div className="flex gap-4">
            <div className="w-4 bg-border/30 h-3 rounded text-right">1</div>
            <div className="w-[80%] bg-border/50 h-3 rounded"></div>
          </div>
          <div className="flex gap-4">
            <div className="w-4 bg-border/30 h-3 rounded text-right">2</div>
            <div className="w-[50%] bg-border/50 h-3 rounded"></div>
          </div>
          <div className="flex gap-4">
            <div className="w-4 bg-border/30 h-3 rounded text-right">3</div>
            <div className="w-[60%] bg-border/50 h-3 rounded"></div>
          </div>
          <div className="flex gap-4">
            <div className="w-4 bg-border/30 h-3 rounded text-right">4</div>
            <div className="w-[30%] bg-border/50 h-3 rounded"></div>
          </div>
          <div className="flex gap-4">
            <div className="w-4 bg-border/30 h-3 rounded text-right">5</div>
            <div className="w-[75%] bg-border/50 h-3 rounded"></div>
          </div>
          <div className="flex gap-4">
            <div className="w-4 bg-border/30 h-3 rounded text-right">6</div>
            <div className="w-[40%] bg-border/50 h-3 rounded"></div>
          </div>
          <div className="flex gap-4">
            <div className="w-4 bg-border/30 h-3 rounded text-right">7</div>
            <div className="w-[55%] bg-border/50 h-3 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'commits') {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        {/* Staging Button Card Skeleton */}
        <div className="flex justify-between items-center bg-card border border-border rounded-xl p-3.5">
          <div className="w-32 bg-border/50 h-3.5 rounded"></div>
          <div className="w-28 bg-border/60 h-8 rounded-xl"></div>
        </div>

        {/* Timeline Commits Skeleton */}
        <div className="pl-5 border-l-2 border-border/60 relative flex flex-col gap-7 pt-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="relative">
              {/* Timeline circle marker */}
              <div className="absolute -left-[27px] top-1.5 w-3 h-3 bg-main border-2 border-border/70 rounded-full z-10"></div>
              
              {/* Commit Hash badge skeleton */}
              <div className="w-20 bg-border/40 border border-border/20 h-6 rounded-lg mb-2"></div>
              
              {/* Commit Message skeleton */}
              <div className="w-[70%] bg-border/60 h-4 rounded mb-2.5"></div>
              
              {/* Commit Author and Meta skeleton */}
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-border/60"></div>
                  <div className="w-24 bg-border/50 h-3 rounded"></div>
                  <div className="w-12 bg-border/30 h-3 rounded"></div>
                </div>
                <div className="w-16 bg-border/60 h-3 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (screen === 'branches') {
    return (
      <div className="animate-pulse flex flex-col gap-4">
        {/* Search Bar Skeleton */}
        <div className="bg-card rounded-xl p-3.5 h-11 border border-border flex items-center gap-3">
          <div className="w-5 h-5 bg-border/50 rounded"></div>
          <div className="w-32 bg-border/40 h-3 rounded"></div>
        </div>
        {/* Branch main Card Skeleton */}
        <div className="flex justify-between items-center bg-card border border-border rounded-xl p-3.5">
          <div className="w-28 bg-border/50 h-3.5 rounded"></div>
          <div className="w-24 bg-border/60 h-8 rounded-xl"></div>
        </div>
        {/* Branch lists Skeleton */}
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-2 bg-card p-4 rounded-2xl border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-border/50 rounded"></div>
                  <div className="w-24 bg-border/60 h-3.5 rounded"></div>
                </div>
                {i === 1 && <div className="w-14 bg-border/40 h-5 rounded-full"></div>}
              </div>
              <div className="w-32 bg-border/40 h-3 rounded mt-0.5"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (screen === 'prs') {
    return (
      <div className="animate-pulse flex flex-col gap-4">
        {/* Tabs Skeleton */}
        <div className="flex border-b border-border gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="py-3.5 flex items-center gap-1.5 border-b-2 border-transparent w-20">
              <div className="w-10 bg-border/60 h-4 rounded"></div>
              <div className="w-6 bg-border/40 h-4.5 rounded-full"></div>
            </div>
          ))}
        </div>
        {/* Merge Button Card Skeleton */}
        <div className="flex justify-between items-center bg-card border border-border rounded-xl p-3.5">
          <div className="w-36 bg-border/50 h-3.5 rounded"></div>
          <div className="w-24 bg-border/60 h-8 rounded-xl"></div>
        </div>
        {/* PR List Skeleton */}
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-4 p-4 border border-border rounded-2xl bg-card">
              <div className="w-5 h-5 bg-border/50 rounded-full shrink-0 mt-0.5"></div>
              <div className="flex-1 flex flex-col gap-2">
                <div className="w-[75%] bg-border/60 h-4 rounded"></div>
                <div className="w-36 bg-border/40 h-3 rounded"></div>
                <div className="flex justify-between items-center mt-2">
                  <div className="w-5 h-5 rounded-full bg-border/50"></div>
                  <div className="w-14 bg-border/40 h-5 rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (screen === 'insights') {
    return (
      <div className="animate-pulse flex flex-col gap-4">
        {/* 3 Metric cards grid skeleton */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card rounded-2xl p-4 border border-border flex flex-col items-center text-center gap-1.5">
              <div className="w-10 bg-border/40 h-2.5 rounded"></div>
              <div className="w-8 bg-border/60 h-5 rounded mt-1"></div>
            </div>
          ))}
        </div>

        {/* Chart Card Skeleton */}
        <div className="bg-card rounded-2xl p-4 border border-border flex flex-col gap-3">
          <div className="w-24 bg-border/50 h-3 rounded"></div>
          <div className="h-[120px] bg-border/10 rounded-xl flex items-end p-2 gap-2">
            {[20, 45, 30, 80, 50, 65, 40, 90, 35, 75, 50, 60].map((h, i) => (
              <div 
                key={i} 
                className="flex-1 bg-border/25 rounded-t animate-pulse"
                style={{ height: `${h}%`, animationDelay: `${i * 75}ms` }}
              ></div>
            ))}
          </div>
        </div>

        {/* Languages breakdown skeleton */}
        <div className="bg-card rounded-2xl p-4 border border-border flex flex-col gap-3">
          <div className="w-20 bg-border/50 h-3 rounded mb-1"></div>
          <div className="flex items-center justify-between">
            {/* Donut skeleton */}
            <div className="w-[92px] h-[92px] rounded-full border-[14px] border-border/25 flex items-center justify-center shrink-0"></div>
            {/* Legend list skeleton */}
            <div className="flex-1 flex flex-col gap-2.5 max-w-[50%] mt-1 ml-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-border/50"></div>
                    <div className="w-14 bg-border/60 h-3 rounded"></div>
                  </div>
                  <div className="w-8 bg-border/40 h-3 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export const RepoDetails: React.FC = () => {
  const { currentScreen, isLoadingRepoDetails, currentRepo, navigate } = useAppContext();

  if (!currentRepo) {
    return (
      <div className="bg-card rounded-2xl border border-border p-8 text-center flex flex-col items-center justify-center my-12 mx-5 animate-fade-up">
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
          <Folder size={24} />
        </div>
        <h3 className="font-semibold text-text-main mb-1 text-sm">No Repository Selected</h3>
        <p className="text-xs text-text-muted max-w-[280px] mb-4">Please select a repository from the list to view its commits, pull requests, files, and branch details.</p>
        <button
          onClick={() => navigate('repos')}
          className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2 rounded-xl active:scale-95 transition-all shadow-sm cursor-pointer"
        >
          View Repositories
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      {isLoadingRepoDetails ? (
        <SkeletonDetails screen={currentScreen} />
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
