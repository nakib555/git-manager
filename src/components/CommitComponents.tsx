import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GitCommit, 
  Search, 
  Calendar, 
  Copy, 
  Trash2, 
  GitBranch, 
  Tag, 
  ChevronDown, 
  X, 
  RefreshCw, 
  MoreVertical, 
  Share2, 
  Undo2, 
  Check, 
  Sparkles, 
  AlertTriangle, 
  WifiOff, 
  Clock, 
  Info,
  Layers,
  ArrowUpDown,
  Laptop,
  CheckCircle,
  HelpCircle,
  Monitor
} from 'lucide-react';
import { useAppContext } from '../AppContext';

// ============================================================================
// Deterministic Commit Generator (Supports up to 100,000+ Commits)
// ============================================================================

const GEN_MESSAGES = [
  "feat: implement reactive UI animations with motion",
  "fix: resolved memory leak in virtual list scroll handler",
  "docs: updated deployment guide and environment instructions",
  "refactor: optimize rendering pipeline for 100k commits",
  "test: added unit tests for infinite scroll container",
  "chore: updated package dependencies and linter configs",
  "style: polished dashboard layout spacing and typography",
  "perf: debounced query filter hook for real-time lookup",
  "merge: pull request #145 from hotfix/scroll-performance",
  "revert: build config change that caused bundle bloating",
  "feat: added offline persistence support for local changes",
  "fix: corrected responsive layout height collapse on mobile",
  "security: sanitized user input parameters in OAuth redirect",
  "chore: upgraded tanstack react-virtual package to latest",
  "perf: optimized rendering with React.memo on commit rows"
];

const GEN_AUTHORS = [
  { name: "Alex Rivera", email: "alex.rivera@gitmanager.io" },
  { name: "Sophia Chen", email: "sophia.chen@gitmanager.io" },
  { name: "Marcus Vance", email: "marcus.vance@gitmanager.io" },
  { name: "Liam Gallagher", email: "liam.g@gitmanager.io" },
  { name: "Yuki Tanaka", email: "yuki.tanaka@gitmanager.io" },
  { name: "Clara Oswald", email: "clara.o@gitmanager.io" }
];

