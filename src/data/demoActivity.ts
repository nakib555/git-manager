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
