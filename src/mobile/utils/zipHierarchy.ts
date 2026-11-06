export interface DirectoryNode {
  name: string;
  fullPath: string;
  children: DirectoryNode[];
}

export function buildDirectoryHierarchy(dirPaths: string[]): DirectoryNode {
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
