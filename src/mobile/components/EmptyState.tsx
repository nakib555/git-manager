import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
}

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: EmptyStateAction;
  primaryAction?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  children?: ReactNode;
  compact?: boolean;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  primaryAction,
  secondaryAction,
  children,
  compact = false,
  className = '',
}) => {
  const resolvedPrimary = primaryAction || action;

  if (compact) {
    return (
      <div className={`bg-surface-1 border border-border rounded-xl p-4 text-center flex flex-col items-center justify-center space-y-2 ${className}`}>
        <div className="w-10 h-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-text-tertiary">
          <Icon size={20} strokeWidth={1.75} />
        </div>
        <div>
          <h3 className="text-xs font-semibold text-text-primary tracking-tight">
            {title}
          </h3>
          <p className="text-[11px] text-text-tertiary mt-0.5 max-w-xs leading-relaxed">
            {description}
          </p>
        </div>
        {resolvedPrimary && (
          <button
            type="button"
            onClick={resolvedPrimary.onClick}
            className="h-8 px-3 rounded-lg bg-accent text-white text-xs font-semibold hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            {resolvedPrimary.label}
          </button>
        )}
        {children}
      </div>
    );
  }

  return (
    <div className={`bg-surface-1 border border-border rounded-2xl p-6 sm:p-8 text-center flex flex-col items-center justify-center space-y-4 shadow-xs ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-border flex items-center justify-center text-text-tertiary shadow-2xs">
        <Icon size={26} strokeWidth={1.75} />
      </div>

      <div className="space-y-1.5 max-w-sm">
        <h3 className="text-sm font-bold text-text-primary tracking-tight">
          {title}
        </h3>
        <p className="text-xs text-text-tertiary leading-relaxed">
          {description}
        </p>
      </div>

      {(resolvedPrimary || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full max-w-xs pt-1">
          {resolvedPrimary && (
            <button
              type="button"
              onClick={resolvedPrimary.onClick}
              className="w-full min-h-[48px] h-12 px-4 rounded-xl bg-accent text-white text-xs font-semibold hover:opacity-90 active:scale-98 transition-all cursor-pointer shadow-sm shadow-accent/20 flex items-center justify-center gap-2"
            >
              {resolvedPrimary.icon && React.createElement(resolvedPrimary.icon, { size: 16 })}
              <span>{resolvedPrimary.label}</span>
            </button>
          )}

          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className="w-full min-h-[48px] h-12 px-4 rounded-xl bg-surface-2 border border-border text-text-primary text-xs font-semibold hover:bg-surface-3 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {secondaryAction.icon && React.createElement(secondaryAction.icon, { size: 16 })}
              <span>{secondaryAction.label}</span>
            </button>
          )}
        </div>
      )}

      {children}
    </div>
  );
};
