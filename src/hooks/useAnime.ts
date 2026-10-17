import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';

/**
 * Checks if the user prefers reduced motion
 */
export function checkPrefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Hook to animate an element ref using anime.js
 */
export function useAnime<T extends HTMLElement = HTMLDivElement>(
  params: Parameters<typeof animate>[1],
  deps: React.DependencyList = []
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const isReduced = checkPrefersReducedMotion();

    const animParams = isReduced
      ? { ...params, duration: 0, delay: 0 }
      : params;

    const anim = animate(ref.current, animParams);

    return () => {
      try {
        anim.revert();
      } catch {
        // Safe fallback if element is already detached
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}

/**
 * Stagger entrance animation hook for container child elements
 */
export function useStaggerList<T extends HTMLElement = HTMLDivElement>(
  childSelector = ':scope > *',
  deps: React.DependencyList = [],
  options: {
    duration?: number;
    delay?: number;
    translateY?: number | [number, number];
    opacity?: [number, number];
    staggerDelay?: number;
  } = {}
) {
  const containerRef = useRef<T | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const elements = containerRef.current.querySelectorAll(childSelector);
    if (!elements || elements.length === 0) return;

    const isReduced = checkPrefersReducedMotion();
    if (isReduced) {
      elements.forEach(el => {
        (el as HTMLElement).style.opacity = '1';
        (el as HTMLElement).style.transform = 'none';
      });
      return;
    }

    const {
      duration = 450,
      translateY = [12, 0],
      opacity = [0, 1],
      staggerDelay = 35,
    } = options;

    const anim = animate(Array.from(elements), {
      opacity,
      translateY,
      duration,
      delay: stagger(staggerDelay),
      ease: 'outQuart',
    });

    return () => {
      try {
        anim.revert();
      } catch {
        // Safe fallback
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return containerRef;
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

/**
 * Flash or pulse highlight on action completion (e.g. commit created, branch switched)
 */
export function triggerPulseHighlight(element: HTMLElement, color = 'rgba(99, 102, 241, 0.35)') {
  if (checkPrefersReducedMotion() || !element) return;

  animate(element, {
    backgroundColor: [color, 'transparent'],
    duration: 650,
    ease: 'outQuad',
  });
}
