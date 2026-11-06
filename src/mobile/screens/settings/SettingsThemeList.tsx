import React from 'react';
import { Moon, Sun, Sparkles, Check } from 'lucide-react';

interface SettingsThemeListProps {
  theme: string;
  onThemeSelect: (themeId: any) => void;
}

export const SettingsThemeList: React.FC<SettingsThemeListProps> = ({
  theme,
  onThemeSelect,
}) => {
  const themes = [
    {
      id: 'dark',
      name: 'Dark Charcoal',
      badge: 'Default',
      surfaceHex: '#18191D',
      accentHex: '#5E7896',
      desc: 'Calibrated charcoal workstation with desaturated slate blue-gray accent',
      icon: Moon,
    },
    {
      id: 'light',
      name: 'Warm Linen',
      badge: 'Daylight',
      surfaceHex: '#FFFFFF',
      accentHex: '#3E5670',
      desc: 'Warm off-white engineering surface with neutral borders and typography',
      icon: Sun,
    },
    {
      id: 'slate',
      name: 'Deep Slate',
      badge: 'Graphite',
      surfaceHex: '#1B1E22',
      accentHex: '#667C8F',
      desc: 'Deep graphite workstation with calm slate accents',
      icon: Sparkles,
    },
  ] as const;

  return (
    <div className="space-y-3">
      <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary block px-1">
        Appearance Theme
      </span>

      <div className="bg-surface-1 border border-border rounded-xl divide-y divide-border/60 overflow-hidden shadow-xs">
        {themes.map((t) => {
          const isSelected = theme === t.id;
          const Icon = t.icon;
          return (
            <div
              key={t.id}
              onClick={() => onThemeSelect(t.id)}
              className={`p-4 transition-colors cursor-pointer flex items-center justify-between min-h-[56px] select-none ${
                isSelected 
                  ? 'bg-accent/10 border-l-2 border-accent' 
                  : 'hover:bg-surface-2/60'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div 
                  className="w-9 h-9 rounded-lg border border-border flex items-center justify-center shrink-0"
                  style={{ backgroundColor: t.surfaceHex }}
                >
                  <Icon size={18} style={{ color: t.accentHex }} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[13px] ${isSelected ? 'font-bold text-text-primary' : 'font-medium text-text-secondary'}`}>
                      {t.name}
                    </span>
                    <span className="text-[10px] text-text-tertiary font-mono">
                      · {t.badge}
                    </span>
                  </div>
                  <p className="text-xs text-text-tertiary truncate mt-0.5">
                    {t.desc}
                  </p>
                </div>
              </div>

              <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                isSelected ? 'border-accent bg-accent text-white shadow-2xs' : 'border-border'
              }`}>
                {isSelected && <Check size={12} strokeWidth={3} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
