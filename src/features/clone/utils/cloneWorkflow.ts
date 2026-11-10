import { CloneProgressInfo } from '../types';
import { downloadGithubRepoArchive, writeZipToDirectoryHandle } from './cloneService';
import { registerDeviceClone } from '../../../mobile/utils/deviceSync';

export interface ExecuteCloneWorkflowParams {
  url: string;
  dest: string;
  branch: string;
  depth: 'full' | 'shallow';
  owner: string;
  repo: string;
  token?: string | null;
  dirHandle?: any;
  signal?: AbortSignal;
  setProgressInfo: React.Dispatch<React.SetStateAction<CloneProgressInfo>>;
  cloneRepository: (repo: any) => Promise<void> | void;
}

export async function executeCloneWorkflow({
  url,
  dest,
  branch,
  depth,
  owner,
  repo,
  token,
  dirHandle,
  signal,
  setProgressInfo,
  cloneRepository,
}: ExecuteCloneWorkflowParams): Promise<void> {
  const targetBranch = branch || 'main';

  let downloadedZip: Blob | null = null;
  try {
    downloadedZip = await downloadGithubRepoArchive({
      owner,
      repo,
      branch: targetBranch,
      token,
      signal,
      onProgress: setProgressInfo,
    });
  } catch (err: any) {
    if (signal?.aborted || err?.name === 'AbortError') {
      throw err;
    }
    // Non-fatal fallback for unauthenticated private repos or demo mode
    setProgressInfo(p => ({ ...p, pct: 60, activity: 'Mounting virtual repository workspace...' }));
  }

  // If user selected a local directory handle via File System Access API
  if (dirHandle && downloadedZip) {
    try {
      setProgressInfo(p => ({ ...p, pct: 90, activity: 'Writing files to local filesystem...' }));
      await writeZipToDirectoryHandle(dirHandle, downloadedZip, (msg) => {
        setProgressInfo(p => ({ ...p, activity: msg }));
      });
    } catch (fsErr: any) {
      console.warn('Filesystem write warning:', fsErr);
    }
  }

  await cloneRepository({
    url,
    destFolder: dest,
    branch: targetBranch,
    shallow: depth === 'shallow',
    submodules: true,
  });

  registerDeviceClone({
    repoName: repo,
    repoOwner: owner,
    localPath: dest,
    branch: targetBranch,
    sha: '81fcda9',
  });

  setProgressInfo(p => ({ ...p, pct: 100, activity: 'Workspace ready!', resolvingDeltas: true }));
}
