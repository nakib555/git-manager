import { getSvgAvatar } from '../utils/avatarUtils';
import { formatRelativeTime } from '../mobile/utils/formatters';

const now = Date.now();
const rel = (h: number) => new Date(now - h * 3600 * 1000).toISOString();

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
    avatar: getSvgAvatar('octodev', 215),
    time: formatRelativeTime(rel(3)),
    created_at: rel(3),
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
    avatar: getSvgAvatar('Sarah Lin', 145),
    time: formatRelativeTime(rel(26)),
    created_at: rel(26),
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
    avatar: getSvgAvatar('David Kim', 280),
    time: formatRelativeTime(rel(74)),
    created_at: rel(74),
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
    avatar: getSvgAvatar('Elena Rossi', 35),
    time: formatRelativeTime(rel(122)),
    created_at: rel(122),
    status: 'Draft',
    comments: 15,
    hasConflicts: false,
    source: 'rfc/wasm-layout',
    target: 'develop',
  },
];
