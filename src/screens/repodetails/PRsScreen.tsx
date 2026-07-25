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
// Interfaces & Dummy Generators (Consistent with original model state)
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
    const updatedPRs = activePRs.map(pr => {
      if (selectedPRIds.includes(pr.id)) {
        return { ...pr, label: label };
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
    return b.id - a.id;
  });

  const uniqueAuthors = Array.from(new Set(activePRs.map(pr => pr.author)));

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
    <div className="w-full pb-8">
      <AnimatePresence mode="wait">
        {!selectedPR ? (
          // ==================================================================
          // REDESIGNED PR LIST VIEW
          // ==================================================================
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Elite Unified Control Center Card */}
            <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-black text-text-main tracking-tight flex items-center gap-2">
                    <GitPullRequest className="text-primary" size={22} strokeWidth={2.5} />
                    Pull Requests
                  </h1>
                  <p className="text-xs text-text-muted mt-1 font-medium">
                    Manage incoming feature submissions, code reviews, and target branches.
                  </p>
                </div>

                <button 
                  onClick={() => openModal('pr')}
                  className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2.5 rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer self-stretch md:self-auto"
                >
                  <Plus size={15} strokeWidth={2.5} />
                  <span>Draft Pull Request</span>
                </button>
              </div>

              {/* Advanced Responsive Tab Strip */}
              <div className="flex items-center justify-between border-b border-border/40 pt-2">
                <div className="flex overflow-x-auto no-scrollbar -mb-[1px] gap-1">
                  {(['Open', 'Merged', 'Closed'] as const).map((tab) => {
                    const count = activePRs.filter(pr => {
                      if (tab === 'Open') return pr.status === 'Open' || pr.status === 'Review Req.' || pr.status === 'Draft' || pr.status === 'Approved';
                      if (tab === 'Merged') return pr.status === 'Merged';
                      if (tab === 'Closed') return pr.status === 'Closed';
                      return false;
                    }).length;
                    
                    const isActive = activeTab === tab;
                    return (
                      <button 
                        key={tab}
                        className={`px-4 py-3 text-xs font-bold relative transition-all cursor-pointer shrink-0 ${
                          isActive ? 'text-primary' : 'text-text-muted hover:text-text-main'
                        }`}
                        onClick={() => { setActiveTab(tab); setSelectedPRIds([]); }}
                      >
                        <span className="flex items-center gap-1.5">
                          {tab} PRs
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isActive ? 'bg-primary/10 text-primary border border-primary/25' : 'bg-hover/50 text-text-muted border border-border/40'
                          }`}>
                            {count}
                          </span>
                        </span>
                        {isActive && (
                          <motion.div 
                            layoutId="activeTabUnderline" 
                            className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-primary rounded-t" 
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="hidden sm:flex items-center gap-2 text-xs text-text-muted font-bold px-1 select-none">
                  <span className="w-2 h-2 rounded-full bg-success inline-block animate-pulse"></span>
                  <span>Review Runner Live</span>
                </div>
              </div>

              {/* Filter and Search Bar */}
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-[13px] text-text-muted" size={15} />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter by title, author, branch or number..."
                    className="w-full bg-main/40 text-xs font-semibold pl-10 pr-4 py-3 rounded-xl border border-border/50 focus:outline-none focus:border-primary/50 text-text-main placeholder:text-text-muted/60 transition-colors"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-[13px] text-xs text-text-muted hover:text-text-main font-bold"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        setIsMobileFilterOpen(true);
                      } else {
                        setIsFilterExpanded(!isFilterExpanded);
                      }
                    }}
                    className={`flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      (isFilterExpanded || isMobileFilterOpen)
                        ? 'bg-primary/5 border-primary/40 text-primary shadow-sm' 
                        : 'bg-main/30 border-border/50 text-text-muted hover:bg-hover hover:text-text-main'
                    }`}
                  >
                    <SlidersHorizontal size={14} />
                    <span>Options</span>
                    {isFilterExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                  
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-main/30 border border-border/50 text-xs font-bold px-3 py-3 rounded-xl text-text-muted focus:outline-none cursor-pointer hover:bg-hover max-w-[150px]"
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="comments_desc">Comments: High</option>
                    <option value="comments_asc">Comments: Low</option>
                  </select>
                </div>
              </div>

              {/* Expanded Advanced Desktop Filters Grid */}
              <AnimatePresence>
                {isFilterExpanded && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-border/30">
                      <div>
                        <label className="block text-[10px] font-extrabold text-text-muted uppercase tracking-wider mb-1.5">Author</label>
                        <select
                          value={filterAuthor}
                          onChange={(e) => setFilterAuthor(e.target.value)}
                          className="w-full bg-main border border-border/50 rounded-xl px-3 py-2 text-xs font-bold text-text-main focus:outline-none focus:border-primary/40"
                        >
                          <option value="All">All Authors</option>
                          {uniqueAuthors.map(author => (
                            <option key={author} value={author}>{author}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold text-text-muted uppercase tracking-wider mb-1.5">Label</label>
                        <select
                          value={filterLabel}
                          onChange={(e) => setFilterLabel(e.target.value)}
                          className="w-full bg-main border border-border/50 rounded-xl px-3 py-2 text-xs font-bold text-text-main focus:outline-none focus:border-primary/40"
                        >
                          <option value="All">All Labels</option>
                          <option value="feature">feature</option>
                          <option value="bug">bug</option>
                          <option value="high-priority">high-priority</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold text-text-muted uppercase tracking-wider mb-1.5">Assignee</label>
                        <select
                          value={filterAssignee}
                          onChange={(e) => setFilterAssignee(e.target.value)}
                          className="w-full bg-main border border-border/50 rounded-xl px-3 py-2 text-xs font-bold text-text-main focus:outline-none focus:border-primary/40"
                        >
                          <option value="All">All Assignees</option>
                          <option value="git-manager-workstation">git-manager-workstation</option>
                          <option value="lead-architect">lead-architect</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold text-text-muted uppercase tracking-wider mb-1.5">Milestone</label>
                        <select
                          value={filterMilestone}
                          onChange={(e) => setFilterMilestone(e.target.value)}
                          className="w-full bg-main border border-border/50 rounded-xl px-3 py-2 text-xs font-bold text-text-main focus:outline-none focus:border-primary/40"
                        >
                          <option value="All">All Milestones</option>
                          <option value="v1.2.0">v1.2.0 Integration</option>
                          <option value="v1.3.0">v1.3.0 Redux Core</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Floating Bulk Action Center */}
            <AnimatePresence>
              {selectedPRIds.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.98 }}
                  className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-md"
                >
                  <div className="flex items-center gap-2.5 text-xs font-extrabold text-primary">
                    <CheckSquare size={16} />
                    <span>{selectedPRIds.length} Pull Requests Selected</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    <button
                      onClick={() => handleBulkStatusChange('Merged')}
                      className="bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm active:scale-[0.97]"
                    >
                      Bulk Merge
                    </button>
                    <button
                      onClick={() => handleBulkStatusChange('Closed')}
                      className="bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm active:scale-[0.97]"
                    >
                      Bulk Close
                    </button>
                    <button
                      onClick={() => handleBulkStatusChange('Open')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm active:scale-[0.97]"
                    >
                      Reopen Selected
                    </button>
                    <button
                      onClick={() => handleBulkAddLabel('high-priority')}
                      className="bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm active:scale-[0.97]"
                    >
                      Mark High Priority
                    </button>
                    <button
                      onClick={() => setSelectedPRIds([])}
                      className="text-xs font-bold text-text-muted hover:text-text-main px-2 py-1.5 transition-colors cursor-pointer"
                    >
                      Deselect
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* List Selection Header Helper */}
            {filteredPRs.length > 0 && (
              <div className="flex items-center justify-between px-1 text-xs text-text-muted font-bold select-none">
                <button 
                  onClick={() => toggleSelectAll(filteredPRs)}
                  className="flex items-center gap-2 hover:text-text-main transition-colors"
                >
                  {filteredPRs.every(pr => selectedPRIds.includes(pr.id)) ? (
                    <CheckSquare size={14} className="text-primary" />
                  ) : (
                    <Square size={14} />
                  )}
                  <span>Select All Visible</span>
                </button>
                <span>{filteredPRs.length} matching PRs</span>
              </div>
            )}

            {/* Pull Requests List */}
            <div className="space-y-3">
              {filteredPRs.map((pr) => {
                const isApproved = pr.status === 'Approved' || pr.status === 'Merged';
                const isDraft = pr.status === 'Draft';
                const isClosed = pr.status === 'Closed';
                const isSelected = selectedPRIds.includes(pr.id);
                
                return (
                  <div 
                    key={pr.id} 
                    className={`flex items-stretch border rounded-2xl overflow-hidden transition-all duration-150 ${
                      isSelected 
                        ? 'border-primary/80 bg-primary/5 shadow-sm' 
                        : 'border-border/60 bg-card hover:border-primary/45 hover:shadow-sm'
                    }`}
                  >
                    {/* Multiselect Column */}
                    <div 
                      onClick={() => toggleSelectPR(pr.id)}
                      className="flex items-center justify-center pl-4 pr-1 cursor-pointer hover:bg-hover/10 select-none shrink-0"
                    >
                      {isSelected ? (
                        <CheckSquare size={16} className="text-primary" />
                      ) : (
                        <Square size={16} className="text-text-muted/50 hover:text-text-main transition-colors" />
                      )}
                    </div>

                    {/* PR Body Trigger Column */}
                    <div 
                      onClick={() => { setSelectedPRId(pr.id); setDetailTab('conversation'); }}
                      className="flex-1 p-4 pl-3 flex gap-3.5 items-start cursor-pointer min-w-0"
                    >
                      <div className="mt-0.5 shrink-0">
                        {pr.status === 'Merged' ? (
                          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center">
                            <GitPullRequest size={15} strokeWidth={2.5} />
                          </div>
                        ) : isClosed ? (
                          <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center">
                            <GitPullRequest size={15} strokeWidth={2.5} />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
                            <GitPullRequest size={15} strokeWidth={2.5} />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="text-sm font-bold text-text-main leading-tight hover:text-primary transition-colors truncate">
                            {pr.title}
                          </h4>
                          
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border tracking-wide uppercase shrink-0 ${
                            pr.status === 'Merged' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                            isClosed ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                            isDraft ? 'bg-hover text-text-muted border-border/70' :
                            isApproved ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25' :
                            'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          }`}>
                            {pr.status}
                          </span>
                        </div>

                        <div className="text-[11px] text-text-muted font-semibold flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-text-main font-mono">#{pr.id}</span>
                          <span className="text-border/80">•</span>
                          <span>opened {pr.time}</span>
                          <span className="text-border/80">•</span>
                          <span>by</span>
                          <span className="text-text-main font-bold">{pr.author}</span>
                          
                          {/* Label Badges */}
                          {pr.id % 3 === 0 && (
                            <span className="text-[9px] font-extrabold px-2 py-0.1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/15">feature</span>
                          )}
                          {pr.id % 3 === 1 && (
                            <span className="text-[9px] font-extrabold px-2 py-0.1 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/15">bug</span>
                          )}
                          {pr.id % 2 === 0 && (
                            <span className="text-[9px] font-extrabold px-2 py-0.1 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/15">high-priority</span>
                          )}
                        </div>

                        {/* Branch flow and details connector */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-1.5 border-t border-border/40">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded-lg bg-main border border-border/50 text-text-muted max-w-[140px] truncate">
                              {pr.source || 'feature'}
                            </span>
                            <CornerDownRight size={10} className="text-text-muted shrink-0" />
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded-lg bg-main border border-border/50 text-text-main font-bold max-w-[140px] truncate">
                              {pr.target || 'main'}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-[11px] text-text-muted font-bold">
                              <MessageSquare size={12} />
                              <span>{pr.comments || 0}</span>
                            </div>
                            
                            <CiCdBadge hash={pr.title} isCompact />

                            {pr.avatar ? (
                              <img src={pr.avatar} className="w-5.5 h-5.5 rounded-full border border-border object-cover" alt="" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-5.5 h-5.5 rounded-full bg-primary/10 text-[8px] font-extrabold flex items-center justify-center text-primary border border-primary/20">
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
                <div className="bg-card border border-border rounded-2xl py-14 px-4 text-center">
                  <GitPullRequest size={40} className="text-text-muted/40 mx-auto mb-3" />
                  <p className="text-xs text-text-main font-bold uppercase tracking-wider">No Pull Requests Found</p>
                  <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto leading-relaxed">
                    We couldn't find any pull requests matching your current tab filter or search keyword. Try clearing filters to start fresh!
                  </p>
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setFilterAuthor('All');
                      setFilterLabel('All');
                      setFilterAssignee('All');
                      setFilterMilestone('All');
                    }}
                    className="mt-5 text-xs font-bold text-primary hover:underline cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          // ==================================================================
          // REDESIGNED PR DETAIL VIEW
          // ==================================================================
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Elegant Header Action Strip */}
            <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border/30 pb-3">
                <button 
                  onClick={() => setSelectedPRId(null)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-text-muted hover:text-text-main transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} /> Back to Hub
                </button>

                <button
                  onClick={() => setIsReviewFormOpen(!isReviewFormOpen)}
                  className="bg-primary hover:bg-primary-hover text-white text-[11px] font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
                >
                  <CheckCircle size={13} />
                  <span>Review Code Changes</span>
                </button>
              </div>

              {/* Title & Stats */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border ${
                      selectedPR.status === 'Merged' ? 'bg-purple-500/15 text-purple-500 border-purple-500/25' :
                      selectedPR.status === 'Closed' ? 'bg-rose-500/15 text-rose-500 border-rose-500/25' :
                      selectedPR.status === 'Approved' ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/25' :
                      'bg-emerald-500/15 text-emerald-500 border-emerald-500/25'
                    }`}>
                      <GitPullRequest size={13} strokeWidth={2.5} />
                      {selectedPR.status}
                    </span>
                    <span className="text-xs text-text-muted font-mono font-bold bg-hover/50 px-2.5 py-0.5 rounded-lg border border-border/30">#{selectedPR.id}</span>
                  </div>
                  
                  <h2 className="text-lg md:text-xl font-black text-text-main leading-snug break-words">
                    {selectedPR.title}
                  </h2>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted font-semibold">
                    <span>opened {selectedPR.time}</span>
                    <span className="text-border/60">•</span>
                    <span>by</span>
                    <span className="text-text-main font-bold">{selectedPR.author}</span>
                    <span className="text-border/60">•</span>
                    <span className="text-text-main font-bold">{getPRCommits(selectedPR.id, selectedPR.title).length} commits</span>
                    <span className="text-border/60">•</span>
                    <span className="text-text-main font-bold">{getPRFiles(selectedPR.id, selectedPR.title).length} files changed</span>
                  </div>
                </div>

                {/* Branches Visual Map */}
                <div className="bg-main/30 border border-border/50 rounded-xl p-3 flex flex-col justify-center min-w-[240px] shrink-0">
                  <div className="text-[9px] font-extrabold text-text-muted uppercase tracking-widest mb-1.5">Branch Target Connection</div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[10px] px-2 py-1 rounded bg-card border border-border/50 text-text-muted truncate max-w-[110px]" title={selectedPR.source}>
                      {selectedPR.source || 'feature'}
                    </span>
                    <CornerDownRight size={13} className="text-text-muted shrink-0 rotate-[-45deg]" />
                    <span className="font-mono text-[10px] px-2 py-1 rounded bg-card border border-border/50 text-text-main font-extrabold truncate max-w-[110px]" title={selectedPR.target}>
                      {selectedPR.target || 'main'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Review Accordion Overlay Drawer */}
              <AnimatePresence>
                {isReviewFormOpen && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-main/40 border border-border/60 rounded-2xl p-5 mt-3 space-y-4">
                      <span className="text-xs font-black text-text-main block uppercase tracking-wider">Draft Pull Request Review Feedback</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { id: 'comment', label: 'Comment Only', desc: 'Submit general questions or feedback' },
                          { id: 'approve', label: 'Approve changes', desc: 'Certify files and authorize merging' },
                          { id: 'request_changes', label: 'Request Changes', desc: 'Require changes before merge' }
                        ].map((opt) => (
                          <div
                            key={opt.id}
                            onClick={() => setReviewStatus(opt.id as any)}
                            className={`p-3.5 rounded-xl border cursor-pointer select-none transition-all ${
                              reviewStatus === opt.id 
                                ? 'bg-primary/5 border-primary text-primary shadow-sm' 
                                : 'bg-card border-border/40 hover:bg-hover/20 text-text-muted'
                            }`}
                          >
                            <span className={`block text-xs font-bold ${reviewStatus === opt.id ? 'text-primary' : 'text-text-main'}`}>{opt.label}</span>
                            <span className="block text-[10px] opacity-75 mt-1 leading-relaxed">{opt.desc}</span>
                          </div>
                        ))}
                      </div>

                      <textarea
                        rows={3}
                        value={reviewBody}
                        onChange={(e) => setReviewBody(e.target.value)}
                        placeholder="Add constructive comments, requirements or summary notes..."
                        className="w-full bg-card text-xs font-semibold p-3 rounded-xl border border-border/50 focus:outline-none focus:border-primary/50 text-text-main resize-none"
                      />

                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setIsReviewFormOpen(false)}
                          className="border border-border/50 text-text-muted text-xs font-bold px-4 py-2 rounded-xl hover:bg-hover transition-colors cursor-pointer"
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
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tab Selector Strip for Detail Panels */}
              <div className="flex border-t border-border/30 pt-4 overflow-x-auto no-scrollbar gap-2">
                {[
                  { id: 'conversation', label: 'Conversation', icon: <MessageSquare size={13} />, count: customComments.length },
                  { id: 'commits', label: 'Commits', icon: <GitCommit size={13} />, count: getPRCommits(selectedPR.id, selectedPR.title).length },
                  { id: 'files', label: 'Files Changed', icon: <FileCode size={13} />, count: getPRFiles(selectedPR.id, selectedPR.title).length }
                ].map((tab) => {
                  const isActive = detailTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setDetailTab(tab.id as any)}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all shrink-0 select-none ${
                        isActive 
                          ? 'bg-primary text-white shadow-sm' 
                          : 'bg-main/50 text-text-muted hover:bg-hover hover:text-text-main'
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-white/25 text-white' : 'bg-hover text-text-muted'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Split screen content area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              
              {/* Left Core Module (9 Columns) */}
              <div className="lg:col-span-9 space-y-4">
                
                {/* 1. CONVERSATION VIEW MODULE */}
                {detailTab === 'conversation' && (
                  <div className="space-y-4">
                    
                    {/* Opened description container */}
                    <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-sm space-y-3.5">
                      <div className="flex items-center gap-2.5 border-b border-border/30 pb-3">
                        {selectedPR.avatar ? (
                          <img src={selectedPR.avatar} className="w-6.5 h-6.5 rounded-full border border-border object-cover" alt="" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-6.5 h-6.5 rounded-full bg-primary/10 text-[10px] font-extrabold flex items-center justify-center text-primary border border-primary/25">
                            {selectedPR.author.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <span className="text-xs font-bold text-text-main">{selectedPR.author}</span>
                          <span className="text-[10px] text-text-muted ml-2 font-medium">opened this pull request {selectedPR.time}</span>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs text-text-main leading-relaxed">
                        <p className="font-extrabold text-sm">Specification & Details</p>
                        <p className="whitespace-pre-wrap text-text-muted font-semibold">{selectedPR.desc || "No description provided."}</p>
                      </div>
                    </div>

                    {/* Timeline Activity Loop */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-widest pl-1.5 block">Review Discussion timeline</span>
                      
                      <div className="space-y-3 relative before:absolute before:top-2 before:bottom-2 before:left-[17px] before:w-[2px] before:bg-border/30">
                        
                        {/* Event list start */}
                        <div className="flex gap-4 items-start relative z-10 animate-fade-up">
                          <div className="w-9 h-9 rounded-full bg-main border border-border flex items-center justify-center shrink-0 shadow-sm">
                            <Plus size={14} className="text-text-muted" />
                          </div>
                          <div className="bg-card border border-border/60 rounded-xl p-3 flex-1 min-w-0">
                            <p className="text-xs text-text-muted font-medium">
                              <span className="font-bold text-text-main">{selectedPR.author}</span> initialized branch merger pipeline yesterday.
                            </p>
                          </div>
                        </div>

                        {/* Stored Timeline Events */}
                        {customComments.map((comment) => {
                          if (comment.isSystem) {
                            const isApp = comment.type === 'approve';
                            const isReq = comment.type === 'request_changes';
                            return (
                              <div key={comment.id} className="flex gap-4 items-start relative z-10 animate-fade-up">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border shadow-sm ${
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

                          const isApprove = comment.type === 'approve';
                          const isReq = comment.type === 'request_changes';
                          
                          return (
                            <div key={comment.id} className="flex gap-4 items-start relative z-10 animate-fade-up">
                              {comment.avatar ? (
                                <img src={comment.avatar} className="w-9 h-9 rounded-full border border-border/70 object-cover shrink-0 shadow-sm" alt="" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold flex items-center justify-center text-primary shrink-0 shadow-sm">
                                  {comment.author.substring(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div className={`border rounded-xl p-4 flex-1 min-w-0 space-y-2 shadow-sm ${
                                isApprove ? 'border-emerald-500/30 bg-emerald-500/5' :
                                isReq ? 'border-rose-500/30 bg-rose-500/5' :
                                'border-border/60 bg-card'
                              }`}>
                                <div className="flex items-center justify-between gap-2 border-b border-border/30 pb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-text-main">{comment.author}</span>
                                    {isApprove && (
                                      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">Approved review</span>
                                    )}
                                    {isReq && (
                                      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500">Changes requested</span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-text-muted font-bold">{comment.time}</span>
                                </div>
                                <p className="text-xs text-text-muted font-semibold leading-relaxed whitespace-pre-wrap">
                                  {comment.text}
                                </p>
                              </div>
                            </div>
                          );
                        })}

                        {/* Live Automated Runners Integration */}
                        <div className="flex gap-4 items-start relative z-10 animate-fade-up">
                          <div className="w-9 h-9 rounded-full bg-main border border-border flex items-center justify-center shrink-0 shadow-sm">
                            <Clock size={14} className="text-primary animate-pulse" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CiCdPipelineFlow hash={selectedPR.title} />
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* New General Comment Submission */}
                    <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-sm space-y-3.5">
                      <div className="text-xs font-bold text-text-main flex items-center gap-1.5 uppercase tracking-wide">
                        <MessageCircle size={15} className="text-primary" /> Leave General comment
                      </div>
                      <textarea 
                        rows={3}
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        placeholder="Type standard developer logs or reviews here..."
                        className="w-full bg-main/35 text-xs font-semibold p-3 rounded-xl border border-border/50 focus:outline-none focus:border-primary/50 text-text-main resize-none"
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={handleAddComment}
                          disabled={!newCommentText.trim()}
                          className="bg-primary hover:bg-primary-hover disabled:opacity-40 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
                        >
                          <Send size={12} /> Submit Comment
                        </button>
                      </div>
                    </div>

                    {/* Elite Merging Control Block */}
                    <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-sm space-y-4">
                      <div className="text-xs font-extrabold text-text-main uppercase tracking-widest flex items-center gap-1.5 border-b border-border/30 pb-3">
                        <GitMerge size={15} className="text-primary animate-pulse" />
                        <span>Integration Merger Control panel</span>
                      </div>

                      {selectedPR.status === 'Merged' ? (
                        <div className="bg-purple-500/5 border border-purple-500/15 rounded-xl p-4.5 space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-500 flex items-center justify-center shrink-0">
                              <Check size={14} strokeWidth={3} />
                            </div>
                            <div className="space-y-1">
                              <span className="block text-xs font-bold text-purple-500">PR Merged Successfully</span>
                              <p className="text-xs text-text-muted font-semibold">
                                Git merged source branch into checkout target branch. Local workspace updated.
                              </p>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-purple-500/10">
                            <button 
                              onClick={handleReopenPR}
                              className="text-xs font-bold text-primary hover:underline cursor-pointer"
                            >
                              Reopen Pull Request
                            </button>
                          </div>
                        </div>
                      ) : selectedPR.status === 'Closed' ? (
                        <div className="bg-rose-500/5 border border-rose-500/15 rounded-xl p-4.5 space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-rose-500/15 border border-rose-500/35 text-rose-500 flex items-center justify-center shrink-0">
                              <X size={14} strokeWidth={3} />
                            </div>
                            <div className="space-y-1">
                              <span className="block text-xs font-bold text-rose-500">PR Closed Without Merging</span>
                              <p className="text-xs text-text-muted font-semibold">
                                Review logs are closed manually. Code was not integrated.
                              </p>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-rose-500/10">
                            <button 
                              onClick={handleReopenPR}
                              className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                            >
                              Reopen Pull Request
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Active Open PR merge card
                        <div className="border border-border/50 rounded-xl overflow-hidden bg-main/10">
                          <div className={`p-4 border-b border-border/50 flex items-start gap-3 ${
                            selectedPR.status === 'Approved' ? 'bg-emerald-500/5' : 'bg-amber-500/5'
                          }`}>
                            <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                              selectedPR.status === 'Approved' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-500'
                            }`}>
                              <Check size={11} strokeWidth={3} />
                            </div>
                            <div className="space-y-0.5">
                              <span className={`block text-xs font-bold ${selectedPR.status === 'Approved' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                {selectedPR.status === 'Approved' ? 'Merger authorized by reviewers' : 'Review requested'}
                              </span>
                              <span className="block text-[10px] text-text-muted font-semibold">
                                {selectedPR.status === 'Approved' ? 'Satisfied reviewer specifications.' : 'Merges are unlocked but approved reviews are highly recommended.'}
                              </span>
                            </div>
                          </div>

                          <div className="p-4 space-y-4">
                            {/* Merge Strategy Options */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                              {[
                                { id: 'merge', title: 'Merge Commit', desc: 'Preserve full timeline graph' },
                                { id: 'squash', title: 'Squash & Merge', desc: 'Combine commits into 1 block' },
                                { id: 'rebase', title: 'Rebase & Merge', desc: 'Rebase commits sequentially' }
                              ].map((strategy) => (
                                <div 
                                  key={strategy.id}
                                  onClick={() => setMergeStrategy(strategy.id as any)}
                                  className={`p-3 rounded-xl border cursor-pointer select-none transition-all ${
                                    mergeStrategy === strategy.id 
                                      ? 'bg-primary/5 border-primary text-primary shadow-sm' 
                                      : 'bg-card border-border/50 text-text-muted hover:border-border hover:bg-hover/10'
                                  }`}
                                >
                                  <span className={`block text-[11px] font-extrabold ${mergeStrategy === strategy.id ? 'text-primary' : 'text-text-main'}`}>
                                    {strategy.title}
                                  </span>
                                  <span className="block text-[9px] font-medium opacity-80 mt-1">{strategy.desc}</span>
                                </div>
                              ))}
                            </div>

                            {/* Message Customization */}
                            <div className="space-y-2.5 bg-card border border-border/50 rounded-xl p-3.5">
                              <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">Commit Specs</span>
                              <input 
                                type="text" 
                                value={customMergeTitle}
                                onChange={(e) => setCustomMergeTitle(e.target.value)}
                                placeholder="Commit message title"
                                className="w-full bg-main/40 text-xs font-bold p-2.5 rounded-lg border border-border/50 focus:outline-none focus:border-primary/40 text-text-main"
                              />
                              <textarea 
                                rows={2}
                                value={customMergeDesc}
                                onChange={(e) => setCustomMergeDesc(e.target.value)}
                                placeholder="Commit message description..."
                                className="w-full bg-main/40 text-xs font-semibold p-2.5 rounded-lg border border-border/50 focus:outline-none focus:border-primary/40 text-text-main resize-none"
                              />
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border/20">
                              <button 
                                onClick={handleMergePR}
                                disabled={isMerging}
                                className="bg-success hover:bg-emerald-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm active:scale-[0.98]"
                              >
                                {isMerging ? (
                                  <>
                                    <RefreshCw size={13} className="animate-spin" />
                                    <span>Syncing code merge...</span>
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
                                className="border border-border/70 hover:bg-rose-500/10 hover:border-rose-500 hover:text-rose-500 text-text-muted text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <X size={13} /> Close Pull Request
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Mobile metadata bottom triggers */}
                    <button
                      onClick={() => setIsMobileMetadataOpen(true)}
                      className="block lg:hidden w-full bg-main text-text-muted border border-border/50 hover:text-text-main hover:bg-hover/40 text-xs font-bold py-3.5 rounded-2xl transition-all cursor-pointer"
                    >
                      View PR Specifications & Metadata
                    </button>
                  </div>
                )}

                {/* 2. COMMITS VIEW MODULE */}
                {detailTab === 'commits' && (
                  <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-sm space-y-4.5">
                    <div className="text-xs font-bold text-text-main uppercase tracking-wider flex items-center gap-1.5 border-b border-border/30 pb-3">
                      <GitCommit size={15} className="text-primary" />
                      <span>Timeline Commits</span>
                    </div>

                    <div className="relative pl-6 space-y-5 before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-[2px] before:bg-border/40">
                      {getPRCommits(selectedPR.id, selectedPR.title).map((commit) => (
                        <div key={commit.hash} className="relative group animate-fade-up">
                          <div className="absolute -left-[20px] top-1.5 w-3.5 h-3.5 rounded-full bg-card border-2 border-primary group-hover:bg-primary transition-all shrink-0 z-10" />
                          
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-0.5">
                              <span className="block text-xs font-bold text-text-main hover:text-primary transition-colors leading-relaxed">
                                {commit.msg}
                              </span>
                              <div className="flex items-center gap-1.5 text-[10px] text-text-muted font-bold">
                                <span className="text-text-main font-bold">{commit.author}</span>
                                <span>committed</span>
                                <span>{commit.time}</span>
                              </div>
                            </div>

                            <span className="font-mono text-[10px] bg-main border border-border/50 text-primary font-bold px-2 py-0.5 rounded-md self-start sm:self-center shadow-sm select-all">
                              {commit.hash}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. FILES CHANGED VIEW MODULE (Unified interactive diff code) */}
                {detailTab === 'files' && (
                  <div className="space-y-4">
                    {/* Progress strip */}
                    <div className="bg-card border border-border/70 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-text-main uppercase tracking-wider flex items-center gap-1.5">
                          <FileCode size={14} className="text-primary" />
                          <span>Code Difference Reviewer</span>
                        </div>
                        <div className="text-[10px] text-text-muted font-bold">
                          {Object.values(viewedFiles).filter(Boolean).length} of {getPRFiles(selectedPR.id, selectedPR.title).length} files reviewed
                        </div>
                      </div>

                      <div className="w-full sm:w-44 flex flex-col gap-1 shrink-0">
                        <div className="w-full bg-main h-2 rounded-full overflow-hidden border border-border/40">
                          <div 
                            className="bg-success h-full transition-all duration-300" 
                            style={{ width: `${(Object.values(viewedFiles).filter(Boolean).length / getPRFiles(selectedPR.id, selectedPR.title).length) * 100}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-text-muted font-extrabold text-right block">
                          {Math.round((Object.values(viewedFiles).filter(Boolean).length / getPRFiles(selectedPR.id, selectedPR.title).length) * 100)}% complete
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                      
                      {/* Left Sidebar Files tree picker */}
                      <div className="lg:col-span-3 bg-card border border-border/70 rounded-2xl p-3.5 shadow-sm space-y-2">
                        <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-widest block border-b border-border/30 pb-2 mb-2">Files Changed</span>
                        
                        {/* Mobile horizontal file picker / Desktop vertical sidebar tree */}
                        <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-1.5 no-scrollbar -mx-3.5 px-3.5 lg:mx-0 lg:px-0">
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
                                    : 'bg-main/20 border-transparent hover:border-border/40 text-text-muted'
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

                      {/* Code Diff Display Module */}
                      <div className="lg:col-span-9 space-y-4">
                        {getPRFiles(selectedPR.id, selectedPR.title).filter(f => f.filename === activeFileInTree).map((file) => {
                          const isFileViewed = viewedFiles[file.filename];
                          const parsedLines = parseDiffPatch(file.patch);

                          return (
                            <div key={file.filename} className="bg-card border border-border/70 rounded-2xl overflow-hidden shadow-sm animate-fade-up">
                              
                              {/* Diff Header Panel */}
                              <div className="bg-main/40 px-4 py-3 border-b border-border/50 flex items-center justify-between gap-3 flex-wrap">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="font-mono text-[11px] font-bold text-text-main truncate">{file.filename}</span>
                                  <div className="flex items-center gap-1 text-[10px] font-bold">
                                    <span className="text-success">+{file.additions}</span>
                                    <span className="text-danger">-{file.deletions}</span>
                                  </div>
                                </div>

                                <button
                                  onClick={() => toggleFileViewed(file.filename)}
                                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${
                                    isFileViewed 
                                      ? 'bg-success/15 border-success/30 text-success' 
                                      : 'bg-card border-border hover:bg-hover text-text-muted'
                                  }`}
                                >
                                  <Check size={11} />
                                  <span>{isFileViewed ? 'Viewed' : 'Mark Viewed'}</span>
                                </button>
                              </div>

                              {/* Interactive diff core code blocks */}
                              <AnimatePresence initial={false}>
                                {!isFileViewed ? (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-x-auto w-full"
                                  >
                                    <table className="w-full text-[11px] font-mono border-collapse divide-y divide-border/10">
                                      <tbody>
                                        {parsedLines.map((line, idx) => {
                                          const isHeader = line.type === 'header';
                                          const isAdd = line.type === 'add';
                                          const isDel = line.type === 'del';
                                          
                                          const bgStyle = isHeader ? 'bg-sky-500/5 text-primary/85 font-bold border-b border-border/15' :
                                                            isAdd ? 'bg-emerald-500/10 text-emerald-500 border-l-[3px] border-emerald-500/60' :
                                                            isDel ? 'bg-rose-500/10 text-rose-500 border-l-[3px] border-rose-500/60' :
                                                            'hover:bg-hover/15';

                                          const lineKey = `${file.filename}_${idx}`;
                                          const lineComments = inlineComments[lineKey] || [];
                                          const isFormOpen = inlineInputLine?.filename === file.filename && inlineInputLine?.lineIndex === idx;

                                          return (
                                            <React.Fragment key={idx}>
                                              <tr className={`group relative transition-colors ${bgStyle}`}>
                                                {/* Line number cols */}
                                                <td className="w-10 text-right pr-2 text-[10px] text-text-muted/60 select-none bg-main/15 border-r border-border/30 font-semibold py-0.5">
                                                  {line.oldNum}
                                                </td>
                                                <td className="w-10 text-right pr-2 text-[10px] text-text-muted/60 select-none bg-main/15 border-r border-border/30 font-semibold py-0.5">
                                                  {line.newNum}
                                                </td>
                                                
                                                {/* Inline comments trigger action column */}
                                                <td className="w-6 text-center select-none py-0.5 relative">
                                                  {!isHeader && (
                                                    <button
                                                      onClick={() => setInlineInputLine(isFormOpen ? null : { filename: file.filename, lineIndex: idx })}
                                                      className="absolute left-1.5 top-0.5 w-4.5 h-4.5 bg-primary text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow active:scale-90"
                                                      title="Add inline review comments"
                                                    >
                                                      <Plus size={10} strokeWidth={3} />
                                                    </button>
                                                  )}
                                                </td>

                                                {/* Code diff characters line */}
                                                <td className="pl-3 pr-4 whitespace-pre select-text font-medium py-0.5 tracking-wide leading-normal">
                                                  {line.text}
                                                </td>
                                              </tr>

                                              {/* Inline review discussion comments thread */}
                                              {lineComments.length > 0 && (
                                                <tr>
                                                  <td colSpan={3} className="bg-main/15 border-r border-border/30"></td>
                                                  <td className="p-3.5 bg-main/5 border-b border-border/10">
                                                    <div className="space-y-2.5 max-w-xl">
                                                      {lineComments.map((c) => (
                                                        <div key={c.id} className="bg-card border border-border/50 rounded-xl p-3 shadow-sm animate-fade-up">
                                                          <div className="flex items-center justify-between border-b border-border/30 pb-1.5 mb-2">
                                                            <div className="flex items-center gap-1.5">
                                                              {c.avatar ? (
                                                                <img src={c.avatar} className="w-4 h-4 rounded-full border border-border/70" alt="" referrerPolicy="no-referrer" />
                                                              ) : (
                                                                <div className="w-4 h-4 rounded-full bg-primary/10 text-[8px] font-extrabold flex items-center justify-center text-primary">US</div>
                                                              )}
                                                              <span className="text-[10px] font-extrabold text-text-main">{c.author}</span>
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

                                              {/* Form to submit inline comments thread */}
                                              {isFormOpen && (
                                                <tr>
                                                  <td colSpan={3} className="bg-main/15 border-r border-border/30"></td>
                                                  <td className="p-4 bg-main/10 border-b border-border/10">
                                                    <div className="bg-card border border-border/75 rounded-xl p-3.5 space-y-3 max-w-xl shadow-md">
                                                      <div className="text-[10px] font-black text-text-main flex items-center gap-1.5 uppercase tracking-wider">
                                                        <MessageSquare size={12} className="text-primary" />
                                                        <span>Write inline review comment</span>
                                                      </div>
                                                      <textarea
                                                        rows={2}
                                                        value={inlineCommentText}
                                                        onChange={(e) => setInlineCommentText(e.target.value)}
                                                        placeholder="Provide constructive code architectural feedback..."
                                                        className="w-full bg-main/30 text-[11px] font-semibold p-2.5 rounded-lg border border-border/50 focus:outline-none focus:border-primary/40 text-text-main resize-none"
                                                      />
                                                      <div className="flex justify-end gap-1.5">
                                                        <button
                                                          onClick={() => setInlineInputLine(null)}
                                                          className="border border-border/50 text-text-muted text-[10px] font-extrabold px-3 py-1 rounded-lg hover:bg-hover cursor-pointer"
                                                        >
                                                          Cancel
                                                        </button>
                                                        <button
                                                          onClick={() => handleAddInlineComment(file.filename, idx)}
                                                          disabled={!inlineCommentText.trim()}
                                                          className="bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-[10px] font-extrabold px-4 py-1 rounded-lg cursor-pointer active:scale-95 transition-all"
                                                        >
                                                          Post Review
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
                                  <div className="py-12 text-center bg-main/5 border-t border-border/30 select-none">
                                    <CheckCircle size={22} className="text-success mx-auto mb-2" />
                                    <p className="text-xs text-text-main font-bold">This file has been marked reviewed</p>
                                    <button
                                      onClick={() => toggleFileViewed(file.filename)}
                                      className="mt-3 text-[10px] font-bold text-primary hover:underline cursor-pointer"
                                    >
                                      Expand to check diff content
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

              {/* Right Sidebar Deck Panel (Desktop Only, width 3) */}
              <div className="hidden lg:block lg:col-span-3 space-y-4">
                
                {/* 1. checkout branch status card */}
                <div className="bg-card border border-border/70 rounded-2xl p-4.5 shadow-sm space-y-3.5">
                  <div className="text-[10px] font-black text-text-muted uppercase tracking-widest pb-1.5 border-b border-border/30">Checkout Target</div>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-[9px] font-extrabold text-text-muted uppercase tracking-wider">Source branch</span>
                      <div className="flex items-center justify-between gap-1.5 bg-main border border-border/40 px-2 py-1.5 rounded-xl mt-1.5">
                        <span className="font-mono text-[10px] text-text-muted truncate flex-1">{selectedPR.source || 'feature-branch'}</span>
                        <button 
                          onClick={() => copyCheckoutCommand(selectedPR.source || 'feature-branch')}
                          className="p-1 hover:text-primary text-text-muted/60 transition-colors cursor-pointer"
                          title="Copy checkout command"
                        >
                          <Clipboard size={11} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] font-extrabold text-text-muted uppercase tracking-wider">Target branch</span>
                      <div className="flex items-center justify-between gap-1.5 bg-main border border-border/40 px-2 py-1.5 rounded-xl mt-1.5">
                        <span className="font-mono text-[10px] text-text-main font-extrabold truncate flex-1">{selectedPR.target || 'main'}</span>
                        <button 
                          onClick={() => copyCheckoutCommand(selectedPR.target || 'main')}
                          className="p-1 hover:text-primary text-text-muted/60 transition-colors cursor-pointer"
                          title="Copy checkout command"
                        >
                          <Clipboard size={11} />
                        </button>
                      </div>
                    </div>

                    {isCopiedCommand && (
                      <span className="block text-[9px] text-primary font-bold text-center animate-pulse">
                        Git command copied!
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. Reviewers Card */}
                <div className="bg-card border border-border/70 rounded-2xl p-4.5 shadow-sm space-y-3">
                  <div className="text-[10px] font-black text-text-muted uppercase tracking-widest pb-1.5 border-b border-border/30">Reviewers</div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5.5 h-5.5 rounded-full bg-primary/10 border border-primary/20 text-[8px] font-extrabold flex items-center justify-center text-primary">LA</div>
                      <span className="text-xs text-text-main font-extrabold">lead-architect</span>
                    </div>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md border ${
                      selectedPR.status === 'Approved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                    }`}>
                      {selectedPR.status === 'Approved' ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                </div>

                {/* 3. Assignees Card */}
                <div className="bg-card border border-border/70 rounded-2xl p-4.5 shadow-sm space-y-3">
                  <div className="text-[10px] font-black text-text-muted uppercase tracking-widest pb-1.5 border-b border-border/30">Assignees</div>
                  <div className="flex items-center gap-2">
                    {selectedPR.avatar ? (
                      <img src={selectedPR.avatar} className="w-5.5 h-5.5 rounded-full border border-border object-cover" alt="" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-5.5 h-5.5 rounded-full bg-primary/10 text-[8px] font-extrabold flex items-center justify-center text-primary border border-primary/20">ME</div>
                    )}
                    <span className="text-xs text-text-main font-extrabold">{selectedPR.author}</span>
                  </div>
                </div>

                {/* 4. Labels Card */}
                <div className="bg-card border border-border/70 rounded-2xl p-4.5 shadow-sm space-y-3">
                  <div className="text-[10px] font-black text-text-muted uppercase tracking-widest pb-1.5 border-b border-border/30">Labels</div>
                  <div className="flex items-center flex-wrap gap-1.5">
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">feature</span>
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">high-priority</span>
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">automerge</span>
                  </div>
                </div>

                {/* 5. Milestone status card */}
                <div className="bg-card border border-border/70 rounded-2xl p-4.5 shadow-sm space-y-3">
                  <div className="text-[10px] font-black text-text-muted uppercase tracking-widest pb-1.5 border-b border-border/30">Milestone</div>
                  <div className="space-y-2.5">
                    <span className="text-xs text-text-main font-extrabold block">v1.2.0 Integration</span>
                    <div className="space-y-1.5">
                      <div className="w-full bg-main h-1.5 rounded-full overflow-hidden border border-border/30">
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
          UX MASTERCLASS MOBILE OVERLAY SLIDER DRAWERS
          ================================================================== */}
      
      {/* 1. Mobile Filter sheet overlay */}
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
              transition={{ type: 'spring', damping: 24, stiffness: 210 }}
              className="absolute bottom-0 left-0 right-0 max-h-[82vh] bg-card border-t border-border rounded-t-3xl p-5 overflow-y-auto space-y-5 shadow-2xl pb-10"
            >
              <div className="flex justify-between items-center border-b border-border/40 pb-3">
                <span className="text-sm font-black text-text-main uppercase tracking-wider">Advanced PR Filters</span>
                <button 
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 rounded-full bg-hover text-text-muted hover:text-text-main transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Author</label>
                  <select
                    value={filterAuthor}
                    onChange={(e) => setFilterAuthor(e.target.value)}
                    className="w-full bg-main border border-border rounded-xl px-3.5 py-3 text-xs font-bold text-text-main focus:outline-none"
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
                    className="w-full bg-main border border-border rounded-xl px-3.5 py-3 text-xs font-bold text-text-main focus:outline-none"
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
                    className="w-full bg-main border border-border rounded-xl px-3.5 py-3 text-xs font-bold text-text-main focus:outline-none"
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
                    className="w-full bg-main border border-border rounded-xl px-3.5 py-3 text-xs font-bold text-text-main focus:outline-none"
                  >
                    <option value="All">All Milestones</option>
                    <option value="v1.2.0">v1.2.0 Integration</option>
                    <option value="v1.3.0">v1.3.0 Redux Core</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  onClick={() => {
                    setFilterAuthor('All');
                    setFilterLabel('All');
                    setFilterAssignee('All');
                    setFilterMilestone('All');
                  }}
                  className="flex-1 border border-border text-text-muted text-xs font-bold py-3.5 rounded-xl hover:bg-hover active:scale-[0.97] transition-all cursor-pointer"
                >
                  Reset All
                </button>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-1 bg-primary text-white text-xs font-bold py-3.5 rounded-xl active:scale-[0.97] transition-all cursor-pointer"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Mobile Details Metadata specifications drawer */}
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
              transition={{ type: 'spring', damping: 24, stiffness: 210 }}
              className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-card border-t border-border rounded-t-3xl p-5 overflow-y-auto space-y-5 shadow-2xl pb-12"
            >
              <div className="flex justify-between items-center border-b border-border/40 pb-3">
                <span className="text-sm font-black text-text-main uppercase tracking-wider">Review Metadata specs</span>
                <button 
                  onClick={() => setIsMobileMetadataOpen(false)}
                  className="p-1 rounded-full bg-hover text-text-muted hover:text-text-main transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Branch action paths */}
                <div className="bg-main/30 border border-border/50 rounded-xl p-3.5 space-y-2">
                  <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block">Checkout Actions</span>
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

                {/* Reviewer */}
                <div className="bg-main/30 border border-border/50 rounded-xl p-3.5 flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider">Reviewer</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-main font-bold">lead-architect</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                      selectedPR.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {selectedPR.status === 'Approved' ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Assignee */}
                <div className="bg-main/30 border border-border/50 rounded-xl p-3.5 flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider">Assignee</span>
                  <span className="text-xs text-text-main font-bold">{selectedPR.author}</span>
                </div>

                {/* Labels */}
                <div className="bg-main/30 border border-border/50 rounded-xl p-3.5 space-y-2">
                  <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block">Labels</span>
                  <div className="flex items-center flex-wrap gap-1.5 mt-1.5">
                    <span className="text-[9px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/20">feature</span>
                    <span className="text-[9px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-500 border border-indigo-500/20">high-priority</span>
                  </div>
                </div>

                {/* Milestone */}
                <div className="bg-main/30 border border-border/50 rounded-xl p-3.5 space-y-2">
                  <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block">Milestone Status</span>
                  <span className="text-xs text-text-main font-extrabold block">v1.2.0 Integration</span>
                  <div className="w-full bg-card h-1.5 rounded-full overflow-hidden border border-border/40">
                    <div className="bg-success h-full w-[85%]" />
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsMobileMetadataOpen(false)}
                className="w-full bg-primary text-white text-xs font-bold py-3.5 rounded-xl active:scale-[0.97] transition-all mt-4 cursor-pointer"
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
