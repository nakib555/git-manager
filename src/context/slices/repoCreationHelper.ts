import { AppState } from '../../types';

export const buildInitialLocalRepo = (name: string, desc: string, isPrivate: boolean, lang: string, owner: string) => {
  const newRepoItem = {
    id: Date.now(),
    name,
    private: isPrivate,
    description: desc || 'Local repository',
    language: lang || 'TypeScript',
    pushed_at: new Date().toISOString(),
    owner: { login: owner },
    default_branch: 'main',
  };

  const initialCommit = {
    hash: 'init01a',
    fullHash: 'init01a88b72e11894a736cb47289d0263f9104b',
    msg: 'Initial commit: project setup and README',
    author: owner,
    time: 'Just now',
    date: new Date().toISOString(),
    timestamp: new Date().toISOString(),
    add: '12',
    del: '0',
    parents: [],
  };

  const initialFiles = [
    { name: 'README.md', path: 'README.md', type: 'file', size: 140 },
    { name: 'package.json', path: 'package.json', type: 'file', size: 320 },
    { name: 'src', path: 'src', type: 'dir' },
    { name: 'index.ts', path: 'src/index.ts', type: 'file', size: 85 },
  ];

  const initialBranches = [
    { name: 'main', commitHash: initialCommit.hash, isDefault: true, behindBy: 0, aheadBy: 0 }
  ];

  try {
    localStorage.setItem(`local_details_${name}_commits`, JSON.stringify([initialCommit]));
    localStorage.setItem(`local_details_${name}_files`, JSON.stringify(initialFiles));
    localStorage.setItem(`local_details_${name}_branches`, JSON.stringify(initialBranches));
    localStorage.setItem(`local_details_${name}_prs`, JSON.stringify([]));
  } catch (_) {}

  return { newRepoItem, initialCommit, initialFiles, initialBranches };
};
