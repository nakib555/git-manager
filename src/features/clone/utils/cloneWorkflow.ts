import { CloneProgressInfo } from '../types';
import { downloadGithubRepoArchive } from './cloneService';
import { registerDeviceClone } from '../../../mobile/utils/deviceSync';

export interface ExecuteCloneWorkflowParams {
  url: string;
  dest: string;
  branch: string;
  depth: 'full' | 'shallow';
  owner: string;
  repo: string;
  token?: string | null;
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
  setProgressInfo,
  cloneRepository,
}: ExecuteCloneWorkflowParams): Promise<void> {
  const targetBranch = branch || 'main';

  try {
    await downloadGithubRepoArchive({
      owner,
      repo,
      branch: targetBranch,
      token,
      onProgress: setProgressInfo,
    });
  } catch (_) {
    setProgressInfo(p => ({ ...p, pct: 50, activity: 'Cloning workspace files...' }));
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
