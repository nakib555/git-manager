import React, { useState } from 'react';
import { Check, ShieldAlert } from 'lucide-react';
import { useAppContext } from '../../AppContext';

export const PRForm: React.FC<{ onSubmit: (data: any) => void }> = ({ onSubmit }) => {
  const { activeBranches } = useAppContext();
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [isDraft, setIsDraft] = useState(false);
  
  const defaultSource = activeBranches.length > 1 ? activeBranches[1].name : (activeBranches[0]?.name || 'develop');
  const defaultTarget = activeBranches[0]?.name || 'main';

  const [source, setSource] = useState(defaultSource);
  const [target, setTarget] = useState(defaultTarget);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || source === target) return;
    onSubmit({ title: title.trim(), desc, source, target, isDraft });
  };

  const isIdentical = source === target;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">Title</label>
        <input 
          type="text" 
          placeholder="e.g. Add dashboard search bar" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full bg-main border border-border rounded-xl px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-primary transition-colors placeholder:text-text-muted/60"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">Description</label>
        <textarea 
          placeholder="Describe your pull request..." 
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={2}
          className="w-full bg-main border border-border rounded-xl px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-primary transition-colors placeholder:text-text-muted/60 resize-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">Compare (Source)</label>
          <select 
            value={source} 
            onChange={(e) => setSource(e.target.value)}
            className="w-full bg-main border border-border rounded-xl px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-primary transition-colors"
          >
            {activeBranches.map(b => (
              <option key={b.name} value={b.name}>{b.name}</option>
            ))}
            {activeBranches.length === 0 && (
              <option value="develop">develop</option>
            )}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">Base (Target)</label>
          <select 
            value={target} 
            onChange={(e) => setTarget(e.target.value)}
            className="w-full bg-main border border-border rounded-xl px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-primary transition-colors"
          >
            {activeBranches.map(b => (
              <option key={b.name} value={b.name}>{b.name}</option>
            ))}
            {activeBranches.length === 0 && (
              <option value="main">main</option>
            )}
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer mt-2">
        <input 
          type="checkbox" 
          checked={isDraft}
          onChange={(e) => setIsDraft(e.target.checked)}
          className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary"
        />
        <span className="text-xs font-semibold text-text-main">Create as Draft</span>
      </label>

      {isIdentical && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-xs flex items-center gap-2">
          <ShieldAlert size={14} className="shrink-0" />
          <span>The source (compare) and target (base) branches cannot be identical.</span>
        </div>
      )}

      <button 
        type="submit" 
        disabled={!title.trim() || isIdentical}
        className="w-full bg-success text-white font-semibold text-sm py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4 cursor-pointer"
      >
        <Check size={16} strokeWidth={3} /> {isDraft ? 'Open Draft PR' : 'Open Pull Request'}
      </button>
    </form>
  );
};
