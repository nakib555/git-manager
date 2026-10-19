import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  children,
}) => {
  return (
    <div className="bg-surface-1 border border-border rounded-xl p-8 text-center flex flex-col items-center justify-center space-y-3">
      <div className="w-12 h-12 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-text-tertiary">
        <Icon size={24} strokeWidth={1.75} />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-text-primary tracking-tight">
          {title}
        </h3>
        <p className="text-xs text-text-tertiary mt-1 max-w-xs leading-relaxed">
          {description}
        </p>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 h-9 px-4 rounded-xl bg-accent text-white text-xs font-semibold hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-sm shadow-accent/20"
        >
          {action.label}
        </button>
      )}
      {children}
    </div>
  );
};
