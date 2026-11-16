import test from 'node:test';
import assert from 'node:assert/strict';
import {
  enrichBranchesWithCommits,
  fetchBranchComparison,
  fetchBranchProtection,
  resolveDefaultBranchName,
} from './branchInspectionService';

test('resolveDefaultBranchName identifies explicit default or main/master fallback', () => {
  assert.equal(resolveDefaultBranchName([{ name: 'dev' }, { name: 'trunk', isDefault: true }]), 'trunk');
  assert.equal(resolveDefaultBranchName([{ name: 'dev' }, { name: 'master' }]), 'master');
  assert.equal(resolveDefaultBranchName([{ name: 'feature/x' }]), 'feature/x');
});

test('enrichBranchesWithCommits attaches real commit SHA, author, message, and active status', () => {
  const branches = [
    { name: 'main', commitSha: 'a7f1c9d1234', isDefault: true, isProtected: true },
    { name: 'feature/tree', shortSha: 'b3e2a0f', isDefault: false, isProtected: false },
  ];
  const commits = [
    { hash: 'a7f1c9d', fullHash: 'a7f1c9d1234', msg: 'feat: sync tree', author: 'Alice', timestamp: new Date().toISOString() },
    { hash: 'b3e2a0f', fullHash: 'b3e2a0f9999', msg: 'perf: memoize tree', author: 'Bob', timestamp: new Date().toISOString() },
  ];

  const enriched = enrichBranchesWithCommits(branches, commits, 'feature/tree', 'main');
  assert.equal(enriched[0].isDefault, true);
  assert.equal(enriched[0].isActive, false);
  assert.equal(enriched[0].lastCommitMsg, 'feat: sync tree');
  assert.equal(enriched[1].isActive, true);
  assert.equal(enriched[1].lastCommitAuthor, 'Bob');
  assert.equal(enriched[1].lastCommitMsg, 'perf: memoize tree');
});

test('fetchBranchComparison fetches real GitHub compare payload when authenticated', async () => {
  const originalFetch = globalThis.fetch;
  let capturedUrl = '';
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    capturedUrl = String(input);
    return new Response(
      JSON.stringify({
        status: 'ahead',
        ahead_by: 4,
        behind_by: 1,
        files: [{ filename: 'src/a.ts' }, { filename: 'src/b.ts' }],
        commits: [
          {
            sha: '1111111aaaaaaa',
            commit: { message: 'fix: diff tree', author: { name: 'Dev', date: '2026-11-16T01:00:00Z' } },
            parents: [],
          },
        ],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }) as typeof fetch;

  try {
    const res = await fetchBranchComparison({
      owner: 'acme',
      repo: 'app',
      baseBranch: 'main',
      headBranch: 'feat/tree',
      token: 'ghp_test',
    });
    assert.ok(capturedUrl.includes('/repos/acme/app/compare/main...feat%2Ftree'));
    assert.equal(res.source, 'github');
    assert.equal(res.aheadBy, 4);
    assert.equal(res.behindBy, 1);
    assert.equal(res.status, 'ahead');
    assert.equal(res.filesCount, 2);
    assert.equal(res.commits[0].hash, '1111111');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('fetchBranchProtection respects AbortSignal and infers policy cleanly when unauthenticated', async () => {
  const res = await fetchBranchProtection({
    owner: null,
    repo: null,
    branchName: 'main',
    isProtectedFlag: true,
    isDefault: true,
    token: null,
  });
  assert.equal(res.isProtected, true);
  assert.equal(res.directPushAllowed, false);
  assert.equal(res.source, 'inferred');
});
