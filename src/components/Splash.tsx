import React, { useEffect, useState } from 'react';

export const Splash: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFading(true);
      setTimeout(() => {
        setIsVisible(false);
        onComplete();
      }, 400); // Wait for fade out animation
    }, 1500); // Show splash for 1.5s

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className={`absolute inset-0 bg-gradient-to-b from-main to-hover flex flex-col items-center justify-center z-[9999] p-5 transition-all duration-400 ${isFading ? 'opacity-0 -translate-y-5' : 'opacity-100 translate-y-0'}`}>
      <img src="/git_manager_logo.jpg" alt="Git Manager Logo" className="w-[100px] h-[100px] mb-6 animate-float rounded-2xl shadow-lg" />
      <div className="text-[32px] font-bold mb-3">Git <span className="text-primary">Manager</span></div>
      <div className="text-base font-semibold text-text-main">The future of version control.</div>
    </div>
  );
};
