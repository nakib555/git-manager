import React from 'react';
import { useAppContext } from '../../AppContext';
import { Grid, EyeOff } from 'lucide-react';

export const GridOverlay: React.FC = () => {
  const { showGridOverlay, toggleGridOverlay } = useAppContext();

  if (!showGridOverlay) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9999] select-none"
      aria-hidden="true"
    >
      {/* 8-point SVG Grid Background */}
      <svg
        className="absolute inset-0 w-full h-full opacity-60"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          {/* 8px base unit pattern */}
          <pattern id="grid-8" width="8" height="8" patternUnits="userSpaceOnUse">
            <path
              d="M 8 0 L 0 0 0 8"
              fill="none"
              stroke="rgba(56, 189, 248, 0.15)"
              strokeWidth="0.5"
            />
          </pattern>
          {/* 32px major rhythm pattern */}
          <pattern id="grid-32" width="32" height="32" patternUnits="userSpaceOnUse">
            <rect width="32" height="32" fill="url(#grid-8)" />
            <path
              d="M 32 0 L 0 0 0 32"
              fill="none"
              stroke="rgba(56, 189, 248, 0.35)"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-32)" />
      </svg>

      {/* Floating Inspector Info Pill */}
      <div className="absolute top-16 right-3 pointer-events-auto shadow-xl bg-surface-1/95 backdrop-blur-md border border-accent/40 rounded-xl px-3 py-2 flex items-center gap-2.5 text-xs text-text-primary animate-fade-in">
        <div className="w-6 h-6 rounded-lg bg-accent-soft text-accent flex items-center justify-center shrink-0">
          <Grid size={14} />
        </div>
        <div>
          <div className="font-bold text-[11px] text-accent flex items-center gap-1.5">
            <span>8pt Grid Active</span>
            <span className="text-[10px] text-text-tertiary font-mono">(8px base · 16px pad · 48px target)</span>
          </div>
          <div className="text-[10px] text-text-tertiary font-mono">
            Clearance: 80px bottom safe zone
          </div>
        </div>
        <button
          onClick={toggleGridOverlay}
          className="ml-1 h-7 px-2.5 rounded-lg bg-surface-2 hover:bg-surface-3 border border-border text-text-secondary hover:text-text-primary text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          title="Hide Grid Overlay"
        >
          <EyeOff size={11} />
          <span>Hide</span>
        </button>
      </div>
    </div>
  );
};
