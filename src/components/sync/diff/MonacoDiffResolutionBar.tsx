import React from 'react';
import { Check } from 'lucide-react';
import { DiffFileItem } from '../../../mobile/utils/zipSyncEngine';

interface MonacoDiffResolutionBarProps {
  file: DiffFileItem;
  resolution?: 'take_zip' | 'keep_original' | 'delete' | 'restore';
  onResolve: (action: 'take_zip' | 'keep_original' | 'delete' | 'restore') => void;
}

export const MonacoDiffResolutionBar: React.FC<MonacoDiffResolutionBarProps> = ({
  file,
  resolution = 'take_zip',
  onResolve,
}) => {
  return (
    <div className="lg:hidden p-2.5 bg-[#252526] border-t border-[#2D2D2D] flex items-center justify-between gap-2 shrink-0">
      <div className="min-w-0 pr-1">
        <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">
          {file.status === 'modified' ? 'Conflict Resolution' : file.status === 'removed' ? 'Missing File Action' : 'New File Action'}
        </span>
        <span className="text-xs font-bold text-slate-200 truncate block">
          {resolution.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {file.status === 'modified' && (
          <>
            <button
              type="button"
              onClick={() => onResolve('take_zip')}
              className={`min-h-[42px] px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                resolution === 'take_zip' ? 'bg-[#0E639C] text-white shadow-xs' : 'bg-[#1E1E1E] text-slate-300 border border-[#3E3E42]'
              }`}
            >
              <Check size={13} />
              <span>Take ZIP</span>
            </button>
            <button
              type="button"
              onClick={() => onResolve('keep_original')}
              className={`min-h-[42px] px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                resolution === 'keep_original' ? 'bg-[#3E3E42] text-white shadow-xs' : 'bg-[#1E1E1E] text-slate-300 border border-[#3E3E42]'
              }`}
            >
              <span>Keep Repo</span>
            </button>
          </>
        )}

        {file.status === 'removed' && (
          <>
            <button
              type="button"
              onClick={() => onResolve('restore')}
              className={`min-h-[42px] px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                resolution === 'restore' ? 'bg-amber-600 text-white shadow-xs' : 'bg-[#1E1E1E] text-slate-300 border border-[#3E3E42]'
              }`}
            >
              <span>Restore</span>
            </button>
            <button
              type="button"
              onClick={() => onResolve('delete')}
              className={`min-h-[42px] px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                resolution === 'delete' ? 'bg-rose-600 text-white shadow-xs' : 'bg-[#1E1E1E] text-slate-300 border border-[#3E3E42]'
              }`}
            >
              <span>Delete</span>
            </button>
          </>
        )}

        {file.status === 'added' && (
          <>
            <button
              type="button"
              onClick={() => onResolve('take_zip')}
              className={`min-h-[42px] px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                resolution === 'take_zip' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-[#1E1E1E] text-slate-300 border border-[#3E3E42]'
              }`}
            >
              <Check size={13} />
              <span>Include</span>
            </button>
            <button
              type="button"
              onClick={() => onResolve('keep_original')}
              className={`min-h-[42px] px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                resolution === 'keep_original' ? 'bg-[#3E3E42] text-white shadow-xs' : 'bg-[#1E1E1E] text-slate-300 border border-[#3E3E42]'
              }`}
            >
              <span>Skip</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
