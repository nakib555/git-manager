import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { useAppContext } from '../../AppContext';

export const CommitForm: React.FC<{ onSubmit: (data: any) => void }> = ({ onSubmit }) => {
  const { githubToken, currentRepoOwner } = useAppContext();
  const [msg, setMsg] = useState('');
  const [author, setAuthor] = useState('');
  const [filePath, setFilePath] = useState('README.md');
  const [fileContent, setFileContent] = useState('');

  const isRealGitHub = githubToken && currentRepoOwner;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msg.trim()) return;
    onSubmit({ 
      msg: msg.trim(), 
      author: author.trim(),
      filePath: isRealGitHub ? filePath : undefined,
      fileContent: isRealGitHub ? fileContent : undefined
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="block text-xs font-semibold text-text-main">Commit Message Summary</label>
          <span className="text-[10px] text-text-muted">Required</span>
        </div>
        <input 
          type="text" 
          placeholder="e.g. feat: implement activity feed search" 
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          required
          className="w-full bg-main border border-border rounded-xl px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-primary transition-colors placeholder:text-text-muted/60"
        />
        <p className="text-[10px] text-text-muted mt-1">Short summary in imperative tense (e.g. <code className="font-mono text-accent">fix:</code>, <code className="font-mono text-accent">feat:</code>, or <code className="font-mono text-accent">refactor:</code>).</p>
      </div>

      {isRealGitHub && (
        <div className="p-3 bg-primary/5 border border-primary/10 rounded-xl space-y-3">
          <span className="block text-[11px] font-bold text-primary uppercase tracking-wider">GitHub Real-Commit Staging</span>
          <div>
            <label className="block text-[10px] font-semibold text-text-muted mb-1 uppercase">Target File Path</label>
            <input 
              type="text" 
              placeholder="e.g. README.md or activity.log" 
              value={filePath}
              onChange={(e) => setFilePath(e.target.value)}
              required
              className="w-full bg-main border border-border rounded-lg px-2.5 py-1.5 text-xs text-text-main outline-none focus:border-primary transition-colors font-mono"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-text-muted mb-1 uppercase">File Contents</label>
            <textarea 
              placeholder="Type the contents you want to commit to GitHub..." 
              value={fileContent}
              onChange={(e) => setFileContent(e.target.value)}
              rows={3}
              className="w-full bg-main border border-border rounded-lg px-2.5 py-1.5 text-xs text-text-main outline-none focus:border-primary transition-colors resize-none font-mono"
            />
          </div>
        </div>
      )}

      {!isRealGitHub && (
        <div>
          <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">Author (Optional)</label>
          <input 
            type="text" 
            placeholder="e.g. Tanvir Ahmed" 
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full bg-main border border-border rounded-xl px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-primary transition-colors placeholder:text-text-muted/60"
          />
        </div>
      )}

      <button 
        type="submit" 
        disabled={!msg.trim()}
        className="w-full bg-accent hover:opacity-90 text-white font-medium text-xs py-2.5 rounded-lg border border-accent/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2 cursor-pointer"
      >
        <Check size={16} strokeWidth={3} /> {isRealGitHub ? 'Push Real Commit to GitHub' : 'Commit to branch'}
      </button>
    </form>
  );
};
