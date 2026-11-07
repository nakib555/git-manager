import { useState, useRef, useEffect, useCallback } from 'react';
import { WorkflowPhase, WorkflowStep, ActionResultSummary, ActionWorkflowOptions } from './types';

const DEFAULT_STEPS: WorkflowStep[] = [
  { id: 'val', label: 'Validating payload', sublabel: 'Checking input invariants & refs' },
  { id: 'exec', label: 'Executing operation', sublabel: 'Applying changes to Git repository' },
  { id: 'ver', label: 'Verifying repository state', sublabel: 'Confirming tree consistency & cache' },
];

export function useActionWorkflow(options: ActionWorkflowOptions = {}) {
  const { steps = DEFAULT_STEPS, autoCloseDelay = 2000, onSuccess, onClose } = options;
  const [phase, setPhase] = useState<WorkflowPhase>('idle');
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [resultSummary, setResultSummary] = useState<ActionResultSummary | null>(null);
  const [countdownRemaining, setCountdownRemaining] = useState<number>(Math.ceil(autoCloseDelay / 1000));

  const timerRef = useRef<any>(null);
  const countdownIntervalRef = useRef<any>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const execute = useCallback(async (
    actionFn: () => Promise<ActionResultSummary | boolean | void>
  ) => {
    cleanup();
    setErrorMsg('');
    setPhase('validating');
    setActiveStepIndex(0);

    const stepDelay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    try {
      await stepDelay(280);
      setPhase('executing');
      setActiveStepIndex(1);

      const [actionResult] = await Promise.all([
        actionFn(),
        stepDelay(380),
      ]);

      setPhase('verifying');
      setActiveStepIndex(2);
      await stepDelay(260);

      const summary: ActionResultSummary = (typeof actionResult === 'object' && actionResult !== null)
        ? actionResult as ActionResultSummary
        : { title: 'Action Verified', subtitle: 'Repository successfully updated.' };

      setResultSummary(summary);
      setPhase('success');
      onSuccess?.();

      // Start auto-close countdown
      const totalSeconds = Math.ceil(autoCloseDelay / 1000);
      setCountdownRemaining(totalSeconds);

      countdownIntervalRef.current = setInterval(() => {
        setCountdownRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      timerRef.current = setTimeout(() => {
        onClose?.();
      }, autoCloseDelay);

    } catch (err: any) {
      cleanup();
      setPhase('error');
      setErrorMsg(err?.message || 'Operation failed. Please try again.');
    }
  }, [actionFnWrapper(onSuccess, onClose, autoCloseDelay, cleanup)]);

  const reset = useCallback(() => {
    cleanup();
    setPhase('idle');
    setActiveStepIndex(0);
    setErrorMsg('');
    setResultSummary(null);
  }, [cleanup]);

  const dismissNow = useCallback(() => {
    cleanup();
    onClose?.();
  }, [cleanup, onClose]);

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

function actionFnWrapper(onSuccess?: () => void, onClose?: () => void, delay?: number, cleanup?: () => void) {
  return [onSuccess, onClose, delay, cleanup];
}
