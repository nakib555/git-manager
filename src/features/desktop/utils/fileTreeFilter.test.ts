import test from 'node:test';
import assert from 'node:assert/strict';
import { filterFileTree, countFilesInTree, FilterableTreeNode } from './fileTreeFilter';

const SAMPLE_TREE: FilterableTreeNode[] = [
  {
    name: 'src',
    path: 'src',
    type: 'dir',
    children: [
      {
        name: 'auth',
        path: 'src/auth',
        type: 'dir',
        children: [
          { name: 'oauth.ts', path: 'src/auth/oauth.ts', type: 'file', size: 1200 },
          { name: 'session.ts', path: 'src/auth/session.ts', type: 'file', size: 850 },
        ],
      },
      { name: 'index.ts', path: 'src/index.ts', type: 'file', size: 420 },
    ],
  },
  { name: 'package.json', path: 'package.json', type: 'file', size: 900 },
  { name: 'README.md', path: 'README.md', type: 'file', size: 1800 },
];

test('returns full tree and counts files when query is empty', () => {
  const result = filterFileTree(SAMPLE_TREE, '   ');
  assert.equal(result.isFiltering, false);
  assert.equal(result.matchedFiles, 5);
  assert.equal(result.nodes.length, 3);
  assert.equal(countFilesInTree(result.nodes), 5);
});

test('filters nested files and retains parent directory chain', () => {
  const result = filterFileTree(SAMPLE_TREE, 'oauth');
  assert.equal(result.isFiltering, true);
  assert.equal(result.matchedFiles, 1);
  assert.equal(result.nodes.length, 1);
  assert.equal(result.nodes[0].name, 'src');
  assert.equal(result.nodes[0].children?.[0].name, 'auth');
  assert.equal(result.nodes[0].children?.[0].children?.[0].path, 'src/auth/oauth.ts');
});

test('retains directory contents when directory name matches directly', () => {
  const result = filterFileTree(SAMPLE_TREE, 'auth');
  assert.equal(result.isFiltering, true);
  assert.equal(result.matchedFiles, 2);
  assert.equal(result.nodes[0].children?.[0].children?.length, 2);
});

test('returns empty nodes when nothing matches', () => {
  const result = filterFileTree(SAMPLE_TREE, 'nonexistent-xyz');
  assert.equal(result.isFiltering, true);
  assert.equal(result.matchedFiles, 0);
  assert.equal(result.nodes.length, 0);
});
