import React from 'react';
import { X } from 'lucide-react';

interface CloneTabHeaderProps {
  activeTab: 'clone' | 'archive' | 'selective';
  setActiveTab: (tab: 'clone' | 'archive' | 'selective') => void;
  onClose?: () => void;
}

export const CloneTabHeader: React.FC<CloneTabHeaderProps> = ({
  activeTab,
  setActiveTab,
  onClose,
}) => {
  return (
    <div className="p-5 border-b border-border flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('clone')}
          className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'clone' ? 'bg-primary text-white' : 'text-text-muted hover:text-text-main'
          }`}
        >
          Clone & Sync
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('archive')}
          className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'archive' ? 'bg-primary text-white' : 'text-text-muted hover:text-text-main'
          }`}
        >
          Export Archive
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('selective')}
          className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'selective' ? 'bg-primary text-white' : 'text-text-muted hover:text-text-main'
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
