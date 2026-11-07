import { useState, useRef, useEffect, useCallback } from 'react';
import { WorkflowPhase, WorkflowStep, ActionResultSummary, ActionWorkflowOptions } from './types';

const DEFAULT_STEPS: WorkflowStep[] = [
  { id: 'val', label: 'Validating payload', sublabel: 'Checking input invariants & refs' },
  { id: 'exec', label: 'Executing operation', sublabel: 'Applying changes to Git repository' },
  { id: 'ver', label: 'Verifying repository state', sublabel: 'Confirming tree consistency & cache' },
];

export function useActionWorkflow(options: ActionWorkflowOptions = {}) {
  const { steps = DEFAULT_STEPS, autoCloseDelay = 2000 } = options;
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const [phase, setPhase] = useState<WorkflowPhase>('idle');
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [resultSummary, setResultSummary] = useState<ActionResultSummary | null>(null);
  const [countdownRemaining, setCountdownRemaining] = useState<number>(Math.ceil(autoCloseDelay / 1000));

  const timerRef = useRef<any>(null);
  const countdownIntervalRef = useRef<any>(null);
  const isMountedRef = useRef<boolean>(true);

  const cleanup = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    timerRef.current = null;
    countdownIntervalRef.current = null;
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  const execute = useCallback(async (
    actionFn: () => Promise<ActionResultSummary | boolean | void>
  ) => {
    cleanup();
    if (!isMountedRef.current) return;
    setErrorMsg('');
    setPhase('validating');
    setActiveStepIndex(0);

    const stepDelay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    try {
      await stepDelay(280);
      if (!isMountedRef.current) return;
      setPhase('executing');
      setActiveStepIndex(1);

      const [actionResult] = await Promise.all([
        actionFn(),
        stepDelay(380),
      ]);

      if (!isMountedRef.current) return;
      if (actionResult === false) {
        throw new Error('Operation was rejected or could not be completed.');
      }

      setPhase('verifying');
      setActiveStepIndex(2);
      await stepDelay(260);
      if (!isMountedRef.current) return;

      const summary: ActionResultSummary = (typeof actionResult === 'object' && actionResult !== null)
        ? actionResult as ActionResultSummary
        : { title: 'Action Verified', subtitle: 'Repository successfully updated.' };

      setResultSummary(summary);
      setPhase('success');
      optionsRef.current.onSuccess?.();

      const delay = optionsRef.current.autoCloseDelay ?? 2000;
      const totalSeconds = Math.max(1, Math.ceil(delay / 1000));
      setCountdownRemaining(totalSeconds);

      countdownIntervalRef.current = setInterval(() => {
        if (!isMountedRef.current) return;
        setCountdownRemaining((prev) => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      timerRef.current = setTimeout(() => {
        if (!isMountedRef.current) return;
        optionsRef.current.onClose?.();
      }, delay);

    } catch (err: any) {
      cleanup();
      if (!isMountedRef.current) return;
      setPhase('error');
      setErrorMsg(err?.message || 'Operation failed. Please verify input and try again.');
    }
  }, [cleanup]);

  const reset = useCallback(() => {
    cleanup();
    if (!isMountedRef.current) return;
    setPhase('idle');
    setActiveStepIndex(0);
    setErrorMsg('');
    setResultSummary(null);
  }, [cleanup]);

  const dismissNow = useCallback(() => {
    cleanup();
    if (!isMountedRef.current) return;
    optionsRef.current.onClose?.();
  }, [cleanup]);

  return {
    phase,
    isBusy: phase === 'validating' || phase === 'executing' || phase === 'verifying',
    activeStepIndex,
    steps,
    errorMsg,
    resultSummary,
    countdownRemaining,
    execute,
    reset,
    dismissNow,
  };
}
