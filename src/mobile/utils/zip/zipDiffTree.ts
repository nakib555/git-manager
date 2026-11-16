import { DiffFileItem } from './zipTypes';
import { ConflictResolution, getDefaultResolution } from './zipSyncHelpers';

export interface DiffTreeNode {
  id: string;
  name: string;
  path: string;
  type: 'folder' | 'file';
  depth: number;
  children: DiffTreeNode[];
  file?: DiffFileItem;
  totalFiles: number;
  modifiedCount: number;
  addedCount: number;
  removedCount: number;
  byteSize: number;
}

export type TreeSelectionState = 'checked' | 'indeterminate' | 'unchecked';

export type DiffTreeStatusFilter = 'all' | 'modified' | 'added' | 'removed' | 'unchanged';

function estimateByteSize(file: DiffFileItem): number {
  const sample = file.newContent ?? file.oldContent ?? '';
  if (!sample) return 0;
  return new TextEncoder().encode(sample).length;
}

export function buildDiffTree(
  diffItems: DiffFileItem[],
  options: {
    searchQuery?: string;
    statusFilter?: DiffTreeStatusFilter;
  } = {}
): DiffTreeNode[] {
  const query = (options.searchQuery || '').trim().toLowerCase();
  const statusFilter = options.statusFilter || 'all';

  const matchingFiles = diffItems.filter((item) => {
    if (statusFilter === 'all') {
      if (item.status === 'unchanged') return false;
    } else if (item.status !== statusFilter) {
      return false;
    }
    if (query && !item.path.toLowerCase().includes(query)) return false;
    return true;
  });

  const rootChildren: DiffTreeNode[] = [];
  const folderMap = new Map<string, DiffTreeNode>();

  for (const file of matchingFiles) {
    const parts = file.path.split('/').filter(Boolean);
    if (parts.length === 0) continue;

    let currentLevel = rootChildren;
    let currentPath = '';

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      if (isFile) {
        currentLevel.push({
          id: `file:${currentPath}`,
          name: part,
          path: file.path,
          type: 'file',
          depth: i,
          children: [],
          file,
          totalFiles: 1,
          modifiedCount: file.status === 'modified' ? 1 : 0,
          addedCount: file.status === 'added' ? 1 : 0,
          removedCount: file.status === 'removed' ? 1 : 0,
          byteSize: estimateByteSize(file),
        });
      } else {
        let folderNode = folderMap.get(currentPath);
        if (!folderNode) {
          folderNode = {
            id: `dir:${currentPath}`,
            name: part,
            path: currentPath,
            type: 'folder',
            depth: i,
            children: [],
            totalFiles: 0,
            modifiedCount: 0,
            addedCount: 0,
            removedCount: 0,
            byteSize: 0,
          };
          folderMap.set(currentPath, folderNode);
          currentLevel.push(folderNode);
        }
        currentLevel = folderNode.children;
      }
    }
  }

  const finalize = (nodes: DiffTreeNode[]): DiffTreeNode[] => {
    nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    for (const node of nodes) {
      if (node.type === 'folder') {
        finalize(node.children);
        node.totalFiles = node.children.reduce((acc, c) => acc + c.totalFiles, 0);
        node.modifiedCount = node.children.reduce((acc, c) => acc + c.modifiedCount, 0);
        node.addedCount = node.children.reduce((acc, c) => acc + c.addedCount, 0);
        node.removedCount = node.children.reduce((acc, c) => acc + c.removedCount, 0);
        node.byteSize = node.children.reduce((acc, c) => acc + c.byteSize, 0);
      }
    }
    return nodes;
  };

  return finalize(rootChildren);
}

export function collectFolderPaths(nodes: DiffTreeNode[]): string[] {
  const paths: string[] = [];
  const walk = (list: DiffTreeNode[]) => {
    for (const node of list) {
      if (node.type === 'folder') {
        paths.push(node.path);
        walk(node.children);
      }
    }
  };
  walk(nodes);
  return paths;
}

export function collectDescendantFiles(node: DiffTreeNode): DiffFileItem[] {
  if (node.type === 'file') {
    return node.file ? [node.file] : [];
  }
  const files: DiffFileItem[] = [];
  const walk = (children: DiffTreeNode[]) => {
    for (const child of children) {
      if (child.type === 'file' && child.file) {
        files.push(child.file);
      } else if (child.type === 'folder') {
        walk(child.children);
      }
    }
  };
  walk(node.children);
  return files;
}

export function isFileSelectedForSync(
  file: DiffFileItem,
  resolutions: Map<string, ConflictResolution>
): boolean {
  const res = resolutions.get(file.path) ?? getDefaultResolution(file);
  if (file.status === 'removed') {
    return res === 'delete';
  }
  return res === 'take_zip';
}

export function getNodeSelectionState(
  node: DiffTreeNode,
  resolutions: Map<string, ConflictResolution>
): TreeSelectionState {
  const files = collectDescendantFiles(node);
  if (files.length === 0) return 'unchecked';
  let checkedCount = 0;
  for (const f of files) {
    if (isFileSelectedForSync(f, resolutions)) checkedCount++;
  }
  if (checkedCount === 0) return 'unchecked';
  if (checkedCount === files.length) return 'checked';
  return 'indeterminate';
}

export function applyTreeNodeSelection(
  node: DiffTreeNode,
  currentResolutions: Map<string, ConflictResolution>,
  selected: boolean
): Map<string, ConflictResolution> {
  const next = new Map(currentResolutions);
  const files = collectDescendantFiles(node);
  for (const file of files) {
    if (file.status === 'removed') {
      next.set(file.path, selected ? 'delete' : 'restore');
    } else if (file.status === 'modified' || file.status === 'added') {
      next.set(file.path, selected ? 'take_zip' : 'keep_original');
    }
  }
  return next;
}
