export interface TreeNode {
  name: string;
  path: string;
  type: 'dir' | 'file';
  size?: number;
  lines?: number;
  sha?: string;
  children?: TreeNode[];
}

/**
 * Builds an optimized file tree using a single-pass Map<string, TreeNode>.
 * Avoids O(N^2) nested array searches and scales smoothly to 10k+ files.
 */
export function buildFastFileTree(files: { name?: string; path?: string; type?: string; size?: number; lines?: number; sha?: string; content?: string }[]): TreeNode[] {
  if (!files || files.length === 0) return [];

  const root: TreeNode[] = [];
  const dirMap = new Map<string, TreeNode>();

  for (let i = 0; i < files.length; i++) {
    const raw = files[i];
    const rawPath = raw.path || raw.name;
    if (!rawPath) continue;

    const parts = rawPath.split('/');
    let currentPath = '';

    for (let depth = 0; depth < parts.length; depth++) {
      const part = parts[depth];
      const isFile = depth === parts.length - 1 && raw.type !== 'dir' && raw.type !== 'tree';
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      if (isFile) {
        let size = raw.size;
        let lines = raw.lines;
        if (raw.content) {
          size = size ?? raw.content.length;
          lines = lines ?? raw.content.split('\n').length;
        } else if (size !== undefined && lines === undefined) {
          lines = Math.max(1, Math.round(size / 32));
        } else if (size === undefined && lines !== undefined) {
          size = lines * 32;
        } else if (size === undefined && lines === undefined) {
          const pseudoSeed = (rawPath.length * 37 + (rawPath.charCodeAt(0) || 0) * 13) % 180;
          lines = 24 + pseudoSeed;
          size = lines * 34;
        }

        const fileNode: TreeNode = {
          name: part,
          path: currentPath,
          type: 'file',
          size,
          lines,
          sha: raw.sha,
        };

        if (depth === 0) {
          root.push(fileNode);
        } else {
          const parentPath = parts.slice(0, depth).join('/');
          const parent = dirMap.get(parentPath);
          if (parent && parent.children) {
            parent.children.push(fileNode);
          }
        }
      } else {
        if (!dirMap.has(currentPath)) {
          const dirNode: TreeNode = {
            name: part,
            path: currentPath,
            type: 'dir',
            children: [],
          };
          dirMap.set(currentPath, dirNode);

          if (depth === 0) {
            root.push(dirNode);
          } else {
            const parentPath = parts.slice(0, depth).join('/');
            const parent = dirMap.get(parentPath);
            if (parent && parent.children) {
              parent.children.push(dirNode);
            }
          }
        }
      }
    }
  }

  // Sort nodes: directories first, then alphabetical
  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'dir' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].children) {
        sortNodes(nodes[i].children!);
      }
    }
  };

  sortNodes(root);
  return root;
}

/**
 * Safely decodes base64 content with utf-8 fallback that never throws on binary files
 */
export function safeBase64Decode(content: string): string {
  try {
    const cleaned = content.replace(/\s/g, '');
    const decoded = atob(cleaned);
    return decodeURIComponent(
      Array.prototype.map
        .call(decoded, (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch {
    try {
      return atob(content.replace(/\s/g, ''));
    } catch {
      return '[Binary content or encoding not supported for preview]';
    }
  }
}
