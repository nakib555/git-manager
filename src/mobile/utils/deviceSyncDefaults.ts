export interface LocalDeviceRepoSync {
  repoName: string;
  repoOwner: string;
  localPath: string;
  lastSyncedAt: number;
  syncedBranch: string;
  syncedSha: string;
  status: 'synced' | 'diverged' | 'syncing';
  fileCount: number;
  sizeBytes: number;
}

export const DEVICE_SYNC_STORAGE_KEY = 'git_manager_device_synced_repos';

export const INITIAL_DEVICE_SYNC_REPOS: Record<string, LocalDeviceRepoSync> = {
  'git-manager': {
    repoName: 'git-manager',
    repoOwner: 'nakib555',
    localPath: '/Documents/Projects/git-manager',
    lastSyncedAt: Date.now() - 1000 * 60 * 18,
    syncedBranch: 'main',
    syncedSha: '81fcda9',
    status: 'synced',
    fileCount: 42,
    sizeBytes: 1024 * 380,
  },
  'Excel-grid': {
    repoName: 'Excel-grid',
    repoOwner: 'nakib555',
    localPath: '/Documents/Projects/Excel-grid',
    lastSyncedAt: Date.now() - 1000 * 60 * 60 * 4,
    syncedBranch: 'main',
    syncedSha: '4c81a2f',
    status: 'synced',
    fileCount: 28,
    sizeBytes: 1024 * 210,
  }
};
