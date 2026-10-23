export interface LocalDeviceRepoSync {
  repoName: string;
  repoOwner: string;
  localPath: string;
  lastSyncedAt: number; // Unix timestamp ms
  syncedBranch: string;
  syncedSha: string;
  status: 'synced' | 'diverged' | 'syncing';
  fileCount: number;
  sizeBytes: number;
}

const DEVICE_SYNC_STORAGE_KEY = 'git_manager_device_synced_repos';

/**
 * Retrieve all repositories currently registered as saved/cloned on device.
 */
export function getDeviceSyncedRepos(): Record<string, LocalDeviceRepoSync> {
  try {
    const raw = localStorage.getItem(DEVICE_SYNC_STORAGE_KEY);
    if (!raw) {
      // Default initial sync state for sample repos
      const initial: Record<string, LocalDeviceRepoSync> = {
        'git-manager': {
          repoName: 'git-manager',
          repoOwner: 'nakib555',
          localPath: '/Documents/Projects/git-manager',
          lastSyncedAt: Date.now() - 1000 * 60 * 18, // 18m ago
          syncedBranch: 'main',
          syncedSha: '81fcda9',
          status: 'synced',
          fileCount: 42,
          sizeBytes: 1024 * 380, // 380 KB
        },
        'Excel-grid': {
          repoName: 'Excel-grid',
          repoOwner: 'nakib555',
          localPath: '/Documents/Projects/Excel-grid',
          lastSyncedAt: Date.now() - 1000 * 60 * 60 * 4, // 4h ago
          syncedBranch: 'main',
          syncedSha: '4c81a2f',
          status: 'synced',
          fileCount: 28,
          sizeBytes: 1024 * 210,
        }
      };
      localStorage.setItem(DEVICE_SYNC_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load device synced repos:', err);
    return {};
  }
}

/**
 * Checks if a repository exists on device by name or remote URL.
 */
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

  // Also check recentClones from localStorage if present
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

/**
 * Registers or updates a repository in local device storage.
 */
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

/**
 * Simulates differential synchronization of an existing on-device repository.
 */
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

  // Differential sync pipeline simulation
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
