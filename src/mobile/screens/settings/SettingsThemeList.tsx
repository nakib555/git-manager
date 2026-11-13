import React from 'react';
import { Sun, Moon, Check } from 'lucide-react';

interface SettingsThemeListProps {
  theme: string;
  onThemeSelect: (themeId: 'dark' | 'light') => void;
}

export const SettingsThemeList: React.FC<SettingsThemeListProps> = ({
  theme,
  onThemeSelect,
}) => {
  const isLight = theme === 'light';

  const options = [
    {
      id: 'dark' as const,
      name: 'Cloudflare Dark',
      badge: 'Default',
      description: 'Deep obsidian-graphite engineering console with warm orange accents',
      icon: Moon,
      previewClass: 'bg-[#141418] border-[#2B2B35] text-[#F6821F]',
      active: !isLight,
    },
    {
      id: 'light' as const,
      name: 'Clean Light',
      badge: 'Daylight',
      description: 'High-contrast light engineering surface with neutral borders',
      icon: Sun,
      previewClass: 'bg-white border-[#DEDDD8] text-[#3E5670]',
      active: isLight,
    },
  ];

  return (
    <div className="space-y-3">
      <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary block px-1">
        Appearance Theme
      </span>

      <div className="bg-surface-1 border border-border rounded-xl divide-y divide-border/60 overflow-hidden shadow-xs">
        {options.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onThemeSelect(item.id)}
              aria-pressed={item.active}
              className={`w-full text-left p-4 transition-colors cursor-pointer flex items-center justify-between min-h-[60px] select-none ${
                item.active ? 'bg-accent/10' : 'hover:bg-surface-2/60'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0 pr-3">
                <div
                  className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${item.previewClass}`}
                >
                  <Icon size={17} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-text-primary">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-text-tertiary font-mono">
                      · {item.active ? 'Active' : item.badge}
                    </span>
                  </div>
                  <p className="text-xs text-text-tertiary truncate mt-0.5">
                    {item.description}
                  </p>
                </div>
              </div>

              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                  item.active
                    ? 'border-accent bg-accent text-white shadow-2xs'
                    : 'border-border bg-surface-2 text-transparent'
                }`}
              >
                <Check size={12} strokeWidth={3} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

