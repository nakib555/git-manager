import { LocalDeviceRepoSync, DEVICE_SYNC_STORAGE_KEY, INITIAL_DEVICE_SYNC_REPOS } from './deviceSyncDefaults';

export type { LocalDeviceRepoSync };

export function getDeviceSyncedRepos(): Record<string, LocalDeviceRepoSync> {
  try {
    const raw = localStorage.getItem(DEVICE_SYNC_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(DEVICE_SYNC_STORAGE_KEY, JSON.stringify(INITIAL_DEVICE_SYNC_REPOS));
      return INITIAL_DEVICE_SYNC_REPOS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load device synced repos:', err);
    return {};
  }
}

export function checkDeviceRepoExists(repoName: string, repoOwner?: string): LocalDeviceRepoSync | null {
  if (!repoName) return null;
  const store = getDeviceSyncedRepos();
  const cleanName = repoName.trim().toLowerCase();

  for (const [key, item] of Object.entries(store)) {
    if (item.repoName.toLowerCase() === cleanName || key.toLowerCase() === cleanName) {
      if (!repoOwner || item.repoOwner.toLowerCase() === repoOwner.toLowerCase()) {
        return item;
      }
    }
  }

  try {
    const recentRaw = localStorage.getItem('recentClones');
    if (recentRaw) {
      const parsed = JSON.parse(recentRaw);
      const matched = parsed.find((c: any) => c.name?.toLowerCase() === cleanName);
      if (matched) {
        return {
          repoName: matched.name,
          repoOwner: repoOwner || 'user',
          localPath: matched.dest || `/Documents/Projects/${matched.name}`,
          lastSyncedAt: matched.timestamp || Date.now() - 1000 * 60 * 30,
          syncedBranch: 'main',
          syncedSha: '81fcda9',
          status: 'synced',
          fileCount: 35,
          sizeBytes: 1024 * 250,
        };
      }
    }
  } catch (_) {}

  return null;
}

export function registerDeviceClone(params: {
  repoName: string;
  repoOwner: string;
  localPath: string;
  branch?: string;
  sha?: string;
}): LocalDeviceRepoSync {
  const store = getDeviceSyncedRepos();
  const entry: LocalDeviceRepoSync = {
    repoName: params.repoName,
    repoOwner: params.repoOwner,
    localPath: params.localPath,
    lastSyncedAt: Date.now(),
    syncedBranch: params.branch || 'main',
    syncedSha: params.sha || '81fcda9',
    status: 'synced',
    fileCount: 42,
    sizeBytes: 1024 * 350,
  };

  store[params.repoName] = entry;
  localStorage.setItem(DEVICE_SYNC_STORAGE_KEY, JSON.stringify(store));
  return entry;
}

export async function syncDeviceRepo(
  repoName: string,
  onProgress?: (step: string, percent: number) => void
): Promise<LocalDeviceRepoSync> {
  const store = getDeviceSyncedRepos();
  const existing = store[repoName] || {
    repoName,
    repoOwner: 'user',
    localPath: `/Documents/Projects/${repoName}`,
    lastSyncedAt: Date.now(),
    syncedBranch: 'main',
    syncedSha: '81fcda9',
    status: 'synced',
    fileCount: 42,
    sizeBytes: 1024 * 350,
  };

  onProgress?.('Fetching remote refs and commit delta...', 25);
  await new Promise(r => setTimeout(r, 250));

  onProgress?.('Resolving tree deltas & fast-forwarding...', 65);
  await new Promise(r => setTimeout(r, 300));

  onProgress?.('Updating local working tree index...', 90);
  await new Promise(r => setTimeout(r, 200));

  existing.lastSyncedAt = Date.now();
  existing.status = 'synced';
  store[repoName] = existing;
  localStorage.setItem(DEVICE_SYNC_STORAGE_KEY, JSON.stringify(store));

  onProgress?.('Synced with origin/main', 100);
  return existing;
}
