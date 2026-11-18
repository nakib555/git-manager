export interface FilterableTreeNode {
  name: string;
  path: string;
  type: 'dir' | 'file';
  size?: number;
  lines?: number;
  children?: FilterableTreeNode[];
}

export interface FileTreeFilterResult<T extends FilterableTreeNode> {
  nodes: T[];
  matchedFiles: number;
  isFiltering: boolean;
}

/**
 * Filters a hierarchical file tree against a case-insensitive substring query.
 * Directories are retained whenever their own name/path matches OR any descendant matches.
 */
export function filterFileTree<T extends FilterableTreeNode>(
  nodes: T[],
  rawQuery: string,
): FileTreeFilterResult<T> {
  const query = rawQuery.trim().toLowerCase();
  if (!query) {
    return {
      nodes,
      matchedFiles: countFilesInTree(nodes),
      isFiltering: false,
    };
  }

  let matchedFiles = 0;

  const walk = (items: T[]): T[] => {
    const kept: T[] = [];
    for (const item of items) {
      const nameMatch = item.name.toLowerCase().includes(query);
      const pathMatch = item.path.toLowerCase().includes(query);

      if (item.type === 'dir') {
        const children = (item.children || []) as T[];
        // If directory name itself matches, keep all descendants so user can browse inside it,
        // or filter children if query targets deeper paths.
        const filteredChildren = walk(children);
        if (filteredChildren.length > 0) {
          kept.push({
            ...item,
            children: filteredChildren,
          });
        } else if (nameMatch || pathMatch) {
          matchedFiles += countFilesInTree(children);
          kept.push({
            ...item,
            children,
          });
        }
      } else if (nameMatch || pathMatch) {
        matchedFiles += 1;
        kept.push(item);
      }
    }
    return kept;
  };

  const filtered = walk(nodes);
  return {
    nodes: filtered,
    matchedFiles,
    isFiltering: true,
  };
}

export function countFilesInTree(nodes: FilterableTreeNode[]): number {
  let count = 0;
  for (const node of nodes) {
    if (node.type === 'file') {
      count += 1;
    } else if (node.children?.length) {
      count += countFilesInTree(node.children);
    }
  }
  return count;
}
