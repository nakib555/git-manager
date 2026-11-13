import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Loader2, X } from 'lucide-react';

interface ConfirmationCountdownButtonProps {
  label: string;
  confirmingLabel?: string;
  executingLabel?: string;
  countdownSeconds?: number;
  onConfirm: () => void | Promise<void>;
  onCountdownChange?: (isCounting: boolean) => void;
  disabled?: boolean;
  variant?: 'danger' | 'accent' | 'warning';
  icon?: React.ReactNode;
}

export const ConfirmationCountdownButton: React.FC<ConfirmationCountdownButtonProps> = ({
  label,
  confirmingLabel = 'Confirming... (Tap to Cancel)',
  executingLabel = 'Executing...',
  countdownSeconds = 3,
  onConfirm,
  onCountdownChange,
  disabled = false,
  variant = 'danger',
  icon,
}) => {
  const [isCounting, setIsCounting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(countdownSeconds);
  const [isExecuting, setIsExecuting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    onCountdownChange?.(isCounting);
  }, [isCounting, onCountdownChange]);

  const startCountdown = () => {
    if (disabled || isExecuting || isCounting) return;
    setIsCounting(true);
    setSecondsLeft(countdownSeconds);
    setProgress(0);

    const startTime = Date.now();
    const duration = countdownSeconds * 1000;

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, Math.ceil((duration - elapsed) / 1000));
      const pct = Math.min(100, Math.max(0, (elapsed / duration) * 100));

      if (isMountedRef.current) {
        setSecondsLeft(remaining);
        setProgress(pct);
      }

      if (elapsed >= duration) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        try {
          btnRef.current?.blur();
        } catch (_) {}
        if (isMountedRef.current) {
          setIsCounting(false);
          setProgress(0);
          setIsExecuting(true);
        }
        Promise.resolve(onConfirm()).finally(() => {
          if (isMountedRef.current) setIsExecuting(false);
        });
      }
    }, 50);
  };

  const cancelCountdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsCounting(false);
    setProgress(0);
    setSecondsLeft(countdownSeconds);
  };

  const isDisabled = disabled || isExecuting;

  const variantStyles = {
    danger: isCounting
      ? 'bg-rose-700 text-white border border-rose-500/60 shadow-[0_0_24px_-4px_rgba(244,63,94,0.55)]'
      : 'bg-rose-600 hover:bg-rose-500 text-white border border-rose-500/50 shadow-[0_4px_16px_-2px_rgba(225,29,72,0.4)] hover:shadow-[0_6px_22px_-2px_rgba(244,63,94,0.55)]',
    accent: isCounting
      ? 'bg-accent/85 text-white border border-accent/60'
      : 'bg-accent hover:opacity-95 text-white border border-accent/50 shadow-sm',
    warning: isCounting
      ? 'bg-amber-600 text-white border border-amber-400/50'
      : 'bg-amber-500 hover:bg-amber-400 text-white border border-amber-400/50 shadow-sm',
  };

  return (
    <div className="relative inline-flex items-center w-full">
      <motion.button
        ref={btnRef}
        type="button"
        disabled={isDisabled}
        onClick={isCounting ? cancelCountdown : startCountdown}
        whileHover={isDisabled ? undefined : { scale: 1.01 }}
        whileTap={isDisabled ? undefined : { scale: 0.975 }}
        transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
        className={`relative overflow-hidden w-full h-11 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed select-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1 ${variantStyles[variant]}`}
      >
        {/* Smooth Progress Fill during countdown */}
        {isCounting && (
          <div
            className="absolute left-0 top-0 bottom-0 bg-white/20 transition-[width] duration-75 ease-linear pointer-events-none"
            style={{ width: `${progress}%` }}
          />
        )}

        <div className="relative z-10 flex items-center justify-center gap-2 whitespace-nowrap">
          {isExecuting ? (
            <>
              <Loader2 size={14} className="animate-spin shrink-0" />
              <span>{executingLabel}</span>
            </>
          ) : isCounting ? (
            <>
              <span className="font-mono text-[11px] tabular-nums font-bold px-1.5 py-0.5 rounded bg-black/30">
                {secondsLeft}s
              </span>
              <span>{confirmingLabel}</span>
              <X size={13} className="opacity-85 shrink-0" />
            </>
          ) : (
            <>
              {icon}
              <span>{label}</span>
            </>
          )}
        </div>
      </motion.button>
    </div>
  );
};

