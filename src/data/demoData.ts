import { GitHubRepo, GitHubUser, GitCommitNode } from '../types';

export const DEMO_USER: GitHubUser = {
  login: 'octodev',
  name: 'Alex Chen',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  followers: 482,
  following: 129,
  bio: 'Staff Systems Engineer • Open Source Contributor • Rust & TypeScript',
};

export const DEMO_REPOSITORIES: GitHubRepo[] = [
  {
    id: 90101,
    name: 'nexus-web-engine',
    private: false,
    description: 'High-performance reactive rendering engine and virtual DOM compiler written in TypeScript',
    language: 'TypeScript',
    pushed_at: '2026-11-03T08:15:00Z',
    updated_at: '2026-11-03T08:15:00Z',
    stargazers_count: 1248,
    forks_count: 184,
    watchers_count: 1248,
    owner: {
      login: 'octodev',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  },
  {
    id: 90102,
    name: 'distributed-kv-store',
    private: false,
    description: 'Raft-consensus distributed key-value storage engine with zero-copy snapshot serialization',
    language: 'Rust',
    pushed_at: '2026-11-02T16:42:00Z',
    updated_at: '2026-11-02T16:42:00Z',
    stargazers_count: 894,
    forks_count: 92,
    watchers_count: 894,
    owner: {
      login: 'octodev',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  },
  {
    id: 90103,
    name: 'tailwind-mobile-kit',
    private: false,
    description: 'Ultra-refined 8-point spatial system UI components for responsive mobile web applications',
    language: 'TypeScript',
    pushed_at: '2026-11-01T21:30:00Z',
    updated_at: '2026-11-01T21:30:00Z',
    stargazers_count: 536,
    forks_count: 48,
    watchers_count: 536,
    owner: {
      login: 'octodev',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  },
  {
    id: 90104,
    name: 'ai-agent-flow',
    private: true,
    description: 'Autonomous multi-agent orchestration framework with vector semantic memory routing',
    language: 'Python',
    pushed_at: '2026-10-30T11:05:00Z',
    updated_at: '2026-10-30T11:05:00Z',
    stargazers_count: 142,
    forks_count: 18,
    watchers_count: 142,
    owner: {
      login: 'octodev',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  },
  {
    id: 90105,
    name: 'cloud-mesh-router',
    private: false,
    description: 'Edge HTTP/3 reverse proxy and TLS dynamic cert manager with eBPF metrics telemetry',
    language: 'Go',
    pushed_at: '2026-10-28T14:20:00Z',
    updated_at: '2026-10-28T14:20:00Z',
    stargazers_count: 312,
    forks_count: 27,
    watchers_count: 312,
    owner: {
      login: 'octodev',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  },
  {
    id: 90106,
    name: 'hyper-diff-tool',
    private: false,
    description: 'Syntax-aware AST-based semantic code diff engine with Myers algorithm fallback',
    language: 'TypeScript',
    pushed_at: '2026-10-25T09:12:00Z',
    updated_at: '2026-10-25T09:12:00Z',
    stargazers_count: 198,
    forks_count: 14,
    watchers_count: 198,
    owner: {
      login: 'octodev',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  },
];

export const DEMO_COMMITS: GitCommitNode[] = [
  {
    hash: 'a7f1c9d',
    fullHash: 'a7f1c9d8e4b20914856012838947264109841245',
    msg: 'feat: implement concurrent incremental tree reconciliation',
    author: 'Alex Chen',
    time: '2 hours ago',
    timestamp: '2026-11-03T08:15:00Z',
    add: '+142',
    del: '-18',
    parents: ['b3e2a0f'],
    isPrimary: true,
  },
  {
    hash: 'b3e2a0f',
    fullHash: 'b3e2a0f918471204895610283748291038475829',
    msg: 'perf(vdom): optimize fiber queue batching and reduce garbage allocation',
    author: 'Alex Chen',
    time: '5 hours ago',
    timestamp: '2026-11-03T05:12:00Z',
    add: '+64',
    del: '-35',
    parents: ['c9d8e7a'],
    isPrimary: true,
  },
  {
    hash: 'c9d8e7a',
    fullHash: 'c9d8e7a829104857291048592019485720194857',
    msg: 'fix: prevent race condition during hydration mismatch in streaming SSR',
    author: 'Sarah Lin',
    time: 'Yesterday',
    timestamp: '2026-11-02T14:40:00Z',
    add: '+28',
    del: '-7',
    parents: ['d4f3b2c'],
    isPrimary: true,
  },
  {
    hash: 'd4f3b2c',
    fullHash: 'd4f3b2c710492857102948572019485720194857',
    msg: 'refactor: modularize streaming suspense boundary controllers',
    author: 'Alex Chen',
    time: '2 days ago',
    timestamp: '2026-11-01T17:25:00Z',
    add: '+188',
    del: '-142',
    parents: ['e5a6c1b'],
    isPrimary: true,
  },
  {
    hash: 'e5a6c1b',
    fullHash: 'e5a6c1b620194857201948572019485720194857',
    msg: 'feat: add support for Web Streams API backpressure handling',
    author: 'David Kim',
    time: '3 days ago',
    timestamp: '2026-10-31T11:18:00Z',
    add: '+95',
    del: '-12',
    parents: ['f6b7d2e'],
    isPrimary: true,
  },
  {
    hash: 'f6b7d2e',
    fullHash: 'f6b7d2e530294857201948572019485720194857',
    msg: 'test: add end-to-end integration tests for multi-chunk hydration',
    author: 'Sarah Lin',
    time: '4 days ago',
    timestamp: '2026-10-30T16:02:00Z',
    add: '+215',
    del: '-4',
    parents: ['1a2b3c4'],
    isPrimary: true,
  },
  {
    hash: '1a2b3c4',
    fullHash: '1a2b3c4440394857201948572019485720194857',
    msg: 'chore: upgrade TypeScript 5.8 and strict lint rules',
    author: 'Alex Chen',
    time: '5 days ago',
    timestamp: '2026-10-29T10:45:00Z',
    add: '+32',
    del: '-29',
    parents: ['2b3c4d5'],
    isPrimary: true,
  },
  {
    hash: '2b3c4d5',
    fullHash: '2b3c4d5550494857201948572019485720194857',
    msg: 'docs: update architectural diagrams and rendering lifecycle guide',
    author: 'Elena Rossi',
    time: '6 days ago',
    timestamp: '2026-10-28T13:30:00Z',
    add: '+150',
    del: '-10',
    parents: ['3c4d5e6'],
    isPrimary: true,
  },
  {
    hash: '3c4d5e6',
    fullHash: '3c4d5e6660594857201948572019485720194857',
    msg: 'feat: add zero-overhead reactive signals primitives',
    author: 'Alex Chen',
    time: '1 week ago',
    timestamp: '2026-10-27T09:15:00Z',
    add: '+310',
    del: '-45',
    parents: ['4d5e6f7'],
    isPrimary: true,
  },
  {
    hash: '4d5e6f7',
    fullHash: '4d5e6f7770694857201948572019485720194857',
    msg: 'fix(core): resolve memory leak when unsubscribing effects in unmounted trees',
    author: 'David Kim',
    time: '1 week ago',
    timestamp: '2026-10-26T15:20:00Z',
    add: '+19',
    del: '-6',
    parents: ['5e6f7a8'],
    isPrimary: true,
  },
];

export const DEMO_BRANCHES = [
  { name: 'main', desc: 'Default production branch (head: a7f1c9d)', isDefault: true, borderColor: '#38BDF8' },
  { name: 'feature/virtual-dom-v2', desc: 'Concurrent fiber reconciliation (head: b3e2a0f)', isDefault: false, borderColor: 'transparent' },
  { name: 'develop', desc: 'Staging integration branch (head: c9d8e7a)', isDefault: false, borderColor: 'transparent' },
  { name: 'fix/hydration-mismatch', desc: 'Streaming SSR boundary fix (head: d4f3b2c)', isDefault: false, borderColor: 'transparent' },
  { name: 'release/v2.4.0', desc: 'Release candidate 2.4.0 (head: 1a2b3c4)', isDefault: false, borderColor: 'transparent' },
];

export const DEMO_PRS = [
  {
    id: 142,
    title: 'feat: concurrent fiber reconciliation engine',
    desc: 'Introduces time-sliced rendering prioritizing user interactions over passive DOM updates.',
    author: 'octodev',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    time: '2 hours ago',
    created_at: '2026-11-03T07:30:00Z',
    status: 'Open',
    comments: 6,
    hasConflicts: false,
    source: 'feature/virtual-dom-v2',
    target: 'main',
  },
  {
    id: 141,
    title: 'fix: hydration mismatch error boundary fallback',
    desc: 'Corrects DOM node mismatch during progressive server-side streaming render.',
    author: 'sarah-lin',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    time: 'Yesterday',
    created_at: '2026-11-02T13:10:00Z',
    status: 'Merged',
    comments: 11,
    hasConflicts: false,
    source: 'fix/hydration-mismatch',
    target: 'main',
  },
  {
    id: 140,
    title: 'perf: memory reduction in reactive signal dependency graph',
    desc: 'Replaces doubly-linked node allocations with pooled array indices.',
    author: 'davidkim-dev',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    time: '3 days ago',
    created_at: '2026-10-31T09:45:00Z',
    status: 'Merged',
    comments: 4,
    hasConflicts: false,
    source: 'perf/signals-cleanup',
    target: 'main',
  },
  {
    id: 139,
    title: 'RFC: WebAssembly acceleration for layout recalculations',
    desc: 'Draft proposal exploring WASM bindings for compute-heavy layout calculations.',
    author: 'elena-rossi',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    time: '5 days ago',
    created_at: '2026-10-29T16:20:00Z',
    status: 'Draft',
    comments: 15,
    hasConflicts: false,
    source: 'rfc/wasm-layout',
    target: 'develop',
  },
];

export const DEMO_FILES = [
  { name: 'src', type: 'dir', isCurrent: false },
  { name: 'src/core', type: 'dir', isCurrent: false },
  { name: 'src/core/vdom.ts', type: 'file', isCurrent: true },
  { name: 'src/core/fiber.ts', type: 'file', isCurrent: false },
  { name: 'src/core/signals.ts', type: 'file', isCurrent: false },
  { name: 'src/server', type: 'dir', isCurrent: false },
  { name: 'src/server/stream.ts', type: 'file', isCurrent: true },
  { name: 'src/server/hydrate.ts', type: 'file', isCurrent: false },
  { name: 'src/index.ts', type: 'file', isCurrent: true },
  { name: 'package.json', type: 'file', isCurrent: false },
  { name: 'README.md', type: 'file', isCurrent: true },
  { name: 'tsconfig.json', type: 'file', isCurrent: false },
];

export const DEMO_FILE_CONTENTS: Record<string, string> = {
  'src/core/vdom.ts': `/**
 * Nexus Virtual DOM Core Reconciliation Engine
 * Copyright (c) 2026 Nexus Systems
 */

export interface VNode {
  type: string | Function;
  props: Record<string, any>;
  children: (VNode | string)[];
  key?: string | number;
}

export function createElement(
  type: string | Function,
  props: Record<string, any> | null,
  ...children: any[]
): VNode {
  return {
    type,
    props: props || {},
    children: children.flat(),
    key: props?.key,
  };
}

export function reconcile(
  parent: HTMLElement,
  oldNode: VNode | null,
  newNode: VNode | null,
  index = 0
): void {
  if (!oldNode && newNode) {
    parent.appendChild(createRealNode(newNode));
  } else if (oldNode && !newNode) {
    const child = parent.childNodes[index];
    if (child) parent.removeChild(child);
  } else if (oldNode && newNode && hasChanged(oldNode, newNode)) {
    const child = parent.childNodes[index];
    if (child) parent.replaceChild(createRealNode(newNode), child);
  }
}

function hasChanged(a: VNode, b: VNode): boolean {
  return (
    typeof a !== typeof b ||
    (typeof a === 'string' && a !== b) ||
    a.type !== b.type ||
    a.key !== b.key
  );
}

function createRealNode(node: VNode | string): Node {
  if (typeof node === 'string') {
    return document.createTextNode(node);
  }
  const el = document.createElement(node.type as string);
  for (const [key, val] of Object.entries(node.props)) {
    if (key !== 'key') {
      (el as any)[key] = val;
    }
  }
  for (const child of node.children) {
    el.appendChild(createRealNode(child));
  }
  return el;
}
`,
  'src/server/stream.ts': `/**
 * Nexus Streaming SSR Controller
 */

export interface StreamOptions {
  bootstrapScripts?: string[];
  onShellReady?: () => void;
  onError?: (err: unknown) => void;
}

export async function renderToReadableStream(
  element: any,
  options: StreamOptions = {}
): Promise<ReadableStream<Uint8Array>> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode('<!DOCTYPE html><html><head></head><body>'));
      options.onShellReady?.();
      controller.enqueue(encoder.encode('<div id="app"></div>'));
      controller.enqueue(encoder.encode('</body></html>'));
      controller.close();
    },
  });
}
`,
  'src/index.ts': `export * from './core/vdom';
export * from './server/stream';

export const VERSION = '2.4.0';
console.log('Nexus Web Engine initialized v' + VERSION);
`,
  'package.json': `{
  "name": "nexus-web-engine",
  "version": "2.4.0",
  "description": "High-performance reactive rendering engine and virtual DOM compiler",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "test": "vitest run"
  },
  "dependencies": {},
  "devDependencies": {
    "typescript": "^5.8.0",
    "vitest": "^2.0.0"
  }
}
`,
  'README.md': `# nexus-web-engine

> High-performance reactive rendering engine and virtual DOM compiler written in TypeScript.

## Quickstart

\`\`\`bash
npm install nexus-web-engine
\`\`\`

\`\`\`typescript
import { createElement, reconcile } from 'nexus-web-engine';

const app = createElement('div', { class: 'hero' }, 'Hello World');
reconcile(document.getElementById('root')!, null, app);
\`\`\`
`,
  'tsconfig.json': `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "declaration": true
  },
  "include": ["src/**/*"]
}
`,
};

export const DEMO_ACTIVITY_EVENTS = [
  {
    id: 'demo-ev-1',
    type: 'PushEvent',
    actor: {
      login: 'octodev',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    repo: {
      name: 'octodev/nexus-web-engine',
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    payload: {
      commits: [
        {
          sha: 'a7f1c9d',
          message: 'feat: implement concurrent incremental tree reconciliation',
        },
      ],
      ref: 'refs/heads/main',
    },
  },
  {
    id: 'demo-ev-2',
    type: 'PullRequestEvent',
    actor: {
      login: 'sarah-lin',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
    repo: {
      name: 'octodev/nexus-web-engine',
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    payload: {
      action: 'opened',
      pull_request: {
        number: 142,
        title: 'feat: concurrent fiber reconciliation engine',
      },
    },
  },
  {
    id: 'demo-ev-3',
    type: 'WatchEvent',
    actor: {
      login: 'chen-coder',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    repo: {
      name: 'octodev/distributed-kv-store',
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    payload: {
      action: 'started',
    },
  },
  {
    id: 'demo-ev-4',
    type: 'PushEvent',
    actor: {
      login: 'octodev',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    repo: {
      name: 'octodev/tailwind-mobile-kit',
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    payload: {
      commits: [
        {
          sha: '8f2a1b9',
          message: 'refactor(mobile): refine bottom sheet touch gestures and safe areas',
        },
      ],
      ref: 'refs/heads/main',
    },
  },
];
