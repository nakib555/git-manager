import { useEffect, useRef } from 'react';
import { animate } from 'animejs';

export function checkPrefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Smooth numeric count up animation using anime.js
 */
export function useCountUp(
  targetValue: number,
  duration = 800,
  formatter?: (val: number) => string
) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const isReduced = checkPrefersReducedMotion();
    if (isReduced) {
      ref.current.textContent = formatter ? formatter(targetValue) : String(targetValue);
      return;
    }

    const obj = { val: 0 };
    const anim = animate(obj, {
      val: targetValue,
      duration,
      ease: 'outExpo',
      onUpdate: () => {
        if (ref.current) {
          const rounded = Math.round(obj.val);
          ref.current.textContent = formatter ? formatter(rounded) : String(rounded);
        }
      },
    });

    return () => {
      try {
        anim.revert();
      } catch {
        // Safe fallback
      }
    };
  }, [targetValue, duration, formatter]);

  return ref;
}
