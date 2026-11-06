import { useState, useEffect } from 'react';
import { useAppContext } from '../../../AppContext';
import { CiCdState, CiCdStep } from '../types';

export const getEmptyCiCdStatus = (): CiCdState => ({
  status: 'pending',
  label: 'No Checks',
  color: 'text-text-muted/60 border-border bg-hover/20',
  badgeBg: 'bg-hover/20',
  duration: '0s',
  steps: []
});

export const useCiCdStatus = (hash: string) => {
  const { githubToken, currentRepo, currentRepoOwner } = useAppContext();
  const [realState, setRealState] = useState<CiCdState | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    if (!hash || !githubToken || !currentRepo || !currentRepoOwner) {
      setRealState(null);
      return;
    }

    let isMounted = true;
    const fetchStatus = async () => {
      try {
        setIsPolling(true);
        const headers = {
          Authorization: `Bearer ${githubToken}`,
          Accept: 'application/vnd.github.v3+json',
        };
        const res = await fetch(
          `https://api.github.com/repos/${currentRepoOwner}/${currentRepo}/commits/${hash}/check-runs`,
          { headers }
        );
        if (!res.ok) {
          if (isMounted) setRealState(null);
          return;
        }
        const data = await res.json();
        if (!isMounted) return;

        const steps: CiCdStep[] = (data.check_runs || []).map((run: any) => ({
          name: run.name,
          status: run.status === 'completed'
            ? (run.conclusion === 'success' ? 'success' : 'failed')
            : (run.status === 'in_progress' ? 'running' : 'pending'),
          duration: run.started_at && run.completed_at
            ? `${Math.max(1, Math.round((new Date(run.completed_at).getTime() - new Date(run.started_at).getTime()) / 1000))}s`
            : '0s',
          log: `Check Name: ${run.name}\nStatus: ${run.status}\nConclusion: ${run.conclusion || 'pending'}`,
          externalUrl: run.html_url
        }));

        if (steps.length > 0) {
          const hasFailed = steps.some(s => s.status === 'failed');
          const isRunning = steps.some(s => s.status === 'running');
          const overallStatus = hasFailed ? 'failed' : isRunning ? 'running' : 'success';

          setRealState({
            status: overallStatus,
            label: overallStatus === 'failed' ? 'Failed' : overallStatus === 'running' ? 'Running' : 'Passed',
            color: overallStatus === 'failed' ? 'text-rose-500 bg-rose-500/10' : overallStatus === 'running' ? 'text-amber-500 bg-amber-500/10' : 'text-emerald-500 bg-emerald-500/10',
            badgeBg: overallStatus === 'failed' ? 'bg-rose-500/10' : overallStatus === 'running' ? 'bg-amber-500/10' : 'bg-emerald-500/10',
            duration: `${steps.length * 3}s`,
            steps,
            isReal: true,
            totalCount: steps.length,
          });
        } else {
          setRealState(null);
        }
      } catch (_) {
        if (isMounted) setRealState(null);
      } finally {
        if (isMounted) setIsPolling(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [hash, githubToken, currentRepo, currentRepoOwner]);

  const cicd = realState || getEmptyCiCdStatus();
  return {
    cicd,
    isReal: !!realState,
    isPolling,
    triggerRerun: () => {}
  };
};
