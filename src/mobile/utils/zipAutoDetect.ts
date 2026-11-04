export interface RootCandidate {
  path: string; // e.g. "" (root) or "my-repo-main/" or "client/"
  displayLabel: string;
  score: number;
  matchedLandmarks: string[];
  fileCount: number;
}

/**
 * Common landmark files that indicate the root of a project
 */
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

/**
 * Analyzes the file paths inside a ZIP and finds candidate project roots
 */
export function analyzeZipRoots(rawPaths: string[]): {
  suggestedRoot: string;
  candidates: RootCandidate[];
  directoryTree: DirectoryNode;
} {
  // Normalize paths and filter out noise
  const cleanPaths = rawPaths
    .map(p => p.replace(/\\/g, '/').replace(/^\/+/, ''))
    .filter(p => p && !p.includes('__MACOSX/') && !p.endsWith('.DS_Store'));

  // Build directory set and structure
  const dirSet = new Set<string>();
  dirSet.add(''); // Repository root

  for (const path of cleanPaths) {
    const parts = path.split('/');
    let current = '';
    for (let i = 0; i < parts.length - 1; i++) {
      current = current ? `${current}/${parts[i]}` : parts[i];
      dirSet.add(`${current}/`);
    }
  }

  // Score each candidate directory
  const candidates: RootCandidate[] = [];

  for (const dir of dirSet) {
    const prefix = dir;
    let fileCount = 0;
    const matchedLandmarks: string[] = [];

    // Find files directly inside or under this prefix
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
      // Score based on matched landmarks and proximity to typical project depth
      let score = matchedLandmarks.length * 15;
      if (matchedLandmarks.includes('package.json')) score += 30;
      if (matchedLandmarks.includes('src')) score += 20;
      if (matchedLandmarks.includes('index.html')) score += 15;
      if (matchedLandmarks.includes('README.md') || matchedLandmarks.includes('readme.md')) score += 10;
      if (matchedLandmarks.includes('tsconfig.json')) score += 10;

      // Penalize excessively deep paths (usually deeper than 3 is a sub-package)
      const depth = dir ? dir.split('/').filter(Boolean).length : 0;
      if (depth === 1) score += 10; // e.g. "repo-main/" is the most common zip wrapper

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

  // Sort candidates by score descending
  candidates.sort((a, b) => b.score - a.score || a.path.length - b.path.length);

  const suggestedRoot = candidates.length > 0 && candidates[0].score > 0
    ? candidates[0].path
    : (candidates[0]?.path || '');

  // Build hierarchical directory node for visual picker
  const directoryTree = buildDirectoryHierarchy(Array.from(dirSet));

  return {
    suggestedRoot,
    candidates: candidates.slice(0, 6),
    directoryTree,
  };
}

export interface DirectoryNode {
  name: string;
  fullPath: string;
  children: DirectoryNode[];
}

function buildDirectoryHierarchy(dirPaths: string[]): DirectoryNode {
  const root: DirectoryNode = { name: 'Root (/)', fullPath: '', children: [] };
  const map = new Map<string, DirectoryNode>();
  map.set('', root);

  const sorted = dirPaths
    .filter(Boolean)
    .sort((a, b) => a.split('/').length - b.split('/').length);

  for (const dir of sorted) {
    const clean = dir.replace(/\/+$/, '');
    const parts = clean.split('/');
    const name = parts[parts.length - 1];
    const parentPath = parts.slice(0, -1).join('/') ? `${parts.slice(0, -1).join('/')}/` : '';

    const node: DirectoryNode = {
      name,
      fullPath: dir,
      children: [],
    };
    map.set(dir, node);

    const parent = map.get(parentPath) || root;
    parent.children.push(node);
  }

  return root;
}
