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
        <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">Branch Name</label>
        <input 
          type="text" 
          placeholder="e.g. feature/add-login" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full bg-main border border-border rounded-xl px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-primary transition-colors placeholder:text-text-muted/60"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">Purpose</label>
        <input 
          type="text" 
          placeholder="e.g. Active development for OAuth" 
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
