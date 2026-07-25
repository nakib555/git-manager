import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../AppContext';
import { 
  GitPullRequest, 
  MessageSquare, 
  GitCommit, 
  FileCode, 
  ArrowLeft, 
  Check, 
  X, 
  Clock, 
  CornerDownRight, 
  User, 
  Tag, 
  Milestone, 
  ChevronRight, 
  Send, 
  AlertTriangle,
  GitMerge,
  ExternalLink,
  Clipboard,
  RefreshCw,
  Plus,
  Trash2,
  Lock,
  Settings,
  Search,
  BookOpen,
  CheckCircle,
  HelpCircle,
  Hash,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  FolderOpen,
  Eye,
  EyeOff,
  UserPlus,
  Bookmark,
  Sparkles,
  MessageCircle,
  CheckSquare,
  Square
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CiCdPipelineFlow, CiCdBadge, useCiCdStatus } from '../../components/commit/CiCdStatus';

// ----------------------------------------------------------------------
// Interfaces & Dummy Generators
// ----------------------------------------------------------------------
interface PRCommit {
  hash: string;
  msg: string;
  author: string;
  time: string;
}

interface PRFile {
  filename: string;
  additions: number;
  deletions: number;
  patch: string;
}

interface Comment {
  id: number;
  author: string;
  avatar?: string;
  time: string;
  text: string;
  isSystem?: boolean;
  type?: 'comment' | 'approve' | 'request_changes';
}

interface InlineComment {
  id: number;
  author: string;
  avatar?: string;
  time: string;
  text: string;
}

const getPRCommits = (prId: number, title: string): PRCommit[] => {
  const cleanTitle = title || "changes";
  const baseHash = (prId * 4321).toString(16).padStart(7, '0');
  
  return [
    {
      hash: `f7a${baseHash.substring(0, 4)}`,
      msg: `feat: initial implementation of ${cleanTitle.toLowerCase()}`,
      author: 'git-manager-workstation',
      time: '2 days ago'
    },
    {
      hash: `9c2${baseHash.substring(1, 4) || 'ab'}`,
      msg: `test: add comprehensive unit test suite for validation`,
      author: 'git-manager-workstation',
      time: '1 day ago'
    },
    {
      hash: `3b4${baseHash.substring(2, 5) || 'cd'}`,
      msg: `docs: update system documentation and README config rules`,
      author: 'git-manager-workstation',
      time: '12 hours ago'
    }
  ];
};

const getPRFiles = (prId: number, title: string): PRFile[] => {
  const cleanTitle = title || "changes";
  const mainModule = cleanTitle.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  
  return [
    {
      filename: `src/components/${mainModule || 'Feature'}.tsx`,
      additions: 42,
      deletions: 12,
      patch: `@@ -1,15 +1,45 @@
 import React, { useState } from 'react';
+import { Shield, Sparkles } from 'lucide-react';
 
-export const ${mainModule || 'Feature'} = () => {
-  return <div>Feature</div>;
-};
+export interface ${mainModule || 'Feature'}Props {
+  enabled?: boolean;
+  onComplete?: () => void;
+}
+
+export const ${mainModule || 'Feature'} = ({ enabled = true, onComplete }: ${mainModule || 'Feature'}Props) => {
+  const [status, setStatus] = useState<'idle' | 'executing'>('idle');
+
+  const handleAction = async () => {
+    setStatus('executing');
+    setTimeout(() => {
+      setStatus('idle');
+      onComplete?.();
+    }, 1500);
+  };
+
+  return (
+    <div className="p-6 border border-border bg-card rounded-2xl">
+      <div className="flex items-center gap-3">
+        <Shield className="text-primary animate-pulse" size={20} />
+        <h3 className="font-bold text-text-main">${title}</h3>
+      </div>
+      <p className="text-xs text-text-muted mt-2">
+        Autonomous verification engine compiled successfully.
+      </p>
+      <button 
+        onClick={handleAction}
+        className="mt-4 bg-primary text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-primary-hover"
+      >
+        {status === 'executing' ? 'Processing...' : 'Execute'}
+      </button>
+    </div>
+  );
+};`
    },
    {
      filename: `src/tests/${mainModule || 'Feature'}.test.tsx`,
      additions: 18,
      deletions: 2,
      patch: `@@ -1,5 +1,21 @@
 import { describe, it, expect } from 'vitest';
+import { render, screen } from '@testing-library/react';
+import { ${mainModule || 'Feature'} } from '../components/${mainModule || 'Feature'}';
 
 describe('${mainModule || 'Feature'} component', () => {
-  it('renders standard state', () => {});
+  it('renders title and details correctly', () => {
+    render(<${mainModule || 'Feature'} />);
+    expect(screen.getByText('${title}')).toBeInTheDocument();
+  });
+
+  it('responds to user click actions', () => {
+    const spy = vi.fn();
+    render(<${mainModule || 'Feature'} onComplete={spy} />);
+    screen.getByRole('button').click();
+  });
+});`
    },
    {
      filename: `src/docs/${mainModule || 'Feature'}.md`,
      additions: 15,
      deletions: 0,
      patch: `@@ -0,0 +1,15 @@
+# ${title}
+
+System module designed to streamline operational workflows.
+
+## Core Integration Guide
+
+1. Mount component within root screen.
+2. Define \`enabled\` flags appropriately.
+3. Setup callbacks for state changes.
+
+## Architecture Specifications
+- Standard responsive light schematics
+- Sub-millisecond lazy loading trigger hooks
+- Deeply integrated linter validation`
    }
  ];
};

