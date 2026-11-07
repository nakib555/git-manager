import React, { useState } from 'react';
import { Check } from 'lucide-react';

export const RepoForm: React.FC<{ onSubmit: (data: any) => void }> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [lang, setLang] = useState('TypeScript');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim().toLowerCase().replace(/\s+/g, '-'), desc, isPrivate, lang });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="block text-xs font-semibold text-text-main">Repository Name</label>
          <span className="text-[10px] text-text-muted">Required</span>
        </div>
        <input 
          type="text" 
          placeholder="e.g. awesome-react-app" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full h-10 bg-main border border-border rounded-xl px-4 text-sm text-text-main outline-none focus:border-primary transition-colors placeholder:text-text-muted/60"
        />
        <p className="text-[10px] text-text-muted mt-1">Use lowercase letters, numbers, and hyphens.</p>
      </div>
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="block text-xs font-semibold text-text-main">Description</label>
          <span className="text-[10px] text-text-muted">Optional</span>
        </div>
        <textarea 
          placeholder="A brief summary of what your repository does..." 
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={2}
          className="w-full bg-main border border-border rounded-xl p-3 text-sm text-text-main outline-none focus:border-primary transition-colors placeholder:text-text-muted/60 resize-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-text-muted mb-2 uppercase tracking-wider">Primary Language</label>
          <select 
            value={lang} 
            onChange={(e) => setLang(e.target.value)}
            className="w-full h-10 bg-main border border-border rounded-xl px-3 text-sm text-text-main outline-none focus:border-primary transition-colors"
          >
            <option value="TypeScript">TypeScript</option>
            <option value="JavaScript">JavaScript</option>
            <option value="Python">Python</option>
            <option value="Rust">Rust</option>
            <option value="Swift">Swift</option>
            <option value="Go">Go</option>
            <option value="HTML">HTML</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-muted mb-2 uppercase tracking-wider">Visibility</label>
          <div className="flex gap-2">
            <button 
              type="button" 
              onClick={() => setIsPrivate(false)} 
              className={`flex-1 h-10 text-xs font-semibold rounded-xl border transition-all ${!isPrivate ? 'bg-primary/10 text-primary border-primary/40' : 'bg-main border-border text-text-muted'}`}
            >
              Public
            </button>
            <button 
              type="button" 
              onClick={() => setIsPrivate(true)} 
              className={`flex-1 h-10 text-xs font-semibold rounded-xl border transition-all ${isPrivate ? 'bg-primary/10 text-primary border-primary/40' : 'bg-main border-border text-text-muted'}`}
            >
              Private
            </button>
          </div>
        </div>
      </div>
      <button 
        type="submit" 
        disabled={!name.trim()}
        className="w-full h-12 bg-primary hover:bg-primary-hover text-white font-semibold text-sm rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4 cursor-pointer"
      >
        <Check size={16} strokeWidth={3} /> Create Repository
      </button>
    </form>
  );
};
