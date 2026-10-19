import { useState, useEffect } from 'react';

export interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export function useSafeArea(): SafeAreaInsets {
  const [insets, setInsets] = useState<SafeAreaInsets>({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const computeInsets = () => {
      // In web browser / PWA environments, inspect CSS env() variables or provide fallback for notches
      const div = document.createElement('div');
      div.style.position = 'fixed';
      div.style.top = '0';
      div.style.left = '0';
      div.style.width = '0';
      div.style.height = '0';
      div.style.paddingTop = 'env(safe-area-inset-top, 0px)';
      div.style.paddingBottom = 'env(safe-area-inset-bottom, 0px)';
      div.style.paddingLeft = 'env(safe-area-inset-left, 0px)';
      div.style.paddingRight = 'env(safe-area-inset-right, 0px)';
      div.style.visibility = 'hidden';
      document.body.appendChild(div);

      const style = window.getComputedStyle(div);
      const top = parseInt(style.paddingTop, 10) || 0;
      const bottom = parseInt(style.paddingBottom, 10) || 0;
      const left = parseInt(style.paddingLeft, 10) || 0;
      const right = parseInt(style.paddingRight, 10) || 0;

      document.body.removeChild(div);

      setInsets({ top, bottom, left, right });
    };

    computeInsets();
    window.addEventListener('resize', computeInsets);
    window.addEventListener('orientationchange', computeInsets);

    return () => {
      window.removeEventListener('resize', computeInsets);
      window.removeEventListener('orientationchange', computeInsets);
    };
  }, []);

  return insets;
}
