import React, { useState } from 'react';
import { AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useAppContext } from '../AppContext';
import { Home, FileCode, FileText, Copy, GitMerge, AlertTriangle, GitPullRequest, Search, Folder } from 'lucide-react';

export const RepoDetails: React.FC = () => {
  const { currentScreen } = useAppContext();

  return (
    <div className="animate-fade-up">
      {currentScreen === 'files' && <FilesScreen />}
      {currentScreen === 'commits' && <CommitsScreen />}
      {currentScreen === 'branches' && <BranchesScreen />}
      {currentScreen === 'insights' && <InsightsScreen />}
      {currentScreen === 'prs' && <PRsScreen />}
    </div>
  );
};

const FilesScreen = () => (
  <div className="bg-card rounded-xl border border-border overflow-hidden flex flex-col h-[65vh]">
    <div className="px-4 py-3 text-xs text-text-muted border-b border-border flex items-center gap-1.5">
      <Home size={14} /> / src / components / <b className="text-text-main">Rocket.tsx</b>
    </div>
    <div className="flex overflow-x-auto p-3 gap-2 border-b border-border bg-hover no-scrollbar shrink-0">
      <div className="border border-border text-text-muted px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap bg-card flex items-center gap-1.5">
        <Folder size={14} className="text-info" /> hooks
      </div>
      <div className="border border-border text-text-muted px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap bg-card flex items-center gap-1.5">
        <Folder size={14} className="text-info" /> utils
      </div>
      <div className="border border-border text-text-muted px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap bg-card flex items-center gap-1.5">
        <FileCode size={14} className="text-blue-500" /> App.tsx
      </div>
      <div className="border border-primary/40 text-primary px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap bg-primary/15 flex items-center gap-1.5">
        <FileCode size={14} className="text-blue-500" /> Rocket.tsx
      </div>
      <div className="border border-border text-text-muted px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap bg-card flex items-center gap-1.5">
        <FileText size={14} className="text-text-muted" /> README.md
      </div>
    </div>
    <div className="flex-1 font-mono text-xs leading-relaxed p-4 overflow-auto bg-hover">
      <div className="flex"><span className="text-[#4B4B5E] w-6 select-none">1</span><span className="text-[#A9B7C6] whitespace-pre"><span className="text-[#CC7832]">import</span> React, {'{'} useState {'}'} <span className="text-[#CC7832]">from</span> <span className="text-[#6A8759]">'react'</span>;</span></div>
      <div className="flex"><span className="text-[#4B4B5E] w-6 select-none">2</span><span className="text-[#A9B7C6] whitespace-pre"><span className="text-[#CC7832]">import</span> {'{'} Engine {'}'} <span className="text-[#CC7832]">from</span> <span className="text-[#6A8759]">'./Engine'</span>;</span></div>
      <div className="flex"><span className="text-[#4B4B5E] w-6 select-none">3</span><span className="text-[#A9B7C6] whitespace-pre"><span className="text-[#CC7832]">import</span> {'{'} Controls {'}'} <span className="text-[#CC7832]">from</span> <span className="text-[#6A8759]">'./Controls'</span>;</span></div>
      <div className="flex"><span className="text-[#4B4B5E] w-6 select-none">4</span><span className="text-[#A9B7C6] whitespace-pre"> </span></div>
      <div className="flex"><span className="text-[#4B4B5E] w-6 select-none">5</span><span className="text-[#A9B7C6] whitespace-pre"><span className="text-[#CC7832]">export const</span> <span className="text-[#FFC66D]">Rocket</span>: React.FC = () <span className="text-[#CC7832]">{'=>'}</span> {'{'}</span></div>
      <div className="flex"><span className="text-[#4B4B5E] w-6 select-none">6</span><span className="text-[#A9B7C6] whitespace-pre">    <span className="text-[#CC7832]">const</span> [thrust, setThrust] = <span className="text-[#FFC66D]">useState</span>(<span className="text-[#6897BB]">0</span>);</span></div>
      <div className="flex"><span className="text-[#4B4B5E] w-6 select-none">7</span><span className="text-[#A9B7C6] whitespace-pre"> </span></div>
      <div className="flex"><span className="text-[#4B4B5E] w-6 select-none">8</span><span className="text-[#A9B7C6] whitespace-pre">    <span className="text-[#CC7832]">return</span> ( </span></div>
      <div className="flex"><span className="text-[#4B4B5E] w-6 select-none">9</span><span className="text-[#A9B7C6] whitespace-pre">        <span className="text-[#E8BF6A]">{'<'}div</span> <span className="text-[#9876AA]">className</span>=<span className="text-[#6A8759]">"rocket-container"</span><span className="text-[#E8BF6A]">{'>'}</span></span></div>
      <div className="flex"><span className="text-[#4B4B5E] w-6 select-none">10</span><span className="text-[#A9B7C6] whitespace-pre">            <span className="text-[#E8BF6A]">{'<'}Engine</span> <span className="text-[#9876AA]">power</span>={'{'}thrust{'}'} <span className="text-[#E8BF6A]">/{'>'}</span></span></div>
      <div className="flex"><span className="text-[#4B4B5E] w-6 select-none">11</span><span className="text-[#A9B7C6] whitespace-pre">            <span className="text-[#E8BF6A]">{'<'}Controls</span> <span className="text-[#9876AA]">onChange</span>={'{'}setThrust{'}'} <span className="text-[#E8BF6A]">/{'>'}</span></span></div>
      <div className="flex"><span className="text-[#4B4B5E] w-6 select-none">12</span><span className="text-[#A9B7C6] whitespace-pre">        <span className="text-[#E8BF6A]">{'</'}div{'>'}</span> </span></div>
      <div className="flex"><span className="text-[#4B4B5E] w-6 select-none">13</span><span className="text-[#A9B7C6] whitespace-pre">    );</span></div>
      <div className="flex"><span className="text-[#4B4B5E] w-6 select-none">14</span><span className="text-[#A9B7C6] whitespace-pre">{'}'};</span></div>
    </div>
  </div>
);

