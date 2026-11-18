import test from 'node:test';
import assert from 'node:assert/strict';
import {
  tokenizeCommand,
  getAutocompleteSuggestions,
  executeTerminalCommand,
  TerminalExecutionContext,
} from './terminalEngine';

function createMockContext(overrides: Partial<TerminalExecutionContext> = {}): TerminalExecutionContext & { calls: string[] } {
  const calls: string[] = [];
  const ctx: TerminalExecutionContext & { calls: string[] } = {
    calls,
    currentRepo: 'nexus-web-engine',
    currentRepoOwner: 'octodev',
    currentBranch: 'main',
    currentScreen: 'files',
    theme: 'dark',
    isDemoMode: true,
    repos: [
      { name: 'nexus-web-engine', owner: { login: 'octodev' }, full_name: 'octodev/nexus-web-engine' },
      { name: 'distributed-kv-store', owner: { login: 'octodev' }, full_name: 'octodev/distributed-kv-store' },
    ],
    branches: [
      { name: 'main', isDefault: true, isProtected: true },
      { name: 'feature/auth-v2', isDefault: false, isProtected: false },
    ],
    commits: [
      { hash: 'a1b2c3d', msg: 'feat: initial engine', author: 'Alex', time: '2h ago', add: '+42', del: '-5' },
    ],
    files: [
      { name: 'README.md', path: 'README.md', type: 'file', size: 512 },
      { name: 'src', path: 'src', type: 'dir' },
      { name: 'src/index.ts', path: 'src/index.ts', type: 'file', size: 220 },
    ],
    prs: [
      { id: 101, title: 'Implement auth', status: 'Open', source: 'feature/auth-v2', target: 'main' },
    ],
    actions: {
      openRepo: (name) => calls.push(`open:${name}`),
      switchBranch: (b) => { calls.push(`switch:${b}`); },
      createLocalBranch: ({ name }) => { calls.push(`createBranch:${name}`); },
      deleteBranch: (b) => { calls.push(`deleteBranch:${b}`); },
      createLocalCommit: ({ msg }) => { calls.push(`commit:${msg}`); },
      createTagAtCommit: (sha, tag) => { calls.push(`tag:${sha}:${tag}`); },
      navigate: (screen) => { calls.push(`navigate:${screen}`); },
      refreshData: () => { calls.push('refresh'); },
      toggleTheme: () => { calls.push('toggleTheme'); },
      readFileContent: async (p) => (p === 'README.md' ? '# Nexus Engine' : null),
    },
    ...overrides,
  };
  return ctx;
}

test('tokenizeCommand preserves quoted commit messages and flags', () => {
  assert.deepEqual(
    tokenizeCommand('git commit -m "feat: add quoted message"'),
    ['git', 'commit', '-m', 'feat: add quoted message'],
  );
});

test('git checkout -b creates branch and logs feedback', async () => {
  const ctx = createMockContext();
  const res = await executeTerminalCommand('git checkout -b feat/terminal', ctx);
  assert.deepEqual(ctx.calls, ['createBranch:feat/terminal']);
  assert.match(res.lines[0].text, /feat\/terminal/);
  assert.equal(res.lines[0].tone, 'success');
});

test('git commit -m triggers createLocalCommit with quoted text', async () => {
  const ctx = createMockContext();
  const res = await executeTerminalCommand('git commit -m "chore: update config"', ctx);
  assert.deepEqual(ctx.calls, ['commit:chore: update config']);
  assert.equal(res.lines[0].tone, 'success');
});

test('cat reads live file contents and reports missing files gracefully', async () => {
  const ctx = createMockContext();
  const found = await executeTerminalCommand('cat README.md', ctx);
  assert.equal(found.lines[0].text, '# Nexus Engine');
  const missing = await executeTerminalCommand('cat nope.txt', ctx);
  assert.equal(missing.lines[0].tone, 'error');
});

test('getAutocompleteSuggestions completes branches and files', () => {
  const ctx = createMockContext();
  assert.deepEqual(getAutocompleteSuggestions('git checkout feat', ctx), ['git checkout feature/auth-v2']);
  assert.deepEqual(getAutocompleteSuggestions('cat src/', ctx), ['cat src/index.ts']);
});
