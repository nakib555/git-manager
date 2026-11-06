import { LocalDeviceRepoSync } from '../../mobile/utils/deviceSync';

export type CloneProtocol = 'https' | 'ssh' | 'cli';
export type CloneStep = 'config' | 'progress' | 'success';

export interface CloneProgressInfo {
  pct: number;
  activity: string;
  speed: string;
  timeRemaining: string;
  receivedObjects: { current: number; total: number };
  resolvingDeltas: boolean;
}

export interface TreeFileItem {
  id: string;
  path: string;
  name: string;
  type: 'file' | 'dir';
  sizeBytes?: number;
  content?: string;
  children?: TreeFileItem[];
}

export interface UnifiedRepoItem {
  name: string;
  owner: string;
  url: string;
  language?: string;
  stars?: number;
  description?: string;
  isOnDevice: boolean;
  deviceSync?: LocalDeviceRepoSync | null;
}
