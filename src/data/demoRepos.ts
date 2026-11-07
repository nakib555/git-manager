import { GitHubRepo } from '../types';
import { getSvgAvatar } from '../utils/avatarUtils';

const now = Date.now();
const octoAvatar = getSvgAvatar('octodev', 215);

export const DEMO_REPOSITORIES: GitHubRepo[] = [
  {
    id: 90101,
    name: 'nexus-web-engine',
    private: false,
    description: 'High-performance reactive rendering engine and virtual DOM compiler written in TypeScript',
    language: 'TypeScript',
    pushed_at: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
    updated_at: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
    stargazers_count: 1248,
    forks_count: 184,
    watchers_count: 1248,
    owner: {
      login: 'octodev',
      avatar_url: octoAvatar,
    },
  },
  {
    id: 90102,
    name: 'distributed-kv-store',
    private: false,
    description: 'Raft-consensus distributed key-value storage engine with zero-copy snapshot serialization',
    language: 'Rust',
    pushed_at: new Date(now - 1000 * 60 * 60 * 18).toISOString(),
    updated_at: new Date(now - 1000 * 60 * 60 * 18).toISOString(),
    stargazers_count: 894,
    forks_count: 92,
    watchers_count: 894,
    owner: {
      login: 'octodev',
      avatar_url: octoAvatar,
    },
  },
  {
    id: 90103,
    name: 'tailwind-mobile-kit',
    private: false,
    description: 'Ultra-refined 8-point spatial system UI components for responsive mobile web applications',
    language: 'TypeScript',
    pushed_at: new Date(now - 1000 * 60 * 60 * 36).toISOString(),
    updated_at: new Date(now - 1000 * 60 * 60 * 36).toISOString(),
    stargazers_count: 536,
    forks_count: 48,
    watchers_count: 536,
    owner: {
      login: 'octodev',
      avatar_url: octoAvatar,
    },
  },
  {
    id: 90104,
    name: 'ai-agent-flow',
    private: true,
    description: 'Autonomous multi-agent orchestration framework with vector semantic memory routing',
    language: 'Python',
    pushed_at: new Date(now - 1000 * 60 * 60 * 72).toISOString(),
    updated_at: new Date(now - 1000 * 60 * 60 * 72).toISOString(),
    stargazers_count: 142,
    forks_count: 18,
    watchers_count: 142,
    owner: {
      login: 'octodev',
      avatar_url: octoAvatar,
    },
  },
  {
    id: 90105,
    name: 'cloud-mesh-router',
    private: false,
    description: 'Edge HTTP/3 reverse proxy and TLS dynamic cert manager with eBPF metrics telemetry',
    language: 'Go',
    pushed_at: new Date(now - 1000 * 60 * 60 * 120).toISOString(),
    updated_at: new Date(now - 1000 * 60 * 60 * 120).toISOString(),
    stargazers_count: 312,
    forks_count: 27,
    watchers_count: 312,
    owner: {
      login: 'octodev',
      avatar_url: octoAvatar,
    },
  },
  {
    id: 90106,
    name: 'hyper-diff-tool',
    private: false,
    description: 'Syntax-aware AST-based semantic code diff engine with Myers algorithm fallback',
    language: 'TypeScript',
    pushed_at: new Date(now - 1000 * 60 * 60 * 192).toISOString(),
    updated_at: new Date(now - 1000 * 60 * 60 * 192).toISOString(),
    stargazers_count: 198,
    forks_count: 14,
    watchers_count: 198,
    owner: {
      login: 'octodev',
      avatar_url: octoAvatar,
    },
  },
];
