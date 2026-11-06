import React, { useState, useEffect, useRef } from 'react';
import { Loader2, CheckCircle2, AlertTriangle, X } from 'lucide-react';

interface ConfirmationCountdownButtonProps {
  label: string;
  confirmingLabel?: string;
  countdownSeconds?: number;
  onConfirm: () => void | Promise<void>;
  disabled?: boolean;
  variant?: 'danger' | 'accent' | 'warning';
  icon?: React.ReactNode;
}

export const ConfirmationCountdownButton: React.FC<ConfirmationCountdownButtonProps> = ({
  label,
  confirmingLabel = 'Hold to confirm...',
  countdownSeconds = 3,
  onConfirm,
  disabled = false,
  variant = 'danger',
  icon,
}) => {
  const [isCounting, setIsCounting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(countdownSeconds);
  const [isExecuting, setIsExecuting] = useState(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCountdown = () => {
    if (disabled || isExecuting) return;
    setIsCounting(true);
    setSecondsLeft(countdownSeconds);

    const startTime = Date.now();
    const duration = countdownSeconds * 1000;

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, Math.ceil((duration - elapsed) / 1000));
      setSecondsLeft(remaining);

      if (elapsed >= duration) {
        clearInterval(timerRef.current);
        setIsCounting(false);
        setIsExecuting(true);
        Promise.resolve(onConfirm()).finally(() => setIsExecuting(false));
      }
    }, 100);
  };

  const cancelCountdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (timerRef.current) clearInterval(timerRef.current);
    setIsCounting(false);
    setSecondsLeft(countdownSeconds);
  };

  const bgColors = {
    danger: isCounting ? 'bg-rose-700' : 'bg-rose-600 hover:bg-rose-700',
    accent: isCounting ? 'bg-accent/80' : 'bg-accent hover:opacity-90',
    warning: isCounting ? 'bg-amber-600' : 'bg-amber-500 hover:bg-amber-600',
  };

  const progressPercent = isCounting
    ? Math.min(100, Math.max(0, ((countdownSeconds - secondsLeft) / countdownSeconds) * 100))
    : 0;

  return (
    <div className="relative inline-flex items-center w-full">
      <button
        type="button"
        disabled={disabled || isExecuting}
        onClick={isCounting ? cancelCountdown : startCountdown}
        className={`relative overflow-hidden w-full h-11 px-4 rounded-xl text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 select-none shadow-md ${bgColors[variant]}`}
      >
        {/* Animated Progress Fill */}
        {isCounting && (
          <div
            className="absolute left-0 top-0 bottom-0 bg-white/20 transition-all duration-100 ease-linear pointer-events-none"
            style={{ width: `${progressPercent}%` }}
          />
        )}

        <div className="relative z-10 flex items-center justify-center gap-2">
          {isExecuting ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Executing...</span>
            </>
          ) : isCounting ? (
            <>
              <span className="font-mono text-xs tabular-nums font-extrabold px-1.5 py-0.5 rounded bg-black/30">
                {secondsLeft}s
              </span>
              <span>Confirming... (Tap to Cancel)</span>
              <X size={13} className="opacity-80" />
            </>
          ) : (
            <>
              {icon}
              <span>{label}</span>
            </>
          )}
        </div>
      </button>
    </div>
  );
};