export const PRsScreen = () => {
  const { 
    activePRs, 
    openModal, 
    updateLocalPRStatus, 
    theme, 
    currentRepo, 
    githubUser 
  } = useAppContext();

  // Navigation and Query States
  const [activeTab, setActiveTab] = useState<'Open' | 'Merged' | 'Closed'>('Open');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPRId, setSelectedPRId] = useState<number | null>(null);
  
  // Advanced Filter states
  const [filterAuthor, setFilterAuthor] = useState('All');
  const [filterLabel, setFilterLabel] = useState('All');
  const [filterAssignee, setFilterAssignee] = useState('All');
  const [filterMilestone, setFilterMilestone] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'comments_desc' | 'comments_asc'>('newest');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Bulk Edit States
  const [selectedPRIds, setSelectedPRIds] = useState<number[]>([]);

  // PR Details states
  const [detailTab, setDetailTab] = useState<'conversation' | 'commits' | 'files'>('conversation');
  const [customComments, setCustomComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [mergeStrategy, setMergeStrategy] = useState<'merge' | 'squash' | 'rebase'>('merge');
  const [customMergeTitle, setCustomMergeTitle] = useState('');
  const [customMergeDesc, setCustomMergeDesc] = useState('');
  const [isMerging, setIsMerging] = useState(false);
  const [isCopiedCommand, setIsCopiedCommand] = useState(false);

  // Files Tab States
  const [activeFileInTree, setActiveFileInTree] = useState<string>('');
  const [viewedFiles, setViewedFiles] = useState<Record<string, boolean>>({});
  const [inlineComments, setInlineComments] = useState<Record<string, InlineComment[]>>({});
  const [inlineInputLine, setInlineInputLine] = useState<{ filename: string; lineIndex: number } | null>(null);
  const [inlineCommentText, setInlineCommentText] = useState('');

  // Submit Review Flow States
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<'comment' | 'approve' | 'request_changes'>('comment');
  const [reviewBody, setReviewBody] = useState('');

  // Mobile Bottom Sheet drawer state
  const [isMobileMetadataOpen, setIsMobileMetadataOpen] = useState(false);

  // Selected PR
  const selectedPR = activePRs.find(pr => pr.id === selectedPRId);

  // Reset states on PR change
  useEffect(() => {
    if (selectedPR) {
      setCustomMergeTitle(`Merge pull request #${selectedPR.id} from ${selectedPR.source}`);
      setCustomMergeDesc(`Integrating changes into branch ${selectedPR.target}`);
      setIsReviewFormOpen(false);
      setReviewBody('');
      setReviewStatus('comment');
      
      const files = getPRFiles(selectedPR.id, selectedPR.title);
      if (files.length > 0) {
        setActiveFileInTree(files[0].filename);
      }
      
      // Load inline comments
      const storedInline = localStorage.getItem(`local_pr_inline_comments_${currentRepo}_${selectedPR.id}`);
      if (storedInline) {
        try {
          setInlineComments(JSON.parse(storedInline));
        } catch (e) {
          setInlineComments({});
        }
      } else {
        setInlineComments({});
      }

      // Load viewed files
      const storedViewed = localStorage.getItem(`local_pr_viewed_files_${currentRepo}_${selectedPR.id}`);
      if (storedViewed) {
        try {
          setViewedFiles(JSON.parse(storedViewed));
        } catch (e) {
          setViewedFiles({});
        }
      } else {
        setViewedFiles({});
      }
    }
  }, [selectedPRId, currentRepo]);

  // Load custom comments from localStorage
  useEffect(() => {
    if (selectedPRId && currentRepo) {
      const stored = localStorage.getItem(`local_pr_comments_${currentRepo}_${selectedPRId}`);
      if (stored) {
        try {
          setCustomComments(JSON.parse(stored));
        } catch (e) {
          setCustomComments([]);
        }
      } else {
        // Initial fallback developer timeline comments
        const initialTimeline: Comment[] = [
          {
            id: 1,
            author: selectedPR?.author || 'developer',
            avatar: selectedPR?.avatar,
            time: 'Yesterday',
            text: `I've finished implementing the main controller architecture and added basic validation checks. Please review!`,
            type: 'comment'
          },
          {
            id: 2,
            author: 'lead-architect',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop',
            time: '18 hours ago',
            text: `The design structure looks clean. I ran the linter check and everything is in order. Make sure the unit tests run green on the runner pipeline before we merge!`,
            type: 'comment'
          }
        ];
        localStorage.setItem(`local_pr_comments_${currentRepo}_${selectedPRId}`, JSON.stringify(initialTimeline));
        setCustomComments(initialTimeline);
      }
    }
  }, [selectedPRId, currentRepo]);

  // Handle adding comments
  const handleAddComment = () => {
    if (!newCommentText.trim() || !selectedPRId || !currentRepo) return;

    const newComment: Comment = {
      id: Date.now(),
      author: githubUser?.login || 'git-manager-workstation',
      avatar: githubUser?.avatar_url,
      time: 'Just now',
      text: newCommentText.trim(),
      type: 'comment'
    };

    const updatedComments = [...customComments, newComment];
    setCustomComments(updatedComments);
    localStorage.setItem(`local_pr_comments_${currentRepo}_${selectedPRId}`, JSON.stringify(updatedComments));
    setNewCommentText('');
  };

  // Submit complete review changes
  const handleSubmitReview = () => {
    if (!selectedPRId || !currentRepo) return;
    const authorName = githubUser?.login || 'git-manager-workstation';
    
    let sysText = '';
    if (reviewStatus === 'approve') {
      sysText = `approved these changes`;
    } else if (reviewStatus === 'request_changes') {
      sysText = `requested changes`;
    } else {
      sysText = `submitted a review`;
    }

    const reviewComment: Comment = {
      id: Date.now(),
      author: authorName,
      avatar: githubUser?.avatar_url,
      time: 'Just now',
      text: reviewBody.trim() || (reviewStatus === 'approve' ? 'Looks good to me! Approved.' : 'Needs minor adjustments before merge.'),
      type: reviewStatus,
      isSystem: false // Render as review card with custom status bubble
    };

    const systemEvent: Comment = {
      id: Date.now() + 1,
      author: authorName,
      time: 'Just now',
      text: sysText,
      isSystem: true,
      type: reviewStatus
    };

    const updatedComments = [...customComments, reviewComment, systemEvent];
    setCustomComments(updatedComments);
    localStorage.setItem(`local_pr_comments_${currentRepo}_${selectedPRId}`, JSON.stringify(updatedComments));

    // If approved, update status to "Approved" locally
    if (reviewStatus === 'approve') {
      // Simulate review approval status locally
      const updatedPRs = activePRs.map(item => {
        if (item.id === selectedPRId) {
          return { ...item, status: 'Approved' };
        }
        return item;
      });
      // Sync state back
      localStorage.setItem(`local_details_${currentRepo}_prs`, JSON.stringify(updatedPRs));
      if (selectedPR) selectedPR.status = 'Approved';
    } else if (reviewStatus === 'request_changes') {
      const updatedPRs = activePRs.map(item => {
        if (item.id === selectedPRId) {
          return { ...item, status: 'Review Req.' };
        }
        return item;
      });
      localStorage.setItem(`local_details_${currentRepo}_prs`, JSON.stringify(updatedPRs));
      if (selectedPR) selectedPR.status = 'Review Req.';
    }

    setIsReviewFormOpen(false);
    setReviewBody('');
  };

  // Handle PR merging simulation
  const handleMergePR = () => {
    if (!selectedPRId) return;
    setIsMerging(true);
    
    setTimeout(() => {
      updateLocalPRStatus(selectedPRId, 'Merged');
      setIsMerging(false);

      // Append system event comment
      const systemMsg: Comment = {
        id: Date.now(),
        author: githubUser?.login || 'git-manager-workstation',
        time: 'Just now',
        text: `merged commit into main using ${mergeStrategy === 'merge' ? 'Merge Commit' : mergeStrategy === 'squash' ? 'Squash & Merge' : 'Rebase & Merge'}`,
        isSystem: true
      };

      const updatedComments = [...customComments, systemMsg];
      setCustomComments(updatedComments);
      localStorage.setItem(`local_pr_comments_${currentRepo}_${selectedPRId}`, JSON.stringify(updatedComments));
    }, 1200);
  };

  // Handle branch close simulation
  const handleClosePR = () => {
    if (!selectedPRId) return;
    updateLocalPRStatus(selectedPRId, 'Closed');
    
    const systemMsg: Comment = {
      id: Date.now(),
      author: githubUser?.login || 'git-manager-workstation',
      time: 'Just now',
      text: `closed this pull request without merging`,
      isSystem: true
    };
    const updatedComments = [...customComments, systemMsg];
    setCustomComments(updatedComments);
    localStorage.setItem(`local_pr_comments_${currentRepo}_${selectedPRId}`, JSON.stringify(updatedComments));
  };

  // Handle reopening PR
  const handleReopenPR = () => {
    if (!selectedPRId) return;
    updateLocalPRStatus(selectedPRId, 'Open');

    const systemMsg: Comment = {
      id: Date.now(),
      author: githubUser?.login || 'git-manager-workstation',
      time: 'Just now',
      text: `reopened this pull request`,
      isSystem: true
    };
    const updatedComments = [...customComments, systemMsg];
    setCustomComments(updatedComments);
    localStorage.setItem(`local_pr_comments_${currentRepo}_${selectedPRId}`, JSON.stringify(updatedComments));
  };

  const copyCheckoutCommand = (branch: string) => {
    navigator.clipboard.writeText(`git checkout ${branch}`);
    setIsCopiedCommand(true);
    setTimeout(() => setIsCopiedCommand(false), 2000);
  };

  // Toggle file viewed status
  const toggleFileViewed = (filename: string) => {
    const updated = { ...viewedFiles, [filename]: !viewedFiles[filename] };
    setViewedFiles(updated);
    if (selectedPRId && currentRepo) {
      localStorage.setItem(`local_pr_viewed_files_${currentRepo}_${selectedPRId}`, JSON.stringify(updated));
    }
  };

  // Handle submitting inline comments
  const handleAddInlineComment = (filename: string, lineIndex: number) => {
    if (!inlineCommentText.trim() || !selectedPRId || !currentRepo) return;
    
    const commentKey = `${filename}_${lineIndex}`;
    const newInline: InlineComment = {
      id: Date.now(),
      author: githubUser?.login || 'git-manager-workstation',
      avatar: githubUser?.avatar_url,
      time: 'Just now',
      text: inlineCommentText.trim()
    };

    const updated = {
      ...inlineComments,
      [commentKey]: [...(inlineComments[commentKey] || []), newInline]
    };

    setInlineComments(updated);
    localStorage.setItem(`local_pr_inline_comments_${currentRepo}_${selectedPRId}`, JSON.stringify(updated));
    setInlineCommentText('');
    setInlineInputLine(null);

    // Also trigger activity counter increase locally or append summary text to conversation timeline
    const activityComment: Comment = {
      id: Date.now() + 1,
      author: githubUser?.login || 'git-manager-workstation',
      avatar: githubUser?.avatar_url,
      time: 'Just now',
      text: `commented inline on **${filename}** (line ${lineIndex + 1}):\n\n_"${newInline.text}"_`,
      type: 'comment'
    };
    const updatedTimeline = [...customComments, activityComment];
    setCustomComments(updatedTimeline);
    localStorage.setItem(`local_pr_comments_${currentRepo}_${selectedPRId}`, JSON.stringify(updatedTimeline));
  };

  // Handle bulk action triggers
  const handleBulkStatusChange = (status: 'Merged' | 'Closed' | 'Open') => {
    if (selectedPRIds.length === 0) return;
    selectedPRIds.forEach(id => {
      updateLocalPRStatus(id, status);
    });
    setSelectedPRIds([]);
  };

  const handleBulkAddLabel = (label: string) => {
    if (selectedPRIds.length === 0) return;
    // Update local PR entries with bulk label indicator (simulate label write)
    const updatedPRs = activePRs.map(pr => {
      if (selectedPRIds.includes(pr.id)) {
        return { ...pr, label: label }; // append mock label data internally
      }
      return pr;
    });
    localStorage.setItem(`local_details_${currentRepo}_prs`, JSON.stringify(updatedPRs));
    setSelectedPRIds([]);
  };

  const toggleSelectPR = (id: number) => {
    if (selectedPRIds.includes(id)) {
      setSelectedPRIds(prev => prev.filter(x => x !== id));
    } else {
      setSelectedPRIds(prev => [...prev, id]);
    }
  };

  const toggleSelectAll = (filteredList: any[]) => {
    const filteredIds = filteredList.map(pr => pr.id);
    const allSelected = filteredIds.every(id => selectedPRIds.includes(id));
    if (allSelected) {
      setSelectedPRIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      setSelectedPRIds(prev => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  // Sort and filter list of PRs
  const filteredPRs = activePRs.filter(pr => {
    const tabMatches = (() => {
      if (activeTab === 'Open') return pr.status === 'Open' || pr.status === 'Review Req.' || pr.status === 'Draft' || pr.status === 'Approved';
      if (activeTab === 'Merged') return pr.status === 'Merged';
      if (activeTab === 'Closed') return pr.status === 'Closed';
      return true;
    })();

    const query = searchQuery.toLowerCase().trim();
    const queryMatches = !query || 
      pr.title.toLowerCase().includes(query) || 
      `#${pr.id}`.includes(query) || 
      pr.author.toLowerCase().includes(query) ||
      (pr.source && pr.source.toLowerCase().includes(query)) ||
      (pr.target && pr.target.toLowerCase().includes(query));

    // Dropdown filters matches
    const authorMatches = filterAuthor === 'All' || pr.author === filterAuthor;
    const labelMatches = filterLabel === 'All' || 
      (filterLabel === 'feature' && pr.id % 3 === 0) || 
      (filterLabel === 'bug' && pr.id % 3 === 1) ||
      (filterLabel === 'high-priority' && pr.id % 2 === 0);
    const assigneeMatches = filterAssignee === 'All' || 
      (filterAssignee === 'git-manager-workstation' && pr.author === 'git-manager-workstation') ||
      (filterAssignee === 'lead-architect' && pr.author !== 'git-manager-workstation');
    const milestoneMatches = filterMilestone === 'All' || pr.id % 2 === 1;

    return tabMatches && queryMatches && authorMatches && labelMatches && assigneeMatches && milestoneMatches;
  }).sort((a, b) => {
    if (sortBy === 'oldest') return a.id - b.id;
    if (sortBy === 'comments_desc') return (b.comments || 0) - (a.comments || 0);
    if (sortBy === 'comments_asc') return (a.comments || 0) - (b.comments || 0);
    return b.id - a.id; // default newest
  });

  // Extract unique authors for dropdown filter
  const uniqueAuthors = Array.from(new Set(activePRs.map(pr => pr.author)));

  // Diff parser helper
  const parseDiffPatch = (patch: string) => {
    if (!patch) return [];
    const lines = patch.split('\n');
    let oldLineNum = 0;
    let newLineNum = 0;
    
    return lines.map((line, index) => {
      let type: 'header' | 'add' | 'del' | 'normal' = 'normal';
      let oldNum: number | null = null;
      let newNum: number | null = null;
      
      if (line.startsWith('@@')) {
        type = 'header';
        const match = line.match(/@@ -(\d+),?\d* \+(\d+),?\d* @@/);
        if (match) {
          oldLineNum = parseInt(match[1], 10) - 1;
          newLineNum = parseInt(match[2], 10) - 1;
        }
      } else if (line.startsWith('+')) {
        type = 'add';
        newLineNum++;
        newNum = newLineNum;
      } else if (line.startsWith('-')) {
        type = 'del';
        oldLineNum++;
        oldNum = oldLineNum;
      } else {
        type = 'normal';
        oldLineNum++;
        newLineNum++;
        oldNum = oldLineNum;
        newNum = newLineNum;
      }
      
      return {
        id: index,
        type,
        text: line,
        oldNum,
        newNum,
      };
    });
  };

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {!selectedPR ? (
          // ==================================================================
          // LIST VIEW: DESKTOP & MOBILE INTEGRATED
          // ==================================================================
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-4"
          >
            {/* Header and Bulk Action Banner */}
            <div className="flex flex-col gap-3.5 bg-card border border-border rounded-2xl p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                
                {/* Responsive Tab Selector */}
                <div className="flex overflow-x-auto no-scrollbar border-b border-border/60 -mx-4 px-4 sm:mx-0 sm:px-0">
                  {['Open', 'Merged', 'Closed'].map((tab) => {
                    const count = activePRs.filter(pr => {
                      if (tab === 'Open') return pr.status === 'Open' || pr.status === 'Review Req.' || pr.status === 'Draft' || pr.status === 'Approved';
                      if (tab === 'Merged') return pr.status === 'Merged';
                      if (tab === 'Closed') return pr.status === 'Closed';
                      return false;
                    }).length;
                    
                    return (
                      <button 
                        key={tab}
                        className={`px-4 py-2.5 text-[13px] font-bold relative transition-colors cursor-pointer shrink-0 ${activeTab === tab ? 'text-primary' : 'text-text-muted hover:text-text-main'}`}
                        onClick={() => { setActiveTab(tab as any); setSelectedPRIds([]); }}
                      >
                        {tab}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ml-1.5 font-bold ${activeTab === tab ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-hover/60 text-text-muted border border-border/50'}`}>
                          {count}
                        </span>
                        {activeTab === tab && <div className="absolute -bottom-[1px] left-0 w-full h-[2px] bg-primary rounded-t-sm"></div>}
                      </button>
                    );
                  })}
                </div>

                <button 
                  onClick={() => openModal('pr')}
                  className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2.5 rounded-xl active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer self-stretch sm:self-auto"
                >
                  <Plus size={14} strokeWidth={2.5} /> New Pull Request
                </button>
              </div>

              {/* Main Filtering Bar */}
              <div className="flex flex-col lg:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3.5 text-text-muted" size={15} />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search pull requests by title, author, branch or ID..."
                    className="w-full bg-main/50 text-xs font-semibold pl-10 pr-4 py-3 rounded-xl border border-border/60 focus:outline-none focus:border-primary/50 text-text-main placeholder:text-text-muted/70"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-3.5 text-xs text-text-muted hover:text-text-main font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Filters Toggle Button for Desktop / Mobile trigger */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsFilterExpanded(!isFilterExpanded);
                      setIsMobileFilterOpen(true);
                    }}
                    className={`flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      isFilterExpanded ? 'bg-primary/10 border-primary/40 text-primary' : 'bg-main/50 border-border/60 text-text-muted hover:bg-hover'
                    }`}
                  >
                    <SlidersHorizontal size={14} />
                    <span>Filters</span>
                  </button>
                  
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-main/50 border border-border/60 text-xs font-bold px-3 py-3 rounded-xl text-text-muted focus:outline-none cursor-pointer hover:bg-hover"
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="comments_desc">Most commented</option>
                    <option value="comments_asc">Least commented</option>
                  </select>
                </div>
              </div>

              {/* Desktop Collapsible Filters Row */}
              {isFilterExpanded && (
                <div className="hidden lg:grid grid-cols-4 gap-3 pt-3.5 border-t border-border/40 animate-fade-up">
                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Author</label>
                    <select
                      value={filterAuthor}
                      onChange={(e) => setFilterAuthor(e.target.value)}
                      className="w-full bg-main border border-border/80 rounded-xl px-3 py-2 text-xs font-semibold text-text-main focus:outline-none focus:border-primary/50"
                    >
                      <option value="All">All Authors</option>
                      {uniqueAuthors.map(author => (
                        <option key={author} value={author}>{author}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Label</label>
                    <select
                      value={filterLabel}
                      onChange={(e) => setFilterLabel(e.target.value)}
                      className="w-full bg-main border border-border/80 rounded-xl px-3 py-2 text-xs font-semibold text-text-main focus:outline-none focus:border-primary/50"
                    >
                      <option value="All">All Labels</option>
                      <option value="feature">feature</option>
                      <option value="bug">bug</option>
                      <option value="high-priority">high-priority</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Assignee</label>
                    <select
                      value={filterAssignee}
                      onChange={(e) => setFilterAssignee(e.target.value)}
                      className="w-full bg-main border border-border/80 rounded-xl px-3 py-2 text-xs font-semibold text-text-main focus:outline-none focus:border-primary/50"
                    >
                      <option value="All">All Assignees</option>
                      <option value="git-manager-workstation">git-manager-workstation</option>
                      <option value="lead-architect">lead-architect</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Milestones</label>
                    <select
                      value={filterMilestone}
                      onChange={(e) => setFilterMilestone(e.target.value)}
                      className="w-full bg-main border border-border/80 rounded-xl px-3 py-2 text-xs font-semibold text-text-main focus:outline-none focus:border-primary/50"
                    >
                      <option value="All">All Milestones</option>
                      <option value="v1.2.0">v1.2.0 Integration</option>
                      <option value="v1.3.0">v1.3.0 Redux Core</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Bulk Toolbar for PR Selection */}
            {selectedPRIds.length > 0 && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm animate-fade-up">
                <div className="flex items-center gap-2 text-xs font-bold text-primary">
                  <CheckSquare size={16} />
                  <span>{selectedPRIds.length} Pull Requests selected</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleBulkStatusChange('Merged')}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all"
                  >
                    Bulk Merge
                  </button>
                  <button
                    onClick={() => handleBulkStatusChange('Closed')}
                    className="bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all"
                  >
                    Bulk Close
                  </button>
                  <button
                    onClick={() => handleBulkStatusChange('Open')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all"
                  >
                    Reopen Selected
                  </button>
                  <button
                    onClick={() => handleBulkAddLabel('high-priority')}
                    className="bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all"
                  >
                    Mark High Priority
                  </button>
                  <button
                    onClick={() => setSelectedPRIds([])}
                    className="text-xs font-bold text-text-muted hover:text-text-main px-2 py-1.5"
                  >
                    Deselect
                  </button>
                </div>
              </div>
            )}

            {/* List of PRs */}
            <div className="space-y-3">
              {filteredPRs.length > 0 && (
                <div className="flex items-center gap-3 px-3 py-1 text-xs text-text-muted font-bold">
                  <button 
                    onClick={() => toggleSelectAll(filteredPRs)}
                    className="flex items-center gap-2 hover:text-text-main select-none"
                  >
                    {filteredPRs.every(pr => selectedPRIds.includes(pr.id)) ? (
                      <CheckSquare size={14} className="text-primary" />
                    ) : (
                      <Square size={14} />
                    )}
                    <span>Select All Visible</span>
                  </button>
                </div>
              )}

              {filteredPRs.map(pr => {
                const isApproved = pr.status === 'Approved' || pr.status === 'Merged';
                const isDraft = pr.status === 'Draft';
                const isClosed = pr.status === 'Closed';
                const isSelected = selectedPRIds.includes(pr.id);
                
                return (
                  <div 
                    key={pr.id} 
                    className={`flex items-stretch border rounded-2xl transition-all hover:shadow-sm ${
                      isSelected ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/40'
                    }`}
                  >
                    {/* Multiselect Checkbox Margin area */}
                    <div 
                      onClick={() => toggleSelectPR(pr.id)}
                      className="flex items-center justify-center pl-4 pr-1 cursor-pointer hover:bg-hover/20"
                    >
                      {isSelected ? (
                        <CheckSquare size={16} className="text-primary" />
                      ) : (
                        <Square size={16} className="text-text-muted/60 hover:text-text-main" />
                      )}
                    </div>

                    <div 
                      onClick={() => { setSelectedPRId(pr.id); setDetailTab('conversation'); }}
                      className="flex-1 p-4 pl-3 flex gap-3.5 items-start cursor-pointer min-w-0"
                    >
                      <div className="mt-0.5">
                        {pr.status === 'Merged' ? (
                          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center shrink-0">
                            <GitPullRequest size={15} strokeWidth={2.5} />
                          </div>
                        ) : isClosed ? (
                          <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
                            <GitPullRequest size={15} strokeWidth={2.5} />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                            <GitPullRequest size={15} strokeWidth={2.5} />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-bold text-text-main leading-snug truncate hover:text-primary transition-colors">
                            {pr.title}
                          </h4>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${
                            pr.status === 'Merged' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                            isClosed ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                            isDraft ? 'bg-neutral-500/10 text-text-muted border-border' :
                            'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          }`}>
                            {pr.status}
                          </span>
                        </div>

                        <div className="text-xs text-text-muted font-semibold mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span>#{pr.id}</span>
                          <span>•</span>
                          <span>opened {pr.time}</span>
                          <span>by</span>
                          <span className="text-text-main font-bold">{pr.author}</span>
                          
                          {/* Label Chip Fallback Indicators */}
                          {pr.id % 3 === 0 && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/15">feature</span>
                          )}
                          {pr.id % 3 === 1 && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-500 border border-rose-500/15">bug</span>
                          )}
                        </div>

                        {/* Branch mapping visual info row */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mt-3.5 pt-3.5 border-t border-border/40">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-main border border-border/60 text-text-muted max-w-[120px] truncate">
                              {pr.source || 'feature-branch'}
                            </span>
                            <CornerDownRight size={10} className="text-text-muted shrink-0" />
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-main border border-border/60 text-text-main font-bold max-w-[120px] truncate">
                              {pr.target || 'main'}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            {/* Comments counter */}
                            <div className="flex items-center gap-1 text-[11px] text-text-muted font-bold">
                              <MessageSquare size={12} />
                              <span>{pr.comments || 0}</span>
                            </div>
                            
                            {/* CI/CD status compact icon */}
                            <CiCdBadge hash={pr.title} isCompact />

                            {/* Avatar */}
                            {pr.avatar ? (
                              <img src={pr.avatar} className="w-5 h-5 rounded-full border border-border object-cover" alt="" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-primary/10 text-[8px] font-extrabold flex items-center justify-center text-primary border border-primary/20">
                                {pr.author.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredPRs.length === 0 && (
                <div className="bg-card border border-border rounded-2xl py-12 px-4 text-center">
                  <GitPullRequest size={36} className="text-text-muted/40 mx-auto mb-3" />
                  <p className="text-xs text-text-main font-bold uppercase tracking-wider">No Pull Requests Found</p>
                  <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
                    No results match your current tab selection or search filter. Clear your filters or draft a new pull request!
                  </p>
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setFilterAuthor('All');
                      setFilterLabel('All');
                      setFilterAssignee('All');
                      setFilterMilestone('All');
                    }}
                    className="mt-4 text-xs font-bold text-primary hover:underline cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          // ==================================================================
          // PR DETAIL VIEW: UNIFIED HIGH PERFORMANCE DESKTOP & MOBILE
          // ==================================================================
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-4"
          >
            {/* PR Details upper navigation status board */}
            <div className="bg-card border border-border rounded-2xl p-4.5 sm:p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setSelectedPRId(null)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-text-muted hover:text-text-main transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} /> Back to PR List
                </button>

                {/* Submit Review Button in Header (Visible on Desktop) */}
                <button
                  onClick={() => setIsReviewFormOpen(!isReviewFormOpen)}
                  className="bg-primary hover:bg-primary-hover text-white text-[11px] font-bold px-3.5 py-1.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle size={13} />
                  <span>Review Changes</span>
                </button>
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-xl border ${
                      selectedPR.status === 'Merged' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                      selectedPR.status === 'Closed' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                      selectedPR.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    }`}>
                      <GitPullRequest size={13} strokeWidth={2.5} />
                      {selectedPR.status}
                    </span>
                    <span className="text-sm text-text-muted font-mono font-bold">#{selectedPR.id}</span>
                  </div>
                  
                  <h2 className="text-lg sm:text-xl font-extrabold text-text-main leading-snug break-words">
                    {selectedPR.title}
                  </h2>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted font-semibold">
                    <span>opened {selectedPR.time}</span>
                    <span>by</span>
                    <span className="text-text-main font-bold">{selectedPR.author}</span>
                    <span>•</span>
                    <span className="text-text-main font-bold">{getPRCommits(selectedPR.id, selectedPR.title).length} commits</span>
                    <span>•</span>
                    <span className="text-text-main font-bold">{getPRFiles(selectedPR.id, selectedPR.title).length} files changed</span>
                  </div>
                </div>

                {/* Branches mapping connector widget */}
                <div className="bg-main/40 border border-border/60 rounded-xl p-3 flex flex-col justify-center max-w-sm shrink-0">
                  <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Branches Map</div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1 bg-card border border-border/50 px-2 py-1 rounded-lg">
                      <span className="font-mono text-[10px] text-text-muted max-w-[120px] truncate">{selectedPR.source || 'feature-branch'}</span>
                    </div>
                    <CornerDownRight size={13} className="text-text-muted shrink-0 rotate-[-45deg]" />
                    <div className="flex items-center gap-1 bg-card border border-border/50 px-2 py-1 rounded-lg">
                      <span className="font-mono text-[10px] text-text-main font-bold max-w-[120px] truncate">{selectedPR.target || 'main'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Form Drawer Accordion */}
              {isReviewFormOpen && (
                <div className="bg-main/30 border border-border/80 rounded-2xl p-4.5 animate-fade-up space-y-3.5">
                  <span className="text-xs font-bold text-text-main block uppercase tracking-wider">Draft Pull Request Review</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: 'comment', label: 'Comment Only', desc: 'Submit general feedback' },
                      { id: 'approve', label: 'Approve Changes', desc: 'Authorise merge eligibility' },
                      { id: 'request_changes', label: 'Request Changes', desc: 'Block merge until fixed' }
                    ].map((opt) => (
                      <div
                        key={opt.id}
                        onClick={() => setReviewStatus(opt.id as any)}
                        className={`p-3 rounded-xl border cursor-pointer select-none transition-all ${
                          reviewStatus === opt.id 
                            ? 'bg-primary/5 border-primary text-primary' 
                            : 'bg-card border-border/60 hover:bg-hover/30 text-text-muted'
                        }`}
                      >
                        <span className={`block text-xs font-bold ${reviewStatus === opt.id ? 'text-primary' : 'text-text-main'}`}>{opt.label}</span>
                        <span className="block text-[10px] opacity-75 mt-0.5 leading-normal">{opt.desc}</span>
                      </div>
                    ))}
                  </div>

                  <textarea
                    rows={3}
                    value={reviewBody}
                    onChange={(e) => setReviewBody(e.target.value)}
                    placeholder="Add an optional message summarizing your code review details..."
                    className="w-full bg-card text-xs font-medium p-3.5 rounded-xl border border-border/85 focus:outline-none focus:border-primary/50 text-text-main resize-none"
                  />

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsReviewFormOpen(false)}
                      className="border border-border text-text-muted text-xs font-bold px-4 py-2 rounded-xl hover:bg-hover transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitReview}
                      className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send size={12} /> Submit Review
                    </button>
                  </div>
                </div>
              )}

              {/* Detail Navigation Tabs */}
              <div className="flex border-t border-border/60 pt-4 gap-1.5">
                {[
                  { id: 'conversation', label: 'Conversation', icon: <MessageSquare size={13} />, count: customComments.length },
                  { id: 'commits', label: 'Commits', icon: <GitCommit size={13} />, count: getPRCommits(selectedPR.id, selectedPR.title).length },
                  { id: 'files', label: 'Files Changed', icon: <FileCode size={13} />, count: getPRFiles(selectedPR.id, selectedPR.title).length }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setDetailTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all select-none ${
                      detailTab === tab.id 
                        ? 'bg-primary text-white shadow-sm' 
                        : 'bg-main/50 text-text-muted hover:bg-hover hover:text-text-main'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                      detailTab === tab.id ? 'bg-white/20 text-white' : 'bg-hover text-text-muted'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Core Grid: Split columns desktop, Stacked mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              
              {/* Left Core Panel (9 Columns desktop) */}
              <div className="lg:col-span-9 space-y-4">
                
                {/* 1. CONVERSATION TAB */}
                {detailTab === 'conversation' && (
                  <div className="space-y-4">
                    
                    {/* PR Initial Description */}
                    <div className="bg-card border border-border rounded-2xl p-4.5 sm:p-5 shadow-sm">
                      <div className="flex items-center gap-2.5 border-b border-border/50 pb-3 mb-4">
                        {selectedPR.avatar ? (
                          <img src={selectedPR.avatar} className="w-6 h-6 rounded-full border border-border object-cover" alt="" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-primary/10 text-[10px] font-extrabold flex items-center justify-center text-primary">
                            {selectedPR.author.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <span className="text-xs font-bold text-text-main">{selectedPR.author}</span>
                          <span className="text-[10px] text-text-muted ml-2 font-medium">authored description</span>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs leading-relaxed text-text-main font-medium">
                        <p className="font-bold text-sm mb-1">Description</p>
                        <p className="whitespace-pre-wrap text-text-muted">{selectedPR.desc || "No description provided."}</p>
                      </div>
                    </div>

                    {/* Timeline Activity Flow */}
                    <div className="space-y-3.5">
                      <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider pl-1.5">Timeline Activity</div>
                      
                      <div className="space-y-3 relative before:absolute before:top-2 before:bottom-2 before:left-[17px] before:w-[2px] before:bg-border/40">
                        
                        {/* Open Event */}
                        <div className="flex gap-4 items-start relative z-10">
                          <div className="w-9 h-9 rounded-full bg-main border border-border flex items-center justify-center shrink-0">
                            <Plus size={14} className="text-text-muted" />
                          </div>
                          <div className="bg-card border border-border/60 rounded-xl p-3 flex-1 min-w-0">
                            <p className="text-xs text-text-muted font-medium">
                              <span className="font-bold text-text-main">{selectedPR.author}</span> opened this pull request {selectedPR.time}.
                            </p>
                          </div>
                        </div>

                        {/* Interactive Timeline Entries */}
                        {customComments.map((comment) => {
                          if (comment.isSystem) {
                            const isApp = comment.type === 'approve';
                            const isReq = comment.type === 'request_changes';
                            return (
                              <div key={comment.id} className="flex gap-4 items-start relative z-10">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border ${
                                  isApp ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                                  isReq ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                                  'bg-purple-500/10 border-purple-500/20 text-purple-500'
                                }`}>
                                  {isApp ? <Check size={14} /> : isReq ? <X size={14} /> : <GitMerge size={14} />}
                                </div>
                                <div className={`border rounded-xl p-3 flex-1 min-w-0 ${
                                  isApp ? 'bg-emerald-500/5 border-emerald-500/10' :
                                  isReq ? 'bg-rose-500/5 border-rose-500/10' :
                                  'bg-purple-500/5 border-purple-500/10'
                                }`}>
                                  <p className="text-xs text-text-muted font-semibold">
                                    <span className="font-bold text-text-main">{comment.author}</span> {comment.text} {comment.time}.
                                  </p>
                                </div>
                              </div>
                            );
                          }

                          // Review Box timeline card
                          const isApprove = comment.type === 'approve';
                          const isReq = comment.type === 'request_changes';
                          
                          return (
                            <div key={comment.id} className="flex gap-4 items-start relative z-10">
                              {comment.avatar ? (
                                <img src={comment.avatar} className="w-9 h-9 rounded-full border border-border object-cover shrink-0" alt="" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/25 text-xs font-bold flex items-center justify-center text-primary shrink-0">
                                  {comment.author.substring(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div className={`border rounded-xl p-4 flex-1 min-w-0 space-y-1.5 shadow-sm ${
                                isApprove ? 'border-emerald-500/30 bg-emerald-500/5' :
                                isReq ? 'border-rose-500/30 bg-rose-500/5' :
                                'border-border bg-card'
                              }`}>
                                <div className="flex items-center justify-between gap-2 border-b border-border/45 pb-1.5">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-text-main">{comment.author}</span>
                                    {isApprove && (
                                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">Approved review</span>
                                    )}
                                    {isReq && (
                                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-500">Requested changes</span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-text-muted font-semibold">{comment.time}</span>
                                </div>
                                <p className="text-xs text-text-muted font-medium leading-relaxed whitespace-pre-wrap">
                                  {comment.text}
                                </p>
                              </div>
                            </div>
                          );
                        })}

                        {/* Live CI/CD Status */}
                        <div className="flex gap-4 items-start relative z-10">
                          <div className="w-9 h-9 rounded-full bg-main border border-border flex items-center justify-center shrink-0">
                            <Clock size={14} className="text-primary animate-pulse" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CiCdPipelineFlow hash={selectedPR.title} />
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* New Comment submission */}
                    <div className="bg-card border border-border rounded-2xl p-4.5 shadow-sm space-y-3">
                      <div className="text-xs font-bold text-text-main flex items-center gap-1.5">
                        <MessageCircle size={14} /> Leave a comment
                      </div>
                      <textarea 
                        rows={3}
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        placeholder="Type your general comment here..."
                        className="w-full bg-main/40 text-xs font-medium p-3.5 rounded-xl border border-border/80 focus:outline-none focus:border-primary/50 text-text-main resize-none"
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={handleAddComment}
                          disabled={!newCommentText.trim()}
                          className="bg-primary hover:bg-primary-hover disabled:opacity-40 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Send size={12} /> Comment
                        </button>
                      </div>
                    </div>

                    {/* Interactive Merge Box Area with strategic merge commit forms */}
                    <div className="bg-card border border-border rounded-2xl p-4.5 sm:p-5 shadow-sm space-y-4">
                      <div className="text-xs font-bold text-text-main uppercase tracking-wider flex items-center gap-1.5">
                        <GitMerge size={14} className="text-primary" />
                        <span>Merge Status & Configurations</span>
                      </div>

                      {selectedPR.status === 'Merged' ? (
                        <div className="bg-purple-500/5 border border-purple-500/15 rounded-xl p-4 space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-500/15 border border-purple-500/35 text-purple-500 flex items-center justify-center shrink-0">
                              <Check size={14} strokeWidth={3} />
                            </div>
                            <div className="space-y-1">
                              <span className="block text-xs font-bold text-purple-500">Merged successfully</span>
                              <p className="text-xs text-text-muted font-medium">
                                This pull request was merged successfully. Source branch {selectedPR.source} is integrated into {selectedPR.target}.
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 pt-1 border-t border-purple-500/10">
                            <button 
                              onClick={handleReopenPR}
                              className="text-xs font-bold text-primary hover:underline cursor-pointer"
                            >
                              Reopen Pull Request
                            </button>
                          </div>
                        </div>
                      ) : selectedPR.status === 'Closed' ? (
                        <div className="bg-rose-500/5 border border-rose-500/15 rounded-xl p-4 space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-rose-500/15 border border-rose-500/35 text-rose-500 flex items-center justify-center shrink-0">
                              <X size={14} strokeWidth={3} />
                            </div>
                            <div className="space-y-1">
                              <span className="block text-xs font-bold text-rose-500">Closed without merging</span>
                              <p className="text-xs text-text-muted font-medium">
                                This pull request was closed manually. No code changes have been integrated.
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 pt-1 border-t border-rose-500/10">
                            <button 
                              onClick={handleReopenPR}
                              className="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-primary-hover transition-colors cursor-pointer"
                            >
                              Reopen PR
                            </button>
                          </div>
                        </div>
                      ) : (
                        // OPEN PR: ACTIVE MERGE CONFIGURATION
                        <div className="border border-border/80 rounded-xl overflow-hidden bg-main/20">
                          {/* Code Review State check banner */}
                          <div className={`p-3.5 border-b border-border/60 flex items-start gap-3 ${
                            selectedPR.status === 'Approved' ? 'bg-emerald-500/5' : 'bg-amber-500/5'
                          }`}>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                              selectedPR.status === 'Approved' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-500'
                            }`}>
                              <Check size={11} strokeWidth={3} />
                            </div>
                            <div className="space-y-0.5">
                              <span className={`block text-xs font-bold ${selectedPR.status === 'Approved' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                {selectedPR.status === 'Approved' ? 'Changes approved by reviewers' : 'Review requested'}
                              </span>
                              <span className="block text-[10px] text-text-muted font-medium">
                                {selectedPR.status === 'Approved' ? 'All review guidelines are successfully satisfied.' : 'You can merge this pull request, but reviewer approval is recommended.'}
                              </span>
                            </div>
                          </div>

                          <div className="p-4 space-y-4">
                            {/* Strategy options */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                              {[
                                { id: 'merge', title: 'Merge Commit', desc: 'Add all commits to base' },
                                { id: 'squash', title: 'Squash & Merge', desc: 'Combine commits into 1' },
                                { id: 'rebase', title: 'Rebase & Merge', desc: 'Rebase commits individually' }
                              ].map((strategy) => (
                                <div 
                                  key={strategy.id}
                                  onClick={() => setMergeStrategy(strategy.id as any)}
                                  className={`p-3 rounded-xl border cursor-pointer select-none transition-all ${
                                    mergeStrategy === strategy.id 
                                      ? 'bg-primary/5 border-primary text-primary' 
                                      : 'bg-card border-border/60 text-text-muted hover:border-border'
                                  }`}
                                >
                                  <span className={`block text-[11px] font-extrabold ${mergeStrategy === strategy.id ? 'text-primary' : 'text-text-main'}`}>
                                    {strategy.title}
                                  </span>
                                  <span className="block text-[9px] font-medium opacity-80 mt-1">{strategy.desc}</span>
                                </div>
                              ))}
                            </div>

                            {/* Customizable merge text fields */}
                            <div className="space-y-3 bg-card border border-border/50 rounded-xl p-3.5">
                              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Commit Details</span>
                              <div className="space-y-2">
                                <input 
                                  type="text" 
                                  value={customMergeTitle}
                                  onChange={(e) => setCustomMergeTitle(e.target.value)}
                                  placeholder="Merge commit title"
                                  className="w-full bg-main/50 text-xs font-bold p-2.5 rounded-lg border border-border/60 focus:outline-none focus:border-primary/50 text-text-main"
                                />
                                <textarea 
                                  rows={2}
                                  value={customMergeDesc}
                                  onChange={(e) => setCustomMergeDesc(e.target.value)}
                                  placeholder="Merge commit description"
                                  className="w-full bg-main/50 text-xs font-medium p-2.5 rounded-lg border border-border/60 focus:outline-none focus:border-primary/50 text-text-main resize-none"
                                />
                              </div>
                            </div>

                            {/* Trigger actions */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-border/30">
                              <button 
                                onClick={handleMergePR}
                                disabled={isMerging}
                                className="bg-success hover:bg-emerald-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                              >
                                {isMerging ? (
                                  <>
                                    <RefreshCw size={13} className="animate-spin" />
                                    <span>Merging changes...</span>
                                  </>
                                ) : (
                                  <>
                                    <GitMerge size={13} />
                                    <span>Confirm Merge Pull Request</span>
                                  </>
                                )}
                              </button>

                              <button 
                                onClick={handleClosePR}
                                className="border border-border hover:bg-rose-500/10 hover:border-rose-500 hover:text-rose-500 text-text-muted text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <X size={13} /> Close Pull Request
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Metadata Trigger Button for Mobile ONLY */}
                    <button
                      onClick={() => setIsMobileMetadataOpen(true)}
                      className="block lg:hidden w-full bg-main text-text-muted border border-border hover:text-text-main hover:bg-hover/40 text-xs font-bold py-3.5 rounded-2xl transition-all cursor-pointer"
                    >
                      View Reviewers, Labels & Milestones
                    </button>
                  </div>
                )}

                {/* 2. COMMITS TAB */}
                {detailTab === 'commits' && (
                  <div className="bg-card border border-border rounded-2xl p-4.5 sm:p-5 shadow-sm space-y-4">
                    <div className="text-xs font-bold text-text-main uppercase tracking-wider flex items-center gap-1.5">
                      <GitCommit size={14} className="text-primary" />
                      <span>Linked Commits</span>
                    </div>

                    <div className="relative pl-6 space-y-5 before:absolute before:top-1.5 before:bottom-1.5 before:left-[11px] before:w-[2px] before:bg-border/50">
                      {getPRCommits(selectedPR.id, selectedPR.title).map((commit) => (
                        <div key={commit.hash} className="relative group">
                          <div className="absolute -left-[20px] top-1.5 w-3.5 h-3.5 rounded-full bg-card border-2 border-primary group-hover:bg-primary transition-colors shrink-0 z-10" />
                          
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="space-y-0.5">
                              <span className="block text-xs font-bold text-text-main hover:text-primary transition-colors break-words">
                                {commit.msg}
                              </span>
                              <div className="flex items-center gap-1.5 text-[10px] text-text-muted font-semibold">
                                <span className="text-text-main font-bold">{commit.author}</span>
                                <span>committed</span>
                                <span>{commit.time}</span>
                              </div>
                            </div>

                            <span className="font-mono text-[10px] bg-main border border-border/60 text-primary font-bold px-2 py-0.5 rounded-md self-start sm:self-center shadow-sm select-all">
                              {commit.hash}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. FILES CHANGED & INTERACTIVE DIFF TAB */}
                {detailTab === 'files' && (
                  <div className="space-y-4">
                    {/* Files Tab Header: progress tracking */}
                    <div className="bg-card border border-border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-text-main uppercase tracking-wider flex items-center gap-1.5">
                          <FileCode size={14} className="text-primary" />
                          <span>Code Files Diff Explorer</span>
                        </div>
                        {/* Viewed count indicator */}
                        <div className="text-[10px] text-text-muted font-semibold">
                          {Object.values(viewedFiles).filter(Boolean).length} of {getPRFiles(selectedPR.id, selectedPR.title).length} files marked viewed
                        </div>
                      </div>

                      {/* Visual Progress bar */}
                      <div className="w-full sm:w-44 flex flex-col gap-1 shrink-0">
                        <div className="w-full bg-main h-2 rounded-full overflow-hidden border border-border/40">
                          <div 
                            className="bg-success h-full transition-all duration-300" 
                            style={{ width: `${(Object.values(viewedFiles).filter(Boolean).length / getPRFiles(selectedPR.id, selectedPR.title).length) * 100}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-text-muted font-bold text-right block">
                          {Math.round((Object.values(viewedFiles).filter(Boolean).length / getPRFiles(selectedPR.id, selectedPR.title).length) * 100)}% viewed
                        </span>
                      </div>
                    </div>

                    {/* Left Sidebar and main area diff box (Split only for desktop, swipeable picker for mobile) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                      
                      {/* Interactive File Tree Selector Panel */}
                      <div className="lg:col-span-3 bg-card border border-border rounded-2xl p-3.5 shadow-sm space-y-2.5">
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block border-b border-border/50 pb-2 mb-2">Files Changed</span>
                        
                        {/* Mobile Swipe selector */}
                        <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-1.5 no-scrollbar -mx-1.5 px-1.5">
                          {getPRFiles(selectedPR.id, selectedPR.title).map((file) => {
                            const isSelected = activeFileInTree === file.filename;
                            const isViewed = viewedFiles[file.filename];
                            
                            return (
                              <div
                                key={file.filename}
                                onClick={() => setActiveFileInTree(file.filename)}
                                className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl cursor-pointer select-none shrink-0 lg:shrink transition-all border ${
                                  isSelected 
                                    ? 'bg-primary/5 border-primary text-primary' 
                                    : 'bg-main/30 border-transparent hover:border-border/60 text-text-muted'
                                }`}
                              >
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <FileCode size={13} className={isSelected ? 'text-primary' : 'text-text-muted'} />
                                  <span className={`text-[11px] font-bold truncate max-w-[150px] lg:max-w-none ${isSelected ? 'text-primary' : 'text-text-main'}`}>
                                    {file.filename.split('/').pop()}
                                  </span>
                                </div>
                                
                                {isViewed && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Main Interactive Diff code panel */}
                      <div className="lg:col-span-9 space-y-4">
                        {getPRFiles(selectedPR.id, selectedPR.title).filter(f => f.filename === activeFileInTree).map((file) => {
                          const isFileViewed = viewedFiles[file.filename];
                          const parsedLines = parseDiffPatch(file.patch);

                          return (
                            <div key={file.filename} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                              
                              {/* File Header */}
                              <div className="bg-main/50 px-4 py-3 border-b border-border flex items-center justify-between gap-3 flex-wrap">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="font-mono text-xs font-bold text-text-main truncate">{file.filename}</span>
                                  <div className="flex items-center gap-1.5 text-[10px] font-bold">
                                    <span className="text-success">+{file.additions}</span>
                                    <span className="text-danger">-{file.deletions}</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {/* Viewed Toggle */}
                                  <button
                                    onClick={() => toggleFileViewed(file.filename)}
                                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                                      isFileViewed 
                                        ? 'bg-success/10 border-success/30 text-success' 
                                        : 'bg-card border-border hover:bg-hover text-text-muted'
                                    }`}
                                  >
                                    <Check size={11} />
                                    <span>{isFileViewed ? 'Viewed' : 'Mark Viewed'}</span>
                                  </button>
                                </div>
                              </div>

                              {/* Interactive Line-by-Line Unified Diff with expand collapsible viewed container */}
                              <AnimatePresence initial={false}>
                                {!isFileViewed ? (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-x-auto w-full"
                                  >
                                    <table className="w-full text-xs font-mono border-collapse divide-y divide-border/10">
                                      <tbody>
                                        {parsedLines.map((line, idx) => {
                                          const isHeader = line.type === 'header';
                                          const isAdd = line.type === 'add';
                                          const isDel = line.type === 'del';
                                          
                                          // Style variables
                                          const bgStyle = isHeader ? 'bg-sky-500/5 text-primary/80 font-bold border-b border-border/20' :
                                                            isAdd ? 'bg-emerald-500/10 text-emerald-500 border-l-3 border-emerald-500/60' :
                                                            isDel ? 'bg-rose-500/10 text-rose-500 border-l-3 border-rose-500/60' :
                                                            'hover:bg-hover/20';

                                          const lineKey = `${file.filename}_${idx}`;
                                          const lineComments = inlineComments[lineKey] || [];
                                          const isFormOpen = inlineInputLine?.filename === file.filename && inlineInputLine?.lineIndex === idx;

                                          return (
                                            <React.Fragment key={idx}>
                                              {/* Diff row */}
                                              <tr className={`group relative transition-colors ${bgStyle}`}>
                                                {/* Old Line Number */}
                                                <td className="w-10 text-right pr-2 text-[10px] text-text-muted/60 select-none bg-main/20 border-r border-border/40 font-semibold py-0.5">
                                                  {line.oldNum}
                                                </td>
                                                {/* New Line Number */}
                                                <td className="w-10 text-right pr-2 text-[10px] text-text-muted/60 select-none bg-main/20 border-r border-border/40 font-semibold py-0.5">
                                                  {line.newNum}
                                                </td>
                                                
                                                {/* Interactive Row Plus Indicator Column */}
                                                <td className="w-6 text-center select-none py-0.5 relative">
                                                  {!isHeader && (
                                                    <button
                                                      onClick={() => setInlineInputLine(isFormOpen ? null : { filename: file.filename, lineIndex: idx })}
                                                      className="absolute left-1.5 top-0.5 w-4 h-4 bg-primary text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm active:scale-90"
                                                    >
                                                      <Plus size={10} strokeWidth={3} />
                                                    </button>
                                                  )}
                                                </td>

                                                {/* Diff Content Column */}
                                                <td className="pl-3 pr-4 whitespace-pre select-text font-medium py-0.5 tracking-wide leading-normal">
                                                  {line.text}
                                                </td>
                                              </tr>

                                              {/* Inline review thread comments if present under line */}
                                              {lineComments.length > 0 && (
                                                <tr>
                                                  <td colSpan={3} className="bg-main/20 border-r border-border/40"></td>
                                                  <td className="p-3 bg-main/10 border-b border-border/20">
                                                    <div className="space-y-2.5">
                                                      {lineComments.map((c) => (
                                                        <div key={c.id} className="bg-card border border-border/60 rounded-xl p-3 shadow-sm max-w-xl">
                                                          <div className="flex items-center justify-between border-b border-border/30 pb-1.5 mb-2">
                                                            <div className="flex items-center gap-1.5">
                                                              {c.avatar ? (
                                                                <img src={c.avatar} className="w-4 h-4 rounded-full border border-border" alt="" referrerPolicy="no-referrer" />
                                                              ) : (
                                                                <div className="w-4 h-4 rounded-full bg-primary/10 text-[8px] font-bold flex items-center justify-center text-primary">US</div>
                                                              )}
                                                              <span className="text-[10px] font-bold text-text-main">{c.author}</span>
                                                            </div>
                                                            <span className="text-[9px] text-text-muted font-bold">{c.time}</span>
                                                          </div>
                                                          <p className="text-[11px] text-text-muted font-semibold whitespace-pre-wrap leading-relaxed">{c.text}</p>
                                                        </div>
                                                      ))}
                                                    </div>
                                                  </td>
                                                </tr>
                                              )}

                                              {/* Expandable Inline Comment Submission Input Field */}
                                              {isFormOpen && (
                                                <tr>
                                                  <td colSpan={3} className="bg-main/20 border-r border-border/40"></td>
                                                  <td className="p-4 bg-main/30 border-b border-border/20">
                                                    <div className="bg-card border border-border rounded-xl p-3 space-y-3.5 max-w-xl shadow-md">
                                                      <div className="text-[10px] font-bold text-text-main flex items-center gap-1.5 uppercase tracking-wide">
                                                        <MessageSquare size={12} className="text-primary" />
                                                        <span>Add inline review feedback</span>
                                                      </div>
                                                      <textarea
                                                        rows={2}
                                                        value={inlineCommentText}
                                                        onChange={(e) => setInlineCommentText(e.target.value)}
                                                        placeholder="Write your constructive code review comment here..."
                                                        className="w-full bg-main/40 text-[11px] font-semibold p-2.5 rounded-lg border border-border/80 focus:outline-none focus:border-primary/50 text-text-main resize-none"
                                                      />
                                                      <div className="flex justify-end gap-1.5">
                                                        <button
                                                          onClick={() => setInlineInputLine(null)}
                                                          className="border border-border text-text-muted text-[10px] font-bold px-2.5 py-1 rounded-lg hover:bg-hover cursor-pointer"
                                                        >
                                                          Cancel
                                                        </button>
                                                        <button
                                                          onClick={() => handleAddInlineComment(file.filename, idx)}
                                                          disabled={!inlineCommentText.trim()}
                                                          className="bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-[10px] font-bold px-3.5 py-1 rounded-lg cursor-pointer"
                                                        >
                                                          Submit Line Feedback
                                                        </button>
                                                      </div>
                                                    </div>
                                                  </td>
                                                </tr>
                                              )}
                                            </React.Fragment>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </motion.div>
                                ) : (
                                  // FOLDED / VIEWED PANEL SCREEN
                                  <div className="py-12 text-center bg-main/10 border-t border-border/40 select-none">
                                    <CheckCircle size={24} className="text-success mx-auto mb-2" />
                                    <p className="text-xs text-text-main font-bold">This file has been marked as viewed</p>
                                    <button
                                      onClick={() => toggleFileViewed(file.filename)}
                                      className="mt-3 text-[10px] font-bold text-primary hover:underline cursor-pointer"
                                    >
                                      Expand to view code differences
                                    </button>
                                  </div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  </div>
                )}
              </div>

              {/* Right Sidebar Panel: Desktop Layout Only (Hidden on Mobile) */}
              <div className="hidden lg:block lg:col-span-3 space-y-4.5">
                
                {/* Branch checkout card */}
                <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-3.5">
                  <div className="text-[10px] font-extrabold text-text-muted uppercase tracking-widest pb-1.5 border-b border-border/50">Branch Status</div>
                  
                  <div className="space-y-2.5">
                    <div>
                      <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Source branch</span>
                      <div className="flex items-center justify-between gap-1.5 bg-main border border-border/60 px-2 py-1.5 rounded-lg mt-1">
                        <span className="font-mono text-[10px] text-text-muted truncate flex-1">{selectedPR.source || 'feature-branch'}</span>
                        <button 
                          onClick={() => copyCheckoutCommand(selectedPR.source || 'feature-branch')}
                          className="p-1 hover:text-primary text-text-muted/60 transition-colors cursor-pointer"
                          title="Copy git checkout command"
                        >
                          <Clipboard size={11} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Checkout target</span>
                      <div className="flex items-center justify-between gap-1.5 bg-main border border-border/60 px-2 py-1.5 rounded-lg mt-1">
                        <span className="font-mono text-[10px] text-text-main font-bold truncate flex-1">{selectedPR.target || 'main'}</span>
                        <button 
                          onClick={() => copyCheckoutCommand(selectedPR.target || 'main')}
                          className="p-1 hover:text-primary text-text-muted/60 transition-colors cursor-pointer"
                          title="Copy git checkout command"
                        >
                          <Clipboard size={11} />
                        </button>
                      </div>
                    </div>

                    {isCopiedCommand && (
                      <span className="block text-[9px] text-primary font-bold text-center animate-pulse">
                        Git checkout command copied!
                      </span>
                    )}
                  </div>
                </div>

                {/* Reviewers card */}
                <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-3">
                  <div className="text-[10px] font-extrabold text-text-muted uppercase tracking-widest pb-1.5 border-b border-border/50">Reviewers</div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 text-[8px] font-extrabold flex items-center justify-center text-primary">LA</div>
                      <span className="text-xs text-text-main font-bold">lead-architect</span>
                    </div>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border ${
                      selectedPR.status === 'Approved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                    }`}>
                      {selectedPR.status === 'Approved' ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Assignees card */}
                <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-3">
                  <div className="text-[10px] font-extrabold text-text-muted uppercase tracking-widest pb-1.5 border-b border-border/50">Assignees</div>
                  <div className="flex items-center gap-1.5">
                    {selectedPR.avatar ? (
                      <img src={selectedPR.avatar} className="w-5 h-5 rounded-full border border-border object-cover" alt="" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-primary/10 text-[8px] font-extrabold flex items-center justify-center text-primary">ME</div>
                    )}
                    <span className="text-xs text-text-main font-bold">{selectedPR.author}</span>
                  </div>
                </div>

                {/* Labels Card */}
                <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-3">
                  <div className="text-[10px] font-extrabold text-text-muted uppercase tracking-widest pb-1.5 border-b border-border/50">Labels</div>
                  <div className="flex items-center flex-wrap gap-1.5">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">feature</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">high-priority</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">automerge</span>
                  </div>
                </div>

                {/* Milestone progress card */}
                <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-3">
                  <div className="text-[10px] font-extrabold text-text-muted uppercase tracking-widest pb-1.5 border-b border-border/50">Milestone</div>
                  <div className="space-y-2">
                    <span className="text-xs text-text-main font-extrabold block">v1.2.0 Integration</span>
                    <div className="space-y-1">
                      <div className="w-full bg-main h-1.5 rounded-full overflow-hidden border border-border/40">
                        <div className="bg-success h-full w-[85%]" />
                      </div>
                      <span className="text-[9px] text-text-muted font-bold block text-right">85% complete</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================================================================
          MOBILE BOTTOM DRAWERS & DRAWER OVERLAYS (UX MASTERCLASS)
          ================================================================== */}
      
      {/* 1. Mobile Filter Settings sheet */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-[150] block lg:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="absolute bottom-0 left-0 right-0 max-h-[80vh] bg-card border-t border-border rounded-t-3xl p-5 overflow-y-auto space-y-5 shadow-2xl pb-10"
            >
              <div className="flex justify-between items-center border-b border-border/50 pb-3">
                <span className="text-sm font-bold text-text-main">Advanced Pull Request Filters</span>
                <button 
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 rounded-full bg-hover text-text-muted hover:text-text-main"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Author</label>
                  <select
                    value={filterAuthor}
                    onChange={(e) => setFilterAuthor(e.target.value)}
                    className="w-full bg-main border border-border rounded-xl px-3 py-3 text-xs font-bold text-text-main focus:outline-none"
                  >
                    <option value="All">All Authors</option>
                    {uniqueAuthors.map(author => (
                      <option key={author} value={author}>{author}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Label</label>
                  <select
                    value={filterLabel}
                    onChange={(e) => setFilterLabel(e.target.value)}
                    className="w-full bg-main border border-border rounded-xl px-3 py-3 text-xs font-bold text-text-main focus:outline-none"
                  >
                    <option value="All">All Labels</option>
                    <option value="feature">feature</option>
                    <option value="bug">bug</option>
                    <option value="high-priority">high-priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Assignee</label>
                  <select
                    value={filterAssignee}
                    onChange={(e) => setFilterAssignee(e.target.value)}
                    className="w-full bg-main border border-border rounded-xl px-3 py-3 text-xs font-bold text-text-main focus:outline-none"
                  >
                    <option value="All">All Assignees</option>
                    <option value="git-manager-workstation">git-manager-workstation</option>
                    <option value="lead-architect">lead-architect</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Milestone</label>
                  <select
                    value={filterMilestone}
                    onChange={(e) => setFilterMilestone(e.target.value)}
                    className="w-full bg-main border border-border rounded-xl px-3 py-3 text-xs font-bold text-text-main focus:outline-none"
                  >
                    <option value="All">All Milestones</option>
                    <option value="v1.2.0">v1.2.0 Integration</option>
                    <option value="v1.3.0">v1.3.0 Redux Core</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={() => {
                    setFilterAuthor('All');
                    setFilterLabel('All');
                    setFilterAssignee('All');
                    setFilterMilestone('All');
                  }}
                  className="flex-1 border border-border text-text-muted text-xs font-bold py-3.5 rounded-xl hover:bg-hover active:scale-95 transition-all cursor-pointer"
                >
                  Reset All
                </button>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-1 bg-primary text-white text-xs font-bold py-3.5 rounded-xl active:scale-95 transition-all cursor-pointer"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Mobile Details Metadata checklist sheet */}
      <AnimatePresence>
        {isMobileMetadataOpen && selectedPR && (
          <div className="fixed inset-0 z-[150] block lg:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMetadataOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-card border-t border-border rounded-t-3xl p-5 overflow-y-auto space-y-5 shadow-2xl pb-12"
            >
              <div className="flex justify-between items-center border-b border-border/50 pb-3">
                <span className="text-sm font-bold text-text-main">Review Details</span>
                <button 
                  onClick={() => setIsMobileMetadataOpen(false)}
                  className="p-1 rounded-full bg-hover text-text-muted hover:text-text-main"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Mobile Meta Row Content */}
              <div className="space-y-4">
                
                {/* Branch checkout */}
                <div className="bg-main/30 border border-border/50 rounded-xl p-3.5 space-y-2.5">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Branch Actions</span>
                  <div className="flex items-center justify-between gap-1.5 bg-card border border-border px-2.5 py-2 rounded-lg">
                    <span className="font-mono text-xs text-text-muted truncate flex-1">{selectedPR.source}</span>
                    <button 
                      onClick={() => copyCheckoutCommand(selectedPR.source)}
                      className="p-1 hover:text-primary text-text-muted/60"
                    >
                      <Clipboard size={12} />
                    </button>
                  </div>
                  {isCopiedCommand && (
                    <span className="block text-[9px] text-primary font-bold text-center">Checkout command copied!</span>
                  )}
                </div>

                {/* Reviewers */}
                <div className="bg-main/30 border border-border/50 rounded-xl p-3.5 space-y-2 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Reviewer</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-text-main font-bold">lead-architect</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                      selectedPR.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {selectedPR.status === 'Approved' ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Assignees */}
                <div className="bg-main/30 border border-border/50 rounded-xl p-3.5 space-y-2 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Assignee</span>
                  <span className="text-xs text-text-main font-bold">{selectedPR.author}</span>
                </div>

                {/* Labels */}
                <div className="bg-main/30 border border-border/50 rounded-xl p-3.5 space-y-2">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Labels</span>
                  <div className="flex items-center flex-wrap gap-1.5 mt-1">
                    <span className="text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/15">feature</span>
                    <span className="text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/15">high-priority</span>
                  </div>
                </div>

                {/* Milestone */}
                <div className="bg-main/30 border border-border/50 rounded-xl p-3.5 space-y-2.5">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Milestone Status</span>
                  <span className="text-xs text-text-main font-extrabold block">v1.2.0 Integration</span>
                  <div className="w-full bg-card h-1.5 rounded-full overflow-hidden border border-border/40">
                    <div className="bg-success h-full w-[85%]" />
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsMobileMetadataOpen(false)}
                className="w-full bg-primary text-white text-xs font-bold py-3.5 rounded-xl active:scale-95 transition-all mt-4 cursor-pointer"
              >
                Done
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
