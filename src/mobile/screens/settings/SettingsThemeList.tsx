import React from 'react';
import { Sun, Check } from 'lucide-react';

interface SettingsThemeListProps {
  theme: string;
  onThemeSelect: (themeId: any) => void;
}

export const SettingsThemeList: React.FC<SettingsThemeListProps> = ({
  onThemeSelect,
}) => {
  return (
    <div className="space-y-3">
      <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary block px-1">
        Appearance Theme
      </span>

      <div className="bg-surface-1 border border-border rounded-xl divide-y divide-border/60 overflow-hidden shadow-xs">
        <div
          onClick={() => onThemeSelect('light')}
          className="p-4 transition-colors cursor-pointer flex items-center justify-between min-h-[56px] select-none bg-accent/10 border-l-2 border-accent"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div 
              className="w-9 h-9 rounded-lg border border-border flex items-center justify-center shrink-0 bg-white"
            >
              <Sun size={18} className="text-accent" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold text-text-primary">
                  Clean Light
                </span>
                <span className="text-[10px] text-text-tertiary font-mono">
                  · Active & Calibrated
                </span>
              </div>
              <p className="text-xs text-text-tertiary truncate mt-0.5">
                High-contrast light engineering surface with neutral borders and typography
              </p>
            </div>
          </div>

          <div className="w-5 h-5 rounded-full border border-accent bg-accent text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Check size={12} strokeWidth={3} />
          </div>
        </div>
      </div>
    </div>
  );
};