const CommitsScreen = () => {
  const { showToast } = useAppContext();
  return (
    <div className="pl-5 border-l-2 border-border relative flex flex-col gap-6 pt-2">
      <div className="text-xs font-semibold text-text-muted mt-0 mb-[-1rem]">Today</div>
      
      <CommitItem hash="a1b2c3d" msg="feat: add rocket engine controls" author="Tanvir Ahmed" time="2h ago" add="+24" del="-8" isPrimary />
      <CommitItem hash="d4e5f6g" msg="fix: update ignition thrust" author="Minnat Uddin" time="5h ago" add="+12" del="-3" />

      <div className="text-xs font-semibold text-text-muted mb-[-1rem]">Yesterday</div>
      
      <CommitItem hash="h7i8j9k" msg="refactor: optimize fuel consumption logic" author="Hridoy Hasan" time="1d ago" add="+18" del="-4" />
      <CommitItem hash="l0m1n2o" msg="docs: update API documentation" author="Jubayer Hossain" time="1d ago" add="+6" del="-1" />
      <CommitItem hash="p3q4r5s" msg="chore: update dependencies" author="Mim Akter" time="1d ago" add="+3" del="-0" />
    </div>
  );
};

const CommitItem = ({ hash, msg, author, time, add, del, isPrimary = false }: any) => {
  const { showToast } = useAppContext();
  return (
    <div>
      <div className={`absolute -left-[7px] w-3 h-3 bg-main border-2 rounded-full z-10 ${isPrimary ? 'border-primary' : 'border-text-muted'}`}></div>
      <div 
        className="font-semibold mb-1 inline-block px-2 py-1 bg-card rounded-md cursor-pointer active:opacity-70 text-sm"
        onClick={() => showToast(`Commit ${hash} copied to clipboard`)}
      >
        {hash} <Copy size={12} className="inline text-text-muted mb-0.5 ml-1" />
      </div>
      <div className="text-[13px] mb-2 mt-1">{msg}</div>
      <div className="text-xs text-text-muted flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${author.split(' ')[0]}`} className="w-5 h-5 rounded-full bg-border" alt="" /> 
          {author} · {time}
        </div>
        <span className="text-success">{add} <span className={del !== '-0' ? 'text-danger' : 'text-text-muted'}>{del}</span></span>
      </div>
    </div>
  );
};

