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
      <svg className="w-[100px] h-[100px] mb-6 animate-float" viewBox="0 0 100 100" fill="none">
        <path d="M50 15L85 35V65L50 85L15 65V35L50 15Z" fill="rgba(124,58,237,0.2)" stroke="#7C3AED" strokeWidth="4"/>
        <path d="M50 15L85 35L50 55L15 35L50 15Z" fill="#8B5CF6"/>
        <path d="M15 65L50 85V55L15 35V65Z" fill="#7C3AED"/>
        <path d="M85 65L50 85V55L85 35V65Z" fill="#5B21B6"/>
      </svg>
      <div className="text-[32px] font-bold mb-3">Git <span className="text-primary">Manager</span></div>
      <div className="text-base font-semibold text-text-main">The future of version control.</div>
    </div>
  );
};
