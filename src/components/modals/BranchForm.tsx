import React, { useState } from 'react';
import { Check } from 'lucide-react';

export const BranchForm: React.FC<{ onSubmit: (data: any) => void }> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim().replace(/\s+/g, '-'), desc });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="block text-xs font-semibold text-text-main">Branch Name</label>
          <span className="text-[10px] text-text-muted">Required</span>
        </div>
        <input 
          type="text" 
          placeholder="e.g. feature/add-login" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full bg-main border border-border rounded-xl px-3.5 py-2.5 text-sm text-text-main font-mono outline-none focus:border-primary transition-colors placeholder:text-text-muted/60"
        />
        <p className="text-[10px] text-text-muted mt-1">Recommended: prefix with <code className="font-mono text-info">feature/</code>, <code className="font-mono text-info">bugfix/</code>, or <code className="font-mono text-info">hotfix/</code>.</p>
      </div>
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="block text-xs font-semibold text-text-main">Description / Purpose</label>
          <span className="text-[10px] text-text-muted">Optional</span>
        </div>
        <input 
          type="text" 
          placeholder="e.g. Implement user login and session handling" 
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="w-full bg-main border border-border rounded-xl px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-primary transition-colors placeholder:text-text-muted/60"
        />
      </div>
      <button 
        type="submit" 
        disabled={!name.trim()}
        className="w-full bg-info text-white font-semibold text-sm py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
      >
        <Check size={16} strokeWidth={3} /> Create Branch
      </button>
    </form>
  );
};
