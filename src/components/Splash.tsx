import React, { useEffect, useRef } from 'react';
import { animate } from 'animejs';
import { checkPrefersReducedMotion } from '../hooks/useAnime';

export const Splash: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let skip = checkPrefersReducedMotion();
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1' || params.get('demo') === '1') {
        skip = true;
      }
    } catch (_) {}

    if (skip) {
      onComplete();
      return;
    }

    const anims: any[] = [];

    // Intro animation with anime.js
    if (logoRef.current) {
      anims.push(
        animate(logoRef.current, {
          scale: [0.88, 1],
          opacity: [0, 1],
          duration: 500,
          ease: 'outExpo',
        })
      );
    }

    if (textRef.current) {
      anims.push(
        animate(textRef.current, {
          translateY: [12, 0],
          opacity: [0, 1],
          duration: 550,
          delay: 120,
          ease: 'outQuart',
        })
      );
    }

    const timer = setTimeout(() => {
      if (containerRef.current) {
        anims.push(
          animate(containerRef.current, {
            opacity: [1, 0],
            scale: [1, 1.02],
            duration: 300,
            ease: 'inOutQuad',
            onComplete: () => {
              onComplete();
            },
          })
        );
      } else {
        onComplete();
      }
    }, 950);

    return () => {
      clearTimeout(timer);
      anims.forEach((a) => {
        try { a?.pause?.(); } catch (_) {}
      });
    };
  }, [onComplete]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-main flex flex-col items-center justify-center z-[9999] p-5 select-none"
    >
      <img 
        ref={logoRef}
        src="/git-manager-logo.png" 
        alt="Git Manager Logo" 
        className="w-24 h-24 object-contain mb-5 drop-shadow-xl" 
      />
      <div ref={textRef} className="text-center space-y-1">
        <div className="text-2xl font-extrabold tracking-tight text-text-main">
          Git <span className="text-primary">Manager</span>
        </div>
        <div className="text-[10px] font-bold text-text-muted tracking-widest uppercase">
          Studio Workbench
        </div>
      </div>
    </div>
  );
};
