import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../AppContext';
import { X, Folder, GitBranch, GitPullRequest, GitCommit, Check, Key, ExternalLink, ShieldAlert } from 'lucide-react';

export const CreateModals: React.FC = () => {
  const { activeModal, closeModal, createLocalRepo, createLocalBranch, createLocalPR, createLocalCommit } = useAppContext();

  

  return (
    <AnimatePresence>
      {activeModal && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
        >
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="relative w-full max-w-[420px] max-h-[90vh] overflow-y-auto bg-card rounded-2xl border border-border p-6 shadow-2xl"
          >
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
            {activeModal === 'oauth_setup' && (
              <>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Key size={18} />
                </div>
                <span>Connect GitHub</span>
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
        {activeModal === 'oauth_setup' && <OAuthSetupForm />}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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
  const [isDraft, setIsDraft] = useState(false);
  
  // Smart branch defaulting: use separate branches if at least 2 are available
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

const CommitForm: React.FC<{ onSubmit: (data: any) => void }> = ({ onSubmit }) => {
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
        className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold text-sm py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
      >
        <Check size={16} strokeWidth={3} /> {isRealGitHub ? 'Push Real Commit to GitHub' : 'Commit to branch'}
      </button>
    </form>
  );
};

const OAuthSetupForm: React.FC = () => {
  const { setManualToken, closeModal } = useAppContext();
  const [token, setToken] = useState('');
  const [tab, setTab] = useState<'pat' | 'oauth'>('pat');

  const handlePatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    setManualToken(token.trim());
    closeModal();
  };

  return (
    
      
    <div className="space-y-4">
      {/* Navigation tabs */}
      <div className="flex border-b border-border text-xs font-semibold">
        <button
          type="button"
          onClick={() => setTab('pat')}
          className={`pb-2.5 px-3 border-b-2 transition-colors ${
            tab === 'pat'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          1-Click Access Token (Recommended)
        </button>
        <button
          type="button"
          onClick={() => setTab('oauth')}
          className={`pb-2.5 px-3 border-b-2 transition-colors ${
            tab === 'oauth'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          OAuth Setup Guide
        </button>
      </div>

      {tab === 'pat' ? (
        <form onSubmit={handlePatSubmit} className="space-y-3.5">
          <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 text-xs text-text-main leading-relaxed">
            <p className="font-semibold text-primary mb-1">Fastest Way to Connect</p>
            You can connect your GitHub account in 10 seconds using a Personal Access Token (PAT).
          </div>

          <div>
            <a 
              href="https://github.com/settings/tokens/new?scopes=repo,user,read:org&description=Git%20Manager%20App"
              target="_blank"
              rel="noreferrer"
              className="w-full bg-hover border border-border hover:border-primary/50 text-text-main font-semibold text-xs py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 text-center"
            >
              <span>Generate New Token on GitHub</span>
              <ExternalLink size={14} className="text-primary" />
            </a>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">
              Paste GitHub Token
            </label>
            <input 
              type="password" 
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" 
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
              className="w-full bg-main border border-border rounded-xl px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-primary transition-colors placeholder:text-text-muted/60"
            />
          </div>

          <button 
            type="submit" 
            disabled={!token.trim()}
            className="w-full bg-primary hover:bg-primary-hover text-white font-semibold text-sm py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            <Check size={16} strokeWidth={3} /> Connect GitHub Account
          </button>
        </form>
      ) : (
        <div className="space-y-3 text-xs text-text-main">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 flex gap-2">
            <ShieldAlert size={18} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">OAuth Secrets Missing</p>
              <p className="text-[11px] opacity-90 mt-0.5">
                GitHub OAuth flow requires <code className="bg-amber-500/20 px-1 py-0.5 rounded font-mono">GITHUB_CLIENT_ID</code> and <code className="bg-amber-500/20 px-1 py-0.5 rounded font-mono">GITHUB_CLIENT_SECRET</code> to be configured on your server/worker.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-text-main">For Cloudflare Workers:</p>
            <div className="bg-main border border-border p-2.5 rounded-xl font-mono text-[11px] text-primary space-y-1 overflow-x-auto">
              <p>npx wrangler secret put GITHUB_CLIENT_ID</p>
              <p>npx wrangler secret put GITHUB_CLIENT_SECRET</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-text-main">For Local Development / Cloud Run:</p>
            <p className="text-text-muted">
              Add <code className="text-text-main font-mono bg-hover px-1 rounded">GITHUB_CLIENT_ID</code> and <code className="text-text-main font-mono bg-hover px-1 rounded">GITHUB_CLIENT_SECRET</code> to your <code className="text-text-main font-mono bg-hover px-1 rounded">.env</code> file.
            </p>
          </div>

          <button 
            type="button" 
            onClick={() => setTab('pat')}
            className="w-full bg-hover hover:bg-border text-text-main font-semibold text-xs py-2.5 rounded-xl transition-all mt-2"
          >
            Use Personal Access Token Instead
          </button>
        </div>
      )}
    </div>
  );
};
