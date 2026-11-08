import { DEMO_COMMITS } from './demoCommits';
import { DEMO_BRANCHES } from './demoBranches';
import { DEMO_PRS } from './demoData';
import { DEMO_FILES, DEMO_FILE_CONTENTS } from './demoFiles';
import { getSvgAvatar } from '../utils/avatarUtils';
import { formatRelativeTime } from '../mobile/utils/formatters';

const now = Date.now();
const rel = (h: number) => new Date(now - h * 3600 * 1000).toISOString();

export interface RepoDetailsPackage {
  files: any[];
  commits: any[];
  branches: any[];
  prs: any[];
  languages: Record<string, number>;
  fileContents?: Record<string, string>;
}

export const DEMO_CATALOG: Record<string, RepoDetailsPackage> = {
  'nexus-web-engine': {
    files: DEMO_FILES,
    commits: DEMO_COMMITS,
    branches: DEMO_BRANCHES,
    prs: DEMO_PRS,
    languages: { TypeScript: 74, JavaScript: 18, CSS: 8 },
    fileContents: DEMO_FILE_CONTENTS,
  },
  'distributed-kv-store': {
    files: [
      { name: 'src', type: 'dir', isCurrent: false },
      { name: 'src/raft', type: 'dir', isCurrent: false },
      { name: 'src/raft/consensus.rs', type: 'file', isCurrent: true, size: 4820, lines: 165 },
      { name: 'src/raft/log.rs', type: 'file', isCurrent: false, size: 3120, lines: 110 },
      { name: 'src/storage', type: 'dir', isCurrent: false },
      { name: 'src/storage/engine.rs', type: 'file', isCurrent: true, size: 5410, lines: 198 },
      { name: 'src/main.rs', type: 'file', isCurrent: true, size: 940, lines: 48 },
      { name: 'Cargo.toml', type: 'file', isCurrent: true, size: 760, lines: 34 },
      { name: 'README.md', type: 'file', isCurrent: true, size: 2150, lines: 80 },
    ],
    commits: [
      {
        hash: 'c4e91a2',
        fullHash: 'c4e91a2991048572019485720194857201948571',
        msg: 'feat: implement zero-copy log serialization in raft state machine',
        author: 'Alex Chen',
        avatar: getSvgAvatar('Alex Chen', 215),
        timestamp: rel(4),
        time: formatRelativeTime(rel(4)),
        add: '+214',
        del: '-48',
        parents: ['d8b27f3'],
        isPrimary: true,
      },
      {
        hash: 'd8b27f3',
        fullHash: 'd8b27f3881048572019485720194857201948572',
        msg: 'perf: optimize disk flush fsync barrier with io_uring',
        author: 'Elena Rossi',
        avatar: getSvgAvatar('Elena Rossi', 35),
        timestamp: rel(28),
        time: formatRelativeTime(rel(28)),
        add: '+88',
        del: '-12',
        parents: ['e1a49c0'],
        isPrimary: true,
      },
      {
        hash: 'e1a49c0',
        fullHash: 'e1a49c0771048572019485720194857201948573',
        msg: 'fix: resolve race condition in snapshot compaction boundary',
        author: 'David Kim',
        avatar: getSvgAvatar('David Kim', 280),
        timestamp: rel(54),
        time: formatRelativeTime(rel(54)),
        add: '+45',
        del: '-18',
        parents: ['f9c81d2'],
        isPrimary: true,
      },
    ],
    branches: [
      { name: 'main', isProtected: true, isDefault: true, commitCount: 42 },
      { name: 'feature/io-uring', isProtected: false, isDefault: false, commitCount: 8 },
    ],
    prs: [
      { id: 201, title: 'perf: async io_uring disk flusher', status: 'Open', author: 'Elena Rossi', updated_at: rel(12) },
    ],
    languages: { Rust: 92, Shell: 8 },
    fileContents: {
      'Cargo.toml': `[package]
name = "distributed-kv-store"
version = "0.4.0"
edition = "2021"

[dependencies]
tokio = { version = "1.38", features = ["full"] }
serde = { version = "1.0", features = ["derive"] }
tracing = "0.1"
`,
      'src/main.rs': `//! Distributed Key-Value Storage Node
use std::net::SocketAddr;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt::init();
    let addr: SocketAddr = "0.0.0.0:8080".parse()?;
    println!("Raft KV Engine listening on {}", addr);
    Ok(())
}
`,
      'README.md': `# distributed-kv-store
Raft-consensus distributed key-value storage engine with zero-copy snapshot serialization.
`,
    },
  },
  'tailwind-mobile-kit': {
    files: [
      { name: 'src', type: 'dir', isCurrent: false },
      { name: 'src/components', type: 'dir', isCurrent: false },
      { name: 'src/components/ActionSheet.tsx', type: 'file', isCurrent: true, size: 2800, lines: 92 },
      { name: 'src/components/BottomSheet.tsx', type: 'file', isCurrent: false, size: 3400, lines: 110 },
      { name: 'src/components/PullToRefresh.tsx', type: 'file', isCurrent: false, size: 2100, lines: 75 },
      { name: 'src/index.ts', type: 'file', isCurrent: true, size: 480, lines: 25 },
      { name: 'package.json', type: 'file', isCurrent: true, size: 920, lines: 40 },
      { name: 'README.md', type: 'file', isCurrent: true, size: 1800, lines: 65 },
    ],
    commits: [
      {
        hash: 'b1f4a9c',
        fullHash: 'b1f4a9c661048572019485720194857201948574',
        msg: 'feat: add smooth gesture velocity tracking to mobile sheets',
        author: 'Alex Chen',
        avatar: getSvgAvatar('Alex Chen', 215),
        timestamp: rel(8),
        time: formatRelativeTime(rel(8)),
        add: '+152',
        del: '-34',
        parents: ['a9d3e5b'],
        isPrimary: true,
      },
    ],
    branches: [
      { name: 'main', isProtected: true, isDefault: true, commitCount: 28 },
    ],
    prs: [],
    languages: { TypeScript: 82, CSS: 18 },
  },
};

export const getCatalogOrDefault = (repoName: string): RepoDetailsPackage => {
  if (DEMO_CATALOG[repoName]) {
    return DEMO_CATALOG[repoName];
  }
  return {
    files: [],
    commits: [],
    branches: [{ name: 'main', isDefault: true, isProtected: false }],
    prs: [],
    languages: {},
  };
};

export const isDemoCatalogRepo = (repoName: string): boolean => {
  return Boolean(DEMO_CATALOG[repoName]);
};
