import React from 'react';
import { Undo2, Redo2 } from 'lucide-react';

interface CodeGutterBarProps {
  onInsertSymbol: (symbol: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const COMMON_SYMBOLS = [
  { label: 'Tab', value: '  ' },
  { label: '{', value: '{' },
  { label: '}', value: '}' },
  { label: '(', value: '(' },
  { label: ')', value: ')' },
  { label: '[', value: '[' },
  { label: ']', value: ']' },
  { label: '"', value: '"' },
  { label: "'", value: "'" },
  { label: '`', value: '`' },
  { label: ';', value: ';' },
  { label: ':', value: ':' },
  { label: '=', value: ' = ' },
  { label: '=>', value: ' => ' },
  { label: '/', value: '/' },
  { label: '//', value: '// ' },
  { label: '<', value: '<' },
  { label: '>', value: '>' },
];

export const CodeGutterBar: React.FC<CodeGutterBarProps> = ({
  onInsertSymbol,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) => {
  return (
    <div className="h-10 px-2 bg-surface-2 border-t border-border flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 select-none">
      {/* Undo Button */}
      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        aria-label="Undo"
        className="h-8 w-8 rounded-lg bg-surface-1 border border-border flex items-center justify-center text-text-primary disabled:opacity-30 disabled:pointer-events-none hover:bg-surface-3 transition shrink-0 active:scale-95"
      >
        <Undo2 size={14} />
      </button>

      {/* Redo Button */}
      <button
        type="button"
        onClick={onRedo}
        disabled={!canRedo}
        aria-label="Redo"
        className="h-8 w-8 rounded-lg bg-surface-1 border border-border flex items-center justify-center text-text-primary disabled:opacity-30 disabled:pointer-events-none hover:bg-surface-3 transition shrink-0 active:scale-95"
      >
        <Redo2 size={14} />
      </button>

      <div className="w-px h-5 bg-border/80 shrink-0 mx-0.5" />

      {/* Symbols Carousel */}
      {COMMON_SYMBOLS.map((s) => (
        <button
          key={s.label}
          type="button"
          onClick={() => onInsertSymbol(s.value)}
          className="h-8 min-w-[32px] px-2 rounded-lg bg-surface-1 border border-border text-xs font-mono font-semibold text-text-primary hover:text-accent hover:border-accent/40 active:bg-surface-3 transition shrink-0 active:scale-95 flex items-center justify-center"
        >
          {s.label}
        </button>
      ))}
    </div>
  );
};
