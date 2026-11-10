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
          className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all btn-tactile cursor-pointer ${
            activeTab === 'clone_archive' ? 'bg-primary text-white shadow-xs' : 'text-text-muted hover:text-text-main hover:bg-hover'
          }`}
        >
          Clone & Archive
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('selective')}
          className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all btn-tactile cursor-pointer ${
            activeTab === 'selective' ? 'bg-primary text-white shadow-xs' : 'text-text-muted hover:text-text-main hover:bg-hover'
          }`}
        >
          Selective Download
        </button>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="touch-target-44 rounded-xl hover:bg-hover text-text-muted hover:text-text-main btn-tactile cursor-pointer"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