const BranchesScreen = () => (
  <>
    <div className="bg-card rounded-xl p-3 flex items-center gap-3 mb-4 border border-border">
      <Search size={20} className="text-text-muted" />
      <input type="text" placeholder="Search branches..." className="bg-transparent border-none text-text-main w-full outline-none text-sm placeholder:text-text-muted" />
    </div>
    <div className="relative py-2 flex gap-4">
      <svg className="absolute top-2 left-7 w-[60px] h-[350px] z-0" viewBox="0 0 60 300" fill="none">
        <path d="M15 10 L15 290" stroke="#38BDF8" strokeWidth="2" strokeDasharray="4 4"/>
        <path d="M15 40 C 35 60, 35 120, 35 160 C 35 220, 15 240, 15 260" stroke="#10B981" strokeWidth="2"/>
        <path d="M35 100 C 55 120, 55 160, 35 180" stroke="#A78BFA" strokeWidth="2"/>
        <path d="M15 220 C 40 230, 40 250, 15 270" stroke="#EF4444" strokeWidth="2"/>
        <circle cx="15" cy="20" r="6" fill="#0B0B14" stroke="#38BDF8" strokeWidth="3"/>
        <circle cx="35" cy="70" r="6" fill="#10B981"/>
        <circle cx="55" cy="140" r="6" fill="#0B0B14" stroke="#A78BFA" strokeWidth="3"/>
        <circle cx="35" cy="190" r="6" fill="#10B981"/>
        <circle cx="40" cy="245" r="6" fill="#EF4444"/>
      </svg>
      <div className="flex flex-col gap-[35px] ml-20 z-10 relative -mt-1.5 w-full pr-1">
        <BranchLabel title="main" desc="Production ready environment" isDefault borderColor="#38BDF8" />
        <BranchLabel title="develop" desc="Active development branch" icon={<GitMerge size={14} className="text-text-muted" strokeWidth={3} />} />
        <BranchLabel title="feature/auth" desc="Add OAuth2 authentication" icon={<GitMerge size={14} className="text-text-muted" strokeWidth={3} />} />
        <BranchLabel title="feature/rocket-ui" desc="Improve UI design elements" icon={<GitMerge size={14} className="text-text-muted" strokeWidth={3} />} />
        <BranchLabel title="hotfix/engine-bug" desc="Fix engine thrust calculation issue" icon={<AlertTriangle size={14} className="text-danger" strokeWidth={3} />} />
      </div>
    </div>
  </>
);

