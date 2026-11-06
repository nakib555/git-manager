export interface RepoTreeNode {
  name: string;
  path: string;
  type: 'dir' | 'file';
  children?: RepoTreeNode[];
}

export function buildRepoTree(files: { name: string; type: 'file' | 'dir' }[], search: string = ''): RepoTreeNode[] {
  const root: RepoTreeNode[] = [];
  const dirMap = new Map<string, RepoTreeNode>();

  const filtered = files.filter(f => {
    if (!search.trim()) return true;
    return f.name.toLowerCase().includes(search.toLowerCase());
  });

  for (const file of filtered) {
    const parts = file.name.split('/');
    let currentPath = '';

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1 && file.type === 'file';
      const parentPath = currentPath;
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      if (isFile) {
        const node: RepoTreeNode = { name: part, path: currentPath, type: 'file' };
        if (i === 0) {
          root.push(node);
        } else {
          const parent = dirMap.get(parentPath);
          if (parent && parent.children) {
            parent.children.push(node);
          }
        }
      } else {
        if (!dirMap.has(currentPath)) {
          const node: RepoTreeNode = { name: part, path: currentPath, type: 'dir', children: [] };
          dirMap.set(currentPath, node);
          if (i === 0) {
            root.push(node);
          } else {
            const parent = dirMap.get(parentPath);
            if (parent && parent.children) {
              parent.children.push(node);
            }
          }
        }
      }
    }
  }

  const sortNodes = (nodes: RepoTreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.type === 'dir' && b.type !== 'dir') return -1;
      if (a.type !== 'dir' && b.type === 'dir') return 1;
      return a.name.localeCompare(b.name);
    });
    for (const node of nodes) {
      if (node.children) sortNodes(node.children);
    }
  };
  sortNodes(root);
  return root;
}
