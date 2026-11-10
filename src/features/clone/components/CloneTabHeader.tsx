import React from 'react';
import { X } from 'lucide-react';

import { CloneTab } from '../types';

interface CloneTabHeaderProps {
  activeTab: CloneTab;
  setActiveTab: (tab: CloneTab) => void;
  onClose?: () => void;
}

export const CloneTabHeader: React.FC<CloneTabHeaderProps> = ({
  activeTab,
  setActiveTab,
  onClose,
}) => {
  return (
    <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between shrink-0">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('clone_archive')}
          className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'clone_archive' ? 'bg-primary text-white shadow-xs' : 'text-text-muted hover:text-text-main'
          }`}
        >
          Clone & Archive
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('selective')}
          className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'selective' ? 'bg-primary text-white shadow-xs' : 'text-text-muted hover:text-text-main'
          }`}
        >
          Selective Download
        </button>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-hover text-text-muted hover:text-text-main cursor-pointer"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