const BranchLabel = ({ title, desc, isDefault = false, icon = null, borderColor = 'transparent' }: any) => (
  <div className="flex flex-col gap-0.5 bg-card p-3 rounded-xl border border-border w-full" style={{ borderColor: borderColor !== 'transparent' ? borderColor : undefined }}>
    <span className="text-sm font-semibold flex items-center justify-between">
      {title} 
      {isDefault ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-info/10 text-info font-medium">Default</span> : icon}
    </span>
    <span className="text-[11px] text-text-muted">{desc}</span>
  </div>
);

const insightsData = [
  { name: '1 Jun', uv: 30 },
  { name: '10 Jun', uv: 45 },
  { name: '20 Jun', uv: 40 },
  { name: '30 Jun', uv: 68 },
];
const pieData = [
  { name: 'TypeScript', value: 45, color: '#3178c6' },
  { name: 'JavaScript', value: 30, color: '#f7df1e' },
  { name: 'Python', value: 15, color: '#3572A5' },
  { name: 'Others', value: 10, color: '#262636' },
];

const InsightsScreen = () => (
  <>
    <div className="grid grid-cols-3 gap-3 mb-6">
      <div className="bg-card rounded-2xl p-3 flex flex-col items-center text-center">
        <span className="text-[11px] text-text-muted">Commits</span>
        <span className="text-xl font-bold">68</span>
        <span className="text-[10px] text-success">+15%</span>
      </div>
      <div className="bg-card rounded-2xl p-3 flex flex-col items-center text-center">
        <span className="text-[11px] text-text-muted">Contributors</span>
        <span className="text-xl font-bold text-warning">12</span>
        <span className="text-[10px] text-success">+8%</span>
      </div>
      <div className="bg-card rounded-2xl p-3 flex flex-col items-center text-center">
        <span className="text-[11px] text-text-muted">PRs Merged</span>
        <span className="text-xl font-bold">24</span>
        <span className="text-[10px] text-success">+20%</span>
      </div>
    </div>
    
    <div className="bg-card rounded-3xl p-4 mb-5">
      <div className="text-sm font-semibold mb-2.5">Commits Over Time</div>
      <div className="h-[120px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={insightsData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorUvIns" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="uv" stroke="#7C3AED" strokeWidth={2} fillOpacity={1} fill="url(#colorUvIns)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>

    <div className="bg-card rounded-3xl p-4 flex items-center justify-between">
      <div>
        <div className="text-sm font-semibold mb-4">Languages</div>
        <div className="w-[110px] h-[110px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} innerRadius={35} outerRadius={55} paddingAngle={0} dataKey="value" stroke="none">
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#151522', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} itemStyle={{ color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="text-xs flex flex-col gap-2.5 w-[45%]">
        <div className="flex justify-between"><span className="font-semibold text-[#3178c6]">TypeScript</span> <span>45%</span></div>
        <div className="flex justify-between"><span className="font-semibold text-[#f7df1e]">JavaScript</span> <span>30%</span></div>
        <div className="flex justify-between"><span className="font-semibold text-[#3572A5]">Python</span> <span>15%</span></div>
        <div className="flex justify-between"><span className="font-semibold text-text-muted">Others</span> <span>10%</span></div>
      </div>
    </div>
  </>
);

const PRsScreen = () => {
  const { showToast } = useAppContext();
  const [activeTab, setActiveTab] = useState('Open');

  return (
    <>
      <div className="flex border-b border-border mb-4">
        {['Open', 'Merged', 'Closed'].map((tab, i) => (
          <div 
            key={tab}
            className={`px-4 py-3 text-[13px] font-medium relative cursor-pointer transition-colors ${activeTab === tab ? 'text-primary' : 'text-text-muted'}`}
            onClick={() => { setActiveTab(tab); showToast(`Viewing ${tab} PRs`); }}
          >
            {tab}
            {i === 0 && <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded-full text-[10px] ml-1">3</span>}
            {i === 1 && <span className="bg-white/10 text-white px-1.5 py-0.5 rounded-full text-[10px] ml-1">12</span>}
            {activeTab === tab && <div className="absolute -bottom-[1px] left-0 w-full h-[2px] bg-primary rounded-t-sm"></div>}
          </div>
        ))}
      </div>

      <div className="flex gap-3 p-4 border border-border rounded-2xl mb-3 bg-card">
        <GitPullRequest size={20} className="text-success shrink-0" strokeWidth={3} />
        <div className="flex-1">
          <div className="text-sm font-medium mb-1 leading-snug">Add authentication system via OAuth2</div>
          <div className="text-xs text-text-muted mb-3">#42 opened 2h ago by Tanvir</div>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Mim" className="w-5 h-5 rounded-full border-2 border-card" alt="" />
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Hridoy" className="w-5 h-5 rounded-full border-2 border-card -ml-2" alt="" />
            </div>
            <span className="text-[10px] bg-success/10 text-success px-2 py-0.5 rounded-full border border-success">Approved</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 p-4 border border-border rounded-2xl mb-3 bg-card">
        <GitPullRequest size={20} className="text-text-muted shrink-0" strokeWidth={3} />
        <div className="flex-1">
          <div className="text-sm font-medium mb-1 leading-snug">Fix UI responsiveness issues on mobile</div>
          <div className="text-xs text-text-muted mb-3">#41 opened 5h ago by Mim Akter</div>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Tanvir" className="w-5 h-5 rounded-full border-2 border-card" alt="" />
            </div>
            <span className="text-[10px] bg-white/10 text-white px-2 py-0.5 rounded-full border border-border">Draft</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 p-4 border border-danger rounded-2xl mb-3 bg-card">
        <GitPullRequest size={20} className="text-warning shrink-0" strokeWidth={3} />
        <div className="flex-1">
          <div className="text-sm font-medium mb-1 leading-snug">Update dependencies and packages</div>
          <div className="text-xs text-text-muted mb-3">#40 opened 1d ago by Hridoy Hasan</div>
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-danger flex items-center gap-1"><AlertTriangle size={12} fill="currentColor" /> Conflicts</span>
            <span className="text-[10px] bg-warning/10 text-warning px-2 py-0.5 rounded-full border border-warning">Review Req.</span>
          </div>
        </div>
      </div>
    </>
  );
};