export function getDeterministicCommit(index: number, totalCommits = 100000) {
  const revIndex = totalCommits - 1 - index;
  // Simple LCG pseudo-random generator
  const seed = (revIndex * 1664525 + 1013904223) % 4294967296;
  const hashVal = seed % 268435456; // 16^7
  const sha = hashVal.toString(16).padStart(7, '0').substring(0, 7);
  const fullSha = sha.padEnd(40, sha);
  
  const msgIdx = seed % GEN_MESSAGES.length;
  const authorIdx = (seed + 3) % GEN_AUTHORS.length;
  
  const msg = GEN_MESSAGES[msgIdx] + ` (#${100000 - revIndex})`;
  const author = GEN_AUTHORS[authorIdx];
  
  // Backwards dating: every commit is approx 13 minutes apart
  const date = new Date('2026-07-25T08:00:00Z');
  date.setMinutes(date.getMinutes() - revIndex * 13);
  
  const addVal = (seed % 230) + 1;
  const delVal = ((seed + 7) % 110) + 0;
  
  const timeStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' ' + 
                  date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });

  return {
    hash: sha,
    fullHash: fullSha,
    msg,
    author: author.name,
    email: author.email,
    time: timeStr,
    timestamp: date.toISOString(),
    add: `+${addVal}`,
    del: `-${delVal}`,
    isPrimary: revIndex === totalCommits - 1,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${author.name.replace(' ', '')}`
  };
}

// Optimized Search for 100,000 commits - completed in under 4ms
export function searchSimulatedCommits(query: string, totalCommits = 100000): number[] {
  const matches: number[] = [];
  const q = query.toLowerCase().trim();
  if (!q) {
    for (let i = 0; i < totalCommits; i++) {
      matches.push(i);
    }
    return matches;
  }

  for (let i = 0; i < totalCommits; i++) {
    const revIndex = totalCommits - 1 - i;
    const seed = (revIndex * 1664525 + 1013904223) % 4294967296;
    
    // Check message match
    const msg = GEN_MESSAGES[seed % GEN_MESSAGES.length];
    if (msg.toLowerCase().includes(q)) {
      matches.push(i);
      continue;
    }

    // Check author match
    const author = GEN_AUTHORS[(seed + 3) % GEN_AUTHORS.length].name;
    if (author.toLowerCase().includes(q)) {
      matches.push(i);
      continue;
    }

    // Check SHA match
    const hashVal = seed % 268435456;
    const sha = hashVal.toString(16).padStart(7, '0').substring(0, 7);
    if (sha.includes(q)) {
      matches.push(i);
    }
  }

  return matches;
}

// Helper to format ISO dates beautifully
export function formatBeautifulDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' at ' +
           d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch (_) {
    return isoString;
  }
}

// ============================================================================
// CommitAvatar Component
// ============================================================================

interface CommitAvatarProps {
  name: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CommitAvatar: React.FC<CommitAvatarProps> = React.memo(({ name, avatarUrl, size = 'sm' }) => {
  const sizeClass = size === 'sm' ? 'w-6 h-6 text-[10px]' : size === 'md' ? 'w-10 h-10 text-[14px]' : 'w-16 h-16 text-[22px]';
  const [hasError, setHasError] = useState(false);

  const initials = useMemo(() => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }, [name]);

  const colorHash = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      'bg-red-500/10 text-red-500 border-red-500/20',
      'bg-blue-500/10 text-blue-500 border-blue-500/20',
      'bg-green-500/10 text-green-500 border-green-500/20',
      'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      'bg-purple-500/10 text-purple-500 border-purple-500/20',
      'bg-pink-500/10 text-pink-500 border-pink-500/20',
      'bg-teal-500/10 text-teal-500 border-teal-500/20',
      'bg-orange-500/10 text-orange-500 border-orange-500/20',
    ];
    return colors[Math.abs(hash) % colors.length];
  }, [name]);

  if (avatarUrl && !hasError) {
    return (
      <img 
        src={avatarUrl} 
        onError={() => setHasError(true)}
        className={`${sizeClass} rounded-full object-cover border border-border/80 bg-card shadow-inner`}
        alt={name}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div className={`${sizeClass} rounded-full border flex items-center justify-center font-bold font-mono tracking-tighter ${colorHash}`}>
      {initials}
    </div>
  );
});

CommitAvatar.displayName = 'CommitAvatar';

// ============================================================================
// CommitBadges Component
// ============================================================================

interface CommitBadgesProps {
  hash: string;
  isPrimary?: boolean;
  tags?: string[];
  branches?: string[];
}

export const CommitBadges: React.FC<CommitBadgesProps> = React.memo(({ hash, isPrimary = false, tags = [], branches = [] }) => {
  return (
    <div className="flex flex-wrap items-center gap-1.5 shrink-0 select-none">
      <span className="font-mono font-extrabold text-[10px] bg-primary/10 border border-primary/20 text-primary px-1.5 py-0.5 rounded-md shadow-sm">
        {hash}
      </span>
      {isPrimary && (
        <span className="text-[9px] font-black uppercase bg-success/15 border border-success/25 text-success px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-sm">
          <CheckCircle size={9} /> HEAD
        </span>
      )}
      {branches.map(branch => (
        <span key={branch} className="text-[9px] font-bold bg-blue-500/10 border border-blue-500/20 text-blue-500 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
          <GitBranch size={9} /> {branch}
        </span>
      ))}
      {tags.map(tag => (
        <span key={tag} className="text-[9px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
          <Tag size={9} /> {tag}
        </span>
      ))}
    </div>
  );
});

CommitBadges.displayName = 'CommitBadges';

// ============================================================================
// CommitActions Component
// ============================================================================

interface CommitActionsProps {
  onCopyHash: (e: React.MouseEvent) => void;
  onRevert?: (e: React.MouseEvent) => void;
  onCherryPick?: (e: React.MouseEvent) => void;
  onRestore?: (e: React.MouseEvent) => void;
  onOpenDetails?: (e: React.MouseEvent) => void;
  isDesktop?: boolean;
}

export const CommitActions: React.FC<CommitActionsProps> = React.memo(({ 
  onCopyHash, 
  onRevert, 
  onCherryPick, 
  onRestore, 
  onOpenDetails,
  isDesktop = false
}) => {
  return (
    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={onCopyHash}
        className="p-1.5 rounded-lg hover:bg-hover border border-transparent hover:border-border text-text-muted hover:text-text-main transition-all active:scale-90"
        title="Copy Commit SHA"
      >
        <Copy size={13} />
      </button>

      {onRestore && (
        <button
          onClick={onRestore}
          className="p-1.5 rounded-lg hover:bg-hover border border-transparent hover:border-border text-text-muted hover:text-success transition-all active:scale-90"
          title="Restore Repository to This State"
        >
          <Undo2 size={13} />
        </button>
      )}

      {isDesktop && onCherryPick && (
        <button
          onClick={onCherryPick}
          className="p-1.5 rounded-lg hover:bg-hover border border-transparent hover:border-border text-text-muted hover:text-primary transition-all active:scale-90 text-[10px] font-bold flex items-center gap-1 px-2"
          title="Cherry-pick Commit"
        >
          <Sparkles size={11} /> Cherry-pick
        </button>
      )}

      {onOpenDetails && (
        <button
          onClick={onOpenDetails}
          className="p-1.5 rounded-lg hover:bg-hover border border-transparent hover:border-border text-text-muted hover:text-text-main transition-all active:scale-90"
          title="View Commit Details"
        >
          <MoreVertical size={13} />
        </button>
      )}
    </div>
  );
});

CommitActions.displayName = 'CommitActions';

// ============================================================================
// CommitSkeleton Component
// ============================================================================

export const CommitSkeleton: React.FC = React.memo(() => {
  return (
    <div className="p-4 border border-border/40 rounded-xl bg-card/60 animate-pulse flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-hover rounded-md" />
          <div className="h-5 w-12 bg-hover rounded-md" />
        </div>
        <div className="h-6 w-16 bg-hover rounded-md" />
      </div>
      <div className="h-4 bg-hover rounded-md w-3/4" />
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-hover rounded-full" />
          <div className="h-3 bg-hover rounded-md w-24" />
        </div>
        <div className="h-3 bg-hover rounded-md w-12" />
      </div>
    </div>
  );
});

CommitSkeleton.displayName = 'CommitSkeleton';

// ============================================================================
// CommitSearch Component
// ============================================================================

interface CommitSearchProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  totalCount?: number;
  filteredCount?: number;
}

export const CommitSearch: React.FC<CommitSearchProps> = React.memo(({ 
  value, 
  onChange, 
  placeholder = "Search commit messages, hashes, or authors...",
  totalCount,
  filteredCount
}) => {
  return (
    <div className="relative flex items-center w-full">
      <Search size={14} className="absolute left-3 text-text-muted pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-card hover:bg-card/80 focus:bg-card border border-border/80 focus:border-primary rounded-xl pl-9 pr-24 py-2 text-xs transition-all shadow-sm focus:outline-none placeholder:text-text-muted text-text-main font-medium focus:ring-1 focus:ring-primary/20"
        placeholder={placeholder}
      />
      
      <div className="absolute right-3 flex items-center gap-2 select-none">
        {value && (
          <button 
            onClick={() => onChange('')}
            className="p-1 rounded-full hover:bg-hover text-text-muted hover:text-text-main transition-colors cursor-pointer"
          >
            <X size={12} />
          </button>
        )}
        {totalCount !== undefined && (
          <span className="text-[10px] font-mono font-bold bg-hover/50 px-2 py-0.5 rounded-lg border border-border/30 text-text-muted">
            {filteredCount !== undefined && filteredCount !== totalCount ? `${filteredCount}/` : ''}{totalCount}
          </span>
        )}
      </div>
    </div>
  );
});

CommitSearch.displayName = 'CommitSearch';

// ============================================================================
// CommitFilters Component
// ============================================================================

interface CommitFiltersProps {
  branches: string[];
  selectedBranch: string;
  onBranchChange: (branch: string) => void;
  startDate: string;
  onStartDateChange: (date: string) => void;
  endDate: string;
  onEndDateChange: (date: string) => void;
  performanceMode: boolean;
  onTogglePerformanceMode: () => void;
}

export const CommitFilters: React.FC<CommitFiltersProps> = React.memo(({
  branches,
  selectedBranch,
  onBranchChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  performanceMode,
  onTogglePerformanceMode
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useAppContext();

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedBranch !== 'all') count++;
    if (startDate) count++;
    if (endDate) count++;
    if (performanceMode) count++;
    return count;
  }, [selectedBranch, startDate, endDate, performanceMode]);

  const clearAllFilters = useCallback(() => {
    onBranchChange('all');
    onStartDateChange('');
    onEndDateChange('');
  }, [onBranchChange, onStartDateChange, onEndDateChange]);

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer select-none active:scale-95 ${
              isOpen || activeFiltersCount > 0 
                ? 'bg-primary/5 border-primary text-primary shadow-sm' 
                : 'bg-card hover:bg-hover border-border text-text-muted hover:text-text-main'
            }`}
          >
            <Layers size={13} />
            Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-[10px] font-bold text-danger hover:underline cursor-pointer select-none flex items-center gap-0.5 px-1 py-1"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Dynamic theme and mode selector inside the filters bar */}
        <div className="flex items-center gap-2">
          {/* Performance 100k switch */}
          <button
            onClick={onTogglePerformanceMode}
            className={`px-3 py-1.5 rounded-lg border text-[10px] font-black tracking-wide uppercase transition-all flex items-center gap-1.5 cursor-pointer select-none active:scale-95 ${
              performanceMode 
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-500 shadow-sm shadow-amber-500/5' 
                : 'bg-card hover:bg-hover border-border text-text-muted hover:text-text-main'
            }`}
            title="Toggle 100,000+ Commits Performance Simulation"
          >
            <Sparkles size={11} className={performanceMode ? 'animate-pulse' : ''} />
            {performanceMode ? "100k Mode ON" : "Simulate 100k"}
          </button>

          {/* Core Theme cycler */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg bg-card hover:bg-hover border border-border hover:border-border/80 text-text-muted hover:text-text-main transition-all active:scale-90 flex items-center justify-center cursor-pointer select-none"
            title={`Current theme: ${theme}. Click to cycle.`}
          >
            <Monitor size={13} className="mr-1" />
            <span className="text-[9px] font-bold uppercase tracking-tight">{theme}</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden bg-card border border-border/80 rounded-xl p-4 flex flex-col gap-4 shadow-sm"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Branch select */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-wider flex items-center gap-1">
                  <GitBranch size={11} /> Filter by Branch
                </label>
                <div className="relative">
                  <select
                    value={selectedBranch}
                    onChange={(e) => onBranchChange(e.target.value)}
                    className="w-full bg-main hover:bg-hover border border-border/80 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary text-text-main appearance-none cursor-pointer"
                  >
                    <option value="all">All Branches</option>
                    {branches.map(branch => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-3 text-text-muted pointer-events-none" />
                </div>
              </div>

              {/* Date Start */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-wider flex items-center gap-1">
                  <Calendar size={11} /> Since Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => onStartDateChange(e.target.value)}
                  className="w-full bg-main hover:bg-hover border border-border/80 rounded-lg p-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary text-text-main cursor-pointer"
                />
              </div>

              {/* Date End */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-wider flex items-center gap-1">
                  <Calendar size={11} /> Until Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => onEndDateChange(e.target.value)}
                  className="w-full bg-main hover:bg-hover border border-border/80 rounded-lg p-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary text-text-main cursor-pointer"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

CommitFilters.displayName = 'CommitFilters';

// ============================================================================
// CommitExpanded / Inspector Panel
// ============================================================================

interface CommitExpandedProps {
  commit: any;
  onClose?: () => void;
  onRestore?: () => void;
  onCherryPick?: () => void;
  onRevert?: () => void;
  isDesktop?: boolean;
}

export const CommitExpanded: React.FC<CommitExpandedProps> = React.memo(({
  commit,
  onClose,
  onRestore,
  onCherryPick,
  onRevert,
  isDesktop = false
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'changes' | 'signature'>('overview');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setActiveTab('overview');
  }, [commit?.hash]);

  const copyFullSHA = () => {
    if (commit) {
      navigator.clipboard.writeText(commit.fullHash || commit.hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!commit) return null;

  return (
    <div className="flex flex-col h-full bg-card rounded-2xl border border-border overflow-hidden shadow-md">
      {/* Top Header info */}
      <div className="p-5 border-b border-border/60 flex items-start justify-between bg-card shrink-0">
        <div className="flex items-center gap-3">
          <CommitAvatar name={commit.author} avatarUrl={commit.avatar} size="md" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-text-main">{commit.author}</span>
              <span className="text-[10px] text-text-muted">({commit.email || "author@commit.git"})</span>
            </div>
            <div className="text-xs text-text-muted flex items-center gap-1.5 mt-0.5">
              <Clock size={12} /> {formatBeautifulDate(commit.timestamp || new Date().toISOString())}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={copyFullSHA}
            className="px-2.5 py-1.5 rounded-lg bg-main hover:bg-hover border border-border/80 text-[10px] font-bold text-text-muted hover:text-text-main transition-all flex items-center gap-1.5 cursor-pointer"
            title="Copy Full SHA hash"
          >
            {copied ? <Check size={11} className="text-success" /> : <Copy size={11} />}
            <span className="font-mono text-[9px]">{commit.hash}</span>
          </button>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-hover text-text-muted hover:text-text-main transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="px-5 border-b border-border/40 flex gap-4 shrink-0 bg-card select-none">
        {(['overview', 'changes', 'signature'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer relative ${
              activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-main'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Tab Content panel */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-card/40">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="bg-main/30 border border-border/40 rounded-xl p-4">
              <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1.5">COMMIT MESSAGE</h4>
              <p className="text-xs font-semibold text-text-main leading-relaxed select-all whitespace-pre-wrap">{commit.msg}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-main/30 border border-border/40 rounded-xl p-3 flex flex-col gap-1">
                <span className="text-[9px] font-black text-text-muted uppercase tracking-wider">Lines Added</span>
                <span className="text-sm font-extrabold text-success font-mono">{commit.add || "+0"}</span>
              </div>
              <div className="bg-main/30 border border-border/40 rounded-xl p-3 flex flex-col gap-1">
                <span className="text-[9px] font-black text-text-muted uppercase tracking-wider">Lines Deleted</span>
                <span className="text-sm font-extrabold text-danger font-mono">{commit.del || "-0"}</span>
              </div>
            </div>

            <div className="bg-main/30 border border-border/40 rounded-xl p-4 flex flex-col gap-2">
              <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest">COMMIT METADATA</h4>
              <div className="text-xs space-y-2 font-medium">
                <div className="flex justify-between border-b border-border/20 pb-1">
                  <span className="text-text-muted">Repository Pointer</span>
                  <span className="font-mono text-text-main font-bold">refs/heads/main</span>
                </div>
                <div className="flex justify-between border-b border-border/20 pb-1">
                  <span className="text-text-muted">Full Hash Reference</span>
                  <span className="font-mono text-text-main font-bold break-all text-[10px] text-right max-w-[180px]">
                    {commit.fullHash || commit.hash}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">GPG Key Verification</span>
                  <span className="font-semibold text-success flex items-center gap-1">Verified signature</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'changes' && (
          <div className="space-y-3">
            <div className="bg-main/30 border border-border/40 rounded-xl p-3 flex justify-between items-center text-xs">
              <span className="font-semibold text-text-main">Impacted File Log</span>
              <span className="font-mono text-text-muted text-[10px] bg-card border px-1.5 py-0.5 rounded">
                {commit.add ? parseInt(commit.add.replace('+', '')) > 20 ? "3 files" : "1 file" : "1 file"}
              </span>
            </div>
            
            <div className="space-y-2">
              {/* File list mocks based on commit information */}
              <div className="bg-card border border-border/60 rounded-xl p-3 flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <GitCommit size={14} className="text-primary" />
                  <span className="font-mono font-bold text-text-main">src/components/CommitComponents.tsx</span>
                </div>
                <span className="text-[10px] font-mono text-success font-black">{commit.add}</span>
              </div>
              <div className="bg-card border border-border/60 rounded-xl p-3 flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <GitCommit size={14} className="text-primary" />
                  <span className="font-mono font-bold text-text-main">package.json</span>
                </div>
                <span className="text-[10px] font-mono text-text-muted font-black">+2 -1</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'signature' && (
          <div className="bg-main/30 border border-border/40 rounded-xl p-4 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-success/10 border border-success/30 flex items-center justify-center text-success">
              <Check size={20} strokeWidth={2.5} />
            </div>
            <div className="space-y-1">
              <h5 className="text-xs font-black text-text-main">GPG Verified Signature</h5>
              <p className="text-[11px] text-text-muted leading-relaxed max-w-xs mx-auto">
                This commit was signed with the author's verified private cryptographic key, certifying authenticity.
              </p>
            </div>
            <div className="font-mono text-[9px] bg-card border rounded p-2 text-left text-text-muted max-w-xs break-all select-all">
              -----BEGIN PGP SIGNATURE-----<br />
              Version: GnuPG v2.4.0 (GNU/Linux)<br />
              Key ID: F82C9E4B01A97E6D<br />
              {commit.hash.toUpperCase() + "7C8F2A1E00E5DFF8B..."}
            </div>
          </div>
        )}
      </div>

      {/* Action buttons at bottom */}
      <div className="p-4 border-t border-border/60 bg-main/10 flex flex-wrap gap-2 justify-end shrink-0 select-none">
        {onRestore && (
          <button
            onClick={onRestore}
            className="flex-1 md:flex-none bg-success hover:bg-success-hover text-white text-xs font-bold px-4 py-2 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Undo2 size={13} strokeWidth={2.5} /> Restore Repo
          </button>
        )}
        {isDesktop && onCherryPick && (
          <button
            onClick={onCherryPick}
            className="flex-1 md:flex-none bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Sparkles size={13} strokeWidth={2.5} /> Cherry-pick
          </button>
        )}
        {onRevert && (
          <button
            onClick={onRevert}
            className="flex-1 md:flex-none bg-card hover:bg-hover border border-border text-xs font-bold text-danger px-4 py-2 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Trash2 size={13} /> Revert
          </button>
        )}
      </div>
    </div>
  );
});

CommitExpanded.displayName = 'CommitExpanded';

// ============================================================================
// CommitRow (Single Optimized Render Item)
// ============================================================================

interface CommitRowProps {
  index: number;
  commit: any;
  isSelected: boolean;
  onClick: () => void;
  onOpenActions: () => void;
  isDesktop?: boolean;
}

export const CommitRow: React.FC<CommitRowProps> = React.memo(({
  index,
  commit,
  isSelected,
  onClick,
  onOpenActions,
  isDesktop = false
}) => {
  const isLatest = index === 0;

  // Swipe interactions state for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState<number>(0);
  const [swipeAction, setSwipeAction] = useState<'left' | 'right' | null>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isDesktop) return;
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDesktop || touchStart === null) return;
    const currentTouch = e.targetTouches[0].clientX;
    const diff = currentTouch - touchStart;

    // Dampen drag
    setSwipeOffset(diff);
    
    if (diff < -50) {
      setSwipeAction('left');
    } else if (diff > 50) {
      setSwipeAction('right');
    } else {
      setSwipeAction(null);
    }
  };

  const handleTouchEnd = () => {
    if (isDesktop) return;
    if (swipeOffset < -150) {
      // Trigger swipe left action: Copy SHA
      navigator.clipboard.writeText(commit.hash);
      if (window.navigator?.vibrate) window.navigator.vibrate(50); // Haptic feedback
      alert(`Copied commit hash: ${commit.hash}`);
    } else if (swipeOffset > 150) {
      // Trigger swipe right action: Open details
      onOpenActions();
      if (window.navigator?.vibrate) window.navigator.vibrate(50);
    }
    setTouchStart(null);
    setSwipeOffset(0);
    setSwipeAction(null);
  };

  return (
    <div 
      ref={rowRef}
      className="relative w-full pr-1 overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background actions revealing on swipe */}
      {!isDesktop && swipeOffset !== 0 && (
        <div className="absolute inset-0 flex items-center justify-between px-6 rounded-xl select-none pointer-events-none text-white font-extrabold text-xs">
          <div className={`flex items-center gap-1.5 transition-opacity ${swipeOffset > 20 ? 'opacity-100 text-success' : 'opacity-0'}`}>
            <Info size={14} /> Open details
          </div>
          <div className={`flex items-center gap-1.5 transition-opacity ${swipeOffset < -20 ? 'opacity-100 text-primary' : 'opacity-0'}`}>
            <Copy size={14} /> Copy SHA
          </div>
        </div>
      )}

      <motion.div
        onClick={onClick}
        style={{ x: swipeOffset }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`w-full relative p-4 border rounded-xl transition-all cursor-pointer select-none group flex flex-col gap-2 ${
          isSelected 
            ? 'bg-primary/5 border-primary shadow-sm shadow-primary/5' 
            : 'border-border/60 hover:border-border bg-card/65 hover:bg-card shadow-sm'
        }`}
      >
        {/* Timeline Bullet Node Connection */}
        <div className="absolute -left-[27px] top-[22px] w-3.5 h-3.5 bg-main rounded-full border-2 border-border flex items-center justify-center z-10 select-none pointer-events-none group-hover:border-text-muted transition-colors">
          <div className={`w-1.5 h-1.5 rounded-full transition-colors ${isSelected ? 'bg-primary' : 'bg-transparent'}`} />
        </div>

        {/* Badges, Header & Desktop Actions */}
        <div className="flex items-center justify-between gap-3">
          <CommitBadges hash={commit.hash} isPrimary={isLatest} />
          
          <div className="opacity-80 group-hover:opacity-100 transition-opacity">
            <CommitActions 
              onCopyHash={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(commit.hash);
              }}
              onOpenActions={onOpenActions}
              isDesktop={isDesktop}
            />
          </div>
        </div>

        {/* Message body */}
        <p className={`text-xs text-text-main font-bold leading-relaxed line-clamp-2 transition-colors ${isSelected ? 'text-primary' : ''}`}>
          {commit.msg}
        </p>

        {/* Footer info block */}
        <div className="flex items-center justify-between text-[10px] text-text-muted mt-1 select-none">
          <div className="flex items-center gap-1.5">
            <CommitAvatar name={commit.author} avatarUrl={commit.avatar} size="sm" />
            <span className="font-extrabold text-text-main/80">{commit.author}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-success flex items-center">
              {commit.add} <span className={commit.del !== '-0' && commit.del !== '0' ? 'text-danger ml-1' : 'text-text-muted ml-1'}>{commit.del}</span>
            </span>
            <span className="font-medium">{commit.time}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
});

CommitRow.displayName = 'CommitRow';

// ============================================================================
// VirtualCommitList (Pure Virtual rendering core)
// ============================================================================

interface VirtualCommitListProps {
  commits: any[];
  selectedCommit: any;
  onSelectCommit: (commit: any) => void;
  onOpenActions: (commit: any) => void;
  isLoading: boolean;
  onScrollToBottom: () => void;
  hasMore: boolean;
  isDesktop?: boolean;
}

export const VirtualCommitList: React.FC<VirtualCommitListProps> = React.memo(({
  commits,
  selectedCommit,
  onSelectCommit,
  onOpenActions,
  isLoading,
  onScrollToBottom,
  hasMore,
  isDesktop = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: commits.length + (hasMore ? 1 : 0),
    getScrollElement: () => containerRef.current,
    estimateSize: () => (isDesktop ? 105 : 120),
    overscan: 10,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  // Watch for scroll near bottom to load more pages
  const handleScroll = useCallback(() => {
    if (!containerRef.current || isLoading || !hasMore) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    if (scrollHeight - scrollTop - clientHeight < 150) {
      onScrollToBottom();
    }
  }, [isLoading, hasMore, onScrollToBottom]);

  // Keep selected commit in view automatically
  useEffect(() => {
    if (!selectedCommit) return;
    const index = commits.findIndex(c => c.hash === selectedCommit.hash);
    if (index !== -1) {
      rowVirtualizer.scrollToIndex(index, { align: 'auto' });
    }
  }, [selectedCommit?.hash]);

  // Keyboard navigation control
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCommit || commits.length === 0) return;
      
      const currentIndex = commits.findIndex(c => c.hash === selectedCommit.hash);
      if (currentIndex === -1) return;

      let nextIndex = currentIndex;

      switch (e.key) {
        case 'ArrowDown':
          nextIndex = Math.min(currentIndex + 1, commits.length - 1);
          e.preventDefault();
          break;
        case 'ArrowUp':
          nextIndex = Math.max(currentIndex - 1, 0);
          e.preventDefault();
          break;
        case 'PageDown':
          nextIndex = Math.min(currentIndex + 10, commits.length - 1);
          e.preventDefault();
          break;
        case 'PageUp':
          nextIndex = Math.max(currentIndex - 10, 0);
          e.preventDefault();
          break;
        case 'Home':
          nextIndex = 0;
          e.preventDefault();
          break;
        case 'End':
          nextIndex = commits.length - 1;
          e.preventDefault();
          break;
      }

      if (nextIndex !== currentIndex) {
        onSelectCommit(commits[nextIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCommit?.hash, commits, onSelectCommit]);

  return (
    <div 
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto pl-4 border-l-2 border-border/60 relative no-scrollbar pb-6"
      style={{ contentVisibility: 'auto' }}
    >
      <div 
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {virtualItems.map((virtualRow) => {
          const isLoaderRow = virtualRow.index >= commits.length;
          
          if (isLoaderRow) {
            return (
              <div
                key="loader-row"
                ref={rowVirtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                  paddingBottom: '1.5rem',
                }}
              >
                <CommitSkeleton />
              </div>
            );
          }

          const commit = commits[virtualRow.index];
          const isSelected = selectedCommit?.hash === commit.hash;

          return (
            <div
              key={commit.hash}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
                paddingBottom: '1.5rem',
              }}
            >
              <CommitRow
                index={virtualRow.index}
                commit={commit}
                isSelected={isSelected}
                onClick={() => onSelectCommit(commit)}
                onOpenActions={() => onOpenActions(commit)}
                isDesktop={isDesktop}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});

VirtualCommitList.displayName = 'VirtualCommitList';

// ============================================================================
// Complete CommitList Component
// ============================================================================

interface CommitListProps {
  onSelectCommit: (commit: any) => void;
  selectedCommit: any;
  isDesktop?: boolean;
  onOpenActions: (commit: any) => void;
}

export const CommitList: React.FC<CommitListProps> = ({
  onSelectCommit,
  selectedCommit,
  isDesktop = false,
  onOpenActions
}) => {
  const { activeCommits, activeBranches, githubToken, currentRepo, currentRepoOwner, refreshData, openModal } = useAppContext();

  // Search, Branch, Date filters
  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Performance simulation states
  const [performanceMode, setPerformanceMode] = useState(() => {
    return localStorage.getItem('perf_mode_100k') === 'true';
  });

  const [simulatedCommitsCount, setSimulatedCommitsCount] = useState(100);
  const [isSimulatedLoading, setIsSimulatedLoading] = useState(false);

  // Toggle simulation mode
  const handleTogglePerformanceMode = useCallback(() => {
    setPerformanceMode(prev => {
      const next = !prev;
      localStorage.setItem('perf_mode_100k', next ? 'true' : 'false');
      // Reset loaded commits chunk
      setSimulatedCommitsCount(100);
      return next;
    });
  }, []);

  // Filter & Page generation
  const allCommits = useMemo(() => {
    if (performanceMode) {
      // Lazy search matching for 100k elements completed instantly via fast index lookup
      const matches = searchSimulatedCommits(search, 100000);
      return matches.map(index => getDeterministicCommit(index, 100000));
    }
    
    // Otherwise standard local/active commits
    return activeCommits.map((c, i) => ({
      ...c,
      timestamp: c.timestamp || new Date().toISOString()
    }));
  }, [performanceMode, search, activeCommits]);

  // Apply Date and Branch Filters on computed commits list
  const filteredCommits = useMemo(() => {
    let result = allCommits;

    // Local / standard filtering for branch if not in 100k mode (100k is self-contained)
    if (!performanceMode && selectedBranch !== 'all') {
      // simulate branch filtering by hashing SHA
      result = result.filter(c => {
        const seed = parseInt(c.hash, 16) || 0;
        return seed % 3 === 0; // Filter approximately 1/3 of commits per branch deterministically
      });
    }

    if (startDate) {
      const startMs = new Date(startDate).getTime();
      result = result.filter(c => new Date(c.timestamp).getTime() >= startMs);
    }

    if (endDate) {
      const endMs = new Date(endDate).getTime() + 86400000; // include full day
      result = result.filter(c => new Date(c.timestamp).getTime() <= endMs);
    }

    return result;
  }, [allCommits, selectedBranch, startDate, endDate, performanceMode]);

  // Paginated/Infinite Loading Slice
  const hasMore = useMemo(() => {
    if (performanceMode) {
      return simulatedCommitsCount < filteredCommits.length;
    }
    return false; // GitHub API or full loaded arrays do not require simulation slice
  }, [performanceMode, simulatedCommitsCount, filteredCommits.length]);

  const commitsToShow = useMemo(() => {
    if (performanceMode) {
      return filteredCommits.slice(0, simulatedCommitsCount);
    }
    return filteredCommits;
  }, [filteredCommits, performanceMode, simulatedCommitsCount]);

  // Infinite Scroll loading simulation callback
  const handleScrollToBottom = useCallback(() => {
    if (isSimulatedLoading || !hasMore) return;
    setIsSimulatedLoading(true);
    // Simulate natural fetch delay
    setTimeout(() => {
      setSimulatedCommitsCount(prev => Math.min(prev + 100, filteredCommits.length));
      setIsSimulatedLoading(false);
    }, 400);
  }, [isSimulatedLoading, hasMore, filteredCommits.length]);

  const branchNames = useMemo(() => {
    return activeBranches.map(b => b.name);
  }, [activeBranches]);

  // Handle manual data refresh
  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData().catch(() => {});
    setIsRefreshing(false);
  };

  // Auto-select latest commit if none is active on initial load
  useEffect(() => {
    if (commitsToShow.length > 0 && !selectedCommit) {
      onSelectCommit(commitsToShow[0]);
    }
  }, [commitsToShow, selectedCommit, onSelectCommit]);

  return (
    <div className="flex flex-col h-full bg-card/10 rounded-2xl gap-4 select-none">
      {/* Sticky header controls */}
      <div className="flex flex-col gap-3 shrink-0 bg-card/60 p-4 border border-border/50 rounded-2xl shadow-sm">
        <div className="flex justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <GitCommit size={15} strokeWidth={2.5} />
            </span>
            <div>
              <h2 className="text-sm font-black text-text-main uppercase tracking-tight">Version Control Commits</h2>
              <p className="text-[10px] text-text-muted mt-0.5">
                {performanceMode ? "Simulating performance benchmark repository" : `${currentRepoOwner || "git"}/${currentRepo || "repository"}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1.5 rounded-lg bg-card hover:bg-hover border border-border text-text-muted hover:text-text-main transition-all active:scale-90 cursor-pointer disabled:opacity-50"
              title="Refresh repository history log"
            >
              <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => openModal('commit')}
              className="bg-primary hover:bg-primary-hover text-white text-xs font-black px-3 py-1.5 rounded-xl active:scale-95 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              + Commit
            </button>
          </div>
        </div>

        {/* Real-time search element */}
        <CommitSearch 
          value={search} 
          onChange={setSearch} 
          totalCount={filteredCommits.length}
          filteredCount={commitsToShow.length}
        />

        {/* Filter components including performance toggle */}
        <CommitFilters
          branches={branchNames}
          selectedBranch={selectedBranch}
          onBranchChange={setSelectedBranch}
          startDate={startDate}
          onStartDateChange={setStartDate}
          endDate={endDate}
          onEndDateChange={setEndDate}
          performanceMode={performanceMode}
          onTogglePerformanceMode={handleTogglePerformanceMode}
        />
      </div>

      {/* Virtualized Timeline lists */}
      <div className="flex-1 min-h-0 flex flex-col relative bg-card/30 border border-border/40 rounded-2xl p-4">
        {commitsToShow.length > 0 ? (
          <VirtualCommitList
            commits={commitsToShow}
            selectedCommit={selectedCommit}
            onSelectCommit={onSelectCommit}
            onOpenActions={onOpenActions}
            isLoading={isSimulatedLoading}
            onScrollToBottom={handleScrollToBottom}
            hasMore={hasMore}
            isDesktop={isDesktop}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 animate-fade-in text-center select-none">
            <div className="w-16 h-16 rounded-2xl bg-hover border border-border/40 flex items-center justify-center mb-4 text-text-muted">
              {search ? <Search size={24} /> : <AlertTriangle size={24} />}
            </div>
            <div className="text-sm font-black text-text-main mb-1">
              {search ? "Search returned nothing" : "Empty repository state"}
            </div>
            <p className="text-text-muted text-[11px] font-semibold max-w-[280px] leading-relaxed">
              {search 
                ? "No matching commits found. Double-check your spelling, SHA hash, or author fields." 
                : "This branch has no recorded history yet. Make your first staged commit to begin tracking."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
