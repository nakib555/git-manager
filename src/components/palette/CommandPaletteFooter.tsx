import React from 'react';

export const CommandPaletteFooter: React.FC = () => (
  <div className="px-4 py-2 border-t border-border bg-hover/20 flex items-center justify-between text-[11px] text-text-muted font-mono">
    <div className="flex items-center gap-3">
      <span className="flex items-center gap-1">
        <kbd className="px-1.5 py-0.5 bg-card border border-border rounded text-[10px]">↑</kbd>
        <kbd className="px-1.5 py-0.5 bg-card border border-border rounded text-[10px]">↓</kbd>
        <span>navigate</span>
      </span>
      <span className="flex items-center gap-1">
        <kbd className="px-1.5 py-0.5 bg-card border border-border rounded text-[10px]">↵</kbd>
        <span>select</span>
      </span>
    </div>
    <span className="flex items-center gap-1">
      <kbd className="px-1.5 py-0.5 bg-card border border-border rounded text-[10px]">esc</kbd>
      <span>close</span>
    </span>
  </div>
);
