import { FolderGit2, Plus, HardDrive, Sparkles, GitCommit, GitPullRequest, Sun, Moon } from 'lucide-react';

interface UseCommandPaletteItemsParams {
  githubRepos: any[];
  currentRepo: string | null;
  activeBranches: any[];
  query: string;
  theme: string;
  navigate: (screen: any) => void;
  openModal: (modal: any) => void;
  openRepo: (name: string) => void;
  switchBranch: (branch: string) => void;
  toggleTheme: () => void;
  openZipSync: () => void;
  onClose: () => void;
}

export const useCommandPaletteItems = ({
  githubRepos,
  currentRepo,
  activeBranches,
  query,
  theme,
  navigate,
  openModal,
  openRepo,
  switchBranch,
  toggleTheme,
  openZipSync,
  onClose,
}: UseCommandPaletteItemsParams) => {
  const matchedRepos = githubRepos
    .filter(r => r.name.toLowerCase().includes(query.toLowerCase()) || (r.description && r.description.toLowerCase().includes(query.toLowerCase())))
    .slice(0, 5);

  const matchedBranches = currentRepo 
    ? activeBranches.filter(b => b.name.toLowerCase().includes(query.toLowerCase())).slice(0, 4)
    : [];

  const actions = [
    {
      id: 'action-repos',
      title: 'Go to Repositories Explorer',
      category: 'Navigation',
      icon: FolderGit2,
      run: () => { navigate('repos'); onClose(); }
    },
    {
      id: 'action-new-repo',
      title: 'Create New Repository',
      category: 'Actions',
      icon: Plus,
      run: () => { openModal('repo'); onClose(); }
    },
    {
      id: 'action-clone',
      title: 'Clone Repository from URL',
      category: 'Actions',
      icon: HardDrive,
      run: () => { navigate('clone'); onClose(); }
    },
    ...(currentRepo ? [
      {
        id: 'action-zip-sync',
        title: `Sync ZIP package from AI Studio into "${currentRepo}"`,
        category: 'Git Sync',
        icon: Sparkles,
        run: () => { openZipSync(); onClose(); }
      },
      {
        id: 'action-commit',
        title: `Commit Changes in "${currentRepo}"`,
        category: 'Git',
        icon: GitCommit,
        run: () => { openModal('commit'); onClose(); }
      },
      {
        id: 'action-prs',
        title: `View Pull Requests for "${currentRepo}"`,
        category: 'Git',
        icon: GitPullRequest,
        run: () => { navigate('prs'); onClose(); }
      }
    ] : []),
    {
      id: 'action-theme',
      title: `Toggle Theme (${theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'})`,
      category: 'Preferences',
      icon: theme === 'dark' ? Sun : Moon,
      run: () => { toggleTheme(); onClose(); }
    }
  ].filter(a => a.title.toLowerCase().includes(query.toLowerCase()) || a.category.toLowerCase().includes(query.toLowerCase()));

  const items = [
    ...matchedRepos.map(r => ({ type: 'repo' as const, id: `repo-${r.name}`, data: r, run: () => { openRepo(r.name); onClose(); } })),
    ...matchedBranches.map(b => ({ type: 'branch' as const, id: `branch-${b.name}`, data: b, run: () => { switchBranch(b.name); onClose(); } })),
    ...actions.map(a => ({ type: 'action' as const, id: a.id, data: a, run: a.run }))
  ];

  return { matchedRepos, matchedBranches, actions, items };
};
