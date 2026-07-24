import React, { useState } from 'react';
import { useAppContext } from '../AppContext';
import { X, Folder, GitBranch, GitPullRequest, GitCommit, Check } from 'lucide-react';

export const CreateModals: React.FC = () => {
  const { activeModal, closeModal, createLocalRepo, createLocalBranch, createLocalPR, createLocalCommit } = useAppContext();

  if (!activeModal) return null;

  return (
    <>
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[200] transition-opacity duration-300 opacity-100"
        onClick={closeModal}
      />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[400px] bg-card rounded-2xl border border-border z-[201] p-6 shadow-2xl animate-fade-up">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2.5 font-semibold text-text-main text-base">
            {activeModal === 'repo' && (
              <>
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Folder size={18} />
                </div>
                <span>Create Repository</span>
              </>
            )}
            {activeModal === 'branch' && (
              <>
                <div className="w-8 h-8 rounded-lg bg-info/10 text-info flex items-center justify-center">
                  <GitBranch size={18} />
                </div>
                <span>Create Branch</span>
              </>
            )}
            {activeModal === 'pr' && (
              <>
                <div className="w-8 h-8 rounded-lg bg-success/10 text-success flex items-center justify-center">
                  <GitPullRequest size={18} />
                </div>
                <span>New Pull Request</span>
              </>
            )}
            {activeModal === 'commit' && (
              <>
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <GitCommit size={18} />
                </div>
                <span>Commit Changes</span>
              </>
            )}
          </div>
          <button 
            onClick={closeModal}
            className="text-text-muted hover:text-text-main p-1 rounded-full bg-hover transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {activeModal === 'repo' && <RepoForm onSubmit={(data) => { createLocalRepo(data); closeModal(); }} />}
        {activeModal === 'branch' && <BranchForm onSubmit={(data) => { createLocalBranch(data); closeModal(); }} />}
        {activeModal === 'pr' && <PRForm onSubmit={(data) => { createLocalPR(data); closeModal(); }} />}
        {activeModal === 'commit' && <CommitForm onSubmit={(data) => { createLocalCommit(data); closeModal(); }} />}
      </div>
    </>
  );
};

const RepoForm: React.FC<{ onSubmit: (data: any) => void }> = ({ onSubmit }) => {
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
        <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">Repository Name</label>
        <input 
          type="text" 
          placeholder="e.g. awesome-react-app" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full bg-main border border-border rounded-xl px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-primary transition-colors placeholder:text-text-muted/60"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">Description</label>
        <textarea 
          placeholder="A brief description about your project..." 
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={2}
          className="w-full bg-main border border-border rounded-xl px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-primary transition-colors placeholder:text-text-muted/60 resize-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">Primary Language</label>
          <select 
            value={lang} 
            onChange={(e) => setLang(e.target.value)}
            className="w-full bg-main border border-border rounded-xl px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-primary transition-colors"
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
          <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">Visibility</label>
          <div className="flex gap-2">
            <button 
              type="button" 
              onClick={() => setIsPrivate(false)} 
              className={`flex-1 py-2.5 text-xs font-semibold rounded-xl border transition-all ${!isPrivate ? 'bg-primary/10 text-primary border-primary/40' : 'bg-main border-border text-text-muted'}`}
            >
              Public
            </button>
            <button 
              type="button" 
              onClick={() => setIsPrivate(true)} 
              className={`flex-1 py-2.5 text-xs font-semibold rounded-xl border transition-all ${isPrivate ? 'bg-primary/10 text-primary border-primary/40' : 'bg-main border-border text-text-muted'}`}
            >
              Private
            </button>
          </div>
        </div>
      </div>
      <button 
        type="submit" 
        disabled={!name.trim()}
        className="w-full bg-primary hover:bg-primary-hover text-white font-semibold text-sm py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
      >
        <Check size={16} strokeWidth={3} /> Create Repository
      </button>
    </form>
  );
};

const BranchForm: React.FC<{ onSubmit: (data: any) => void }> = ({ onSubmit }) => {
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

const PRForm: React.FC<{ onSubmit: (data: any) => void }> = ({ onSubmit }) => {
  const { activeBranches } = useAppContext();
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [source, setSource] = useState(activeBranches[1]?.name || 'develop');
  const [target, setTarget] = useState(activeBranches[0]?.name || 'main');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title: title.trim(), desc, source, target });
  };

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
      <button 
        type="submit" 
        disabled={!title.trim()}
        className="w-full bg-success text-white font-semibold text-sm py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
      >
        <Check size={16} strokeWidth={3} /> Open Pull Request
      </button>
    </form>
  );
};

const CommitForm: React.FC<{ onSubmit: (data: any) => void }> = ({ onSubmit }) => {
  const [msg, setMsg] = useState('');
  const [author, setAuthor] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msg.trim()) return;
    onSubmit({ msg: msg.trim(), author: author.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">Commit Message</label>
        <input 
          type="text" 
          placeholder="e.g. feat: integrate UI feedback loop" 
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          required
          className="w-full bg-main border border-border rounded-xl px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-primary transition-colors placeholder:text-text-muted/60"
        />
      </div>
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
      <button 
        type="submit" 
        disabled={!msg.trim()}
        className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold text-sm py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
      >
        <Check size={16} strokeWidth={3} /> Commit to branch
      </button>
    </form>
  );
};
