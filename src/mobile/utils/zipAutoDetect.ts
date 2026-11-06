import { DirectoryNode, buildDirectoryHierarchy } from './zipHierarchy';

export type { DirectoryNode };

export interface RootCandidate {
  path: string;
  displayLabel: string;
  score: number;
  matchedLandmarks: string[];
  fileCount: number;
}

const PROJECT_LANDMARKS = [
  'package.json',
  'tsconfig.json',
  'README.md',
  'readme.md',
  'src',
  'public',
  'index.html',
  'vite.config.ts',
  'vite.config.js',
  'next.config.js',
  'next.config.ts',
  'next.config.mjs',
  'Cargo.toml',
  'go.mod',
  'requirements.txt',
  'pyproject.toml',
  'pom.xml',
  'build.gradle',
  '.gitignore',
  'app',
];

export function analyzeZipRoots(rawPaths: string[]): {
  suggestedRoot: string;
  candidates: RootCandidate[];
  directoryTree: DirectoryNode;
} {
  const cleanPaths = rawPaths
    .map(p => p.replace(/\\/g, '/').replace(/^\/+/, ''))
    .filter(p => p && !p.includes('__MACOSX/') && !p.endsWith('.DS_Store'));

  const dirSet = new Set<string>();
  dirSet.add('');

  for (const path of cleanPaths) {
    const parts = path.split('/');
    let current = '';
    for (let i = 0; i < parts.length - 1; i++) {
      current = current ? `${current}/${parts[i]}` : parts[i];
      dirSet.add(`${current}/`);
    }
  }

  const candidates: RootCandidate[] = [];

  for (const dir of dirSet) {
    const prefix = dir;
    let fileCount = 0;
    const matchedLandmarks: string[] = [];

    for (const path of cleanPaths) {
      if (prefix === '' || path.startsWith(prefix)) {
        fileCount++;
        const subPath = prefix === '' ? path : path.slice(prefix.length);
        const topItem = subPath.split('/')[0];
        if (PROJECT_LANDMARKS.includes(topItem) && !matchedLandmarks.includes(topItem)) {
          matchedLandmarks.push(topItem);
        }
      }
    }

    if (fileCount > 0) {
      let score = matchedLandmarks.length * 15;
      if (matchedLandmarks.includes('package.json')) score += 30;
      if (matchedLandmarks.includes('src')) score += 20;
      if (matchedLandmarks.includes('index.html')) score += 15;
      if (matchedLandmarks.includes('README.md') || matchedLandmarks.includes('readme.md')) score += 10;
      if (matchedLandmarks.includes('tsconfig.json')) score += 10;

      const depth = dir ? dir.split('/').filter(Boolean).length : 0;
      if (depth === 1) score += 10;

      const displayLabel = dir === '' ? '/ (Root)' : dir;
      candidates.push({
        path: dir,
        displayLabel,
        score,
        matchedLandmarks,
        fileCount,
      });
    }
  }

  candidates.sort((a, b) => b.score - a.score || a.path.length - b.path.length);

  const suggestedRoot = candidates.length > 0 && candidates[0].score > 0
    ? candidates[0].path
    : (candidates[0]?.path || '');

  const directoryTree = buildDirectoryHierarchy(Array.from(dirSet));

  return {
    suggestedRoot,
    candidates: candidates.slice(0, 6),
    directoryTree,
  };
}
