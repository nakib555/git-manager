export interface CiCdStep {
  name: string;
  status: 'success' | 'failed' | 'running' | 'pending';
  duration: string;
  log: string;
  externalUrl?: string;
}

export interface CiCdState {
  status: 'success' | 'failed' | 'running' | 'pending';
  label: string;
  color: string;
  badgeBg: string;
  duration: string;
  steps: CiCdStep[];
  isReal?: boolean;
  totalCount?: number;
  checkSuiteId?: number | null;
}
