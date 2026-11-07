import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { useActionWorkflow } from '../common/actionWorkflow/useActionWorkflow';
import { ActionVerificationTracker } from '../common/actionWorkflow/ActionVerificationTracker';
import { WorkflowStep } from '../common/actionWorkflow/types';

interface RepoFormProps {
  onExecute?: (data: any) => Promise<any> | void;
  onSubmit?: (data: any) => void;
  onClose?: () => void;
}

const REPO_STEPS: WorkflowStep[] = [
  { id: 'val', label: 'Validating repository name & config', sublabel: 'Checking naming syntax & visibility' },
  { id: 'init', label: 'Initializing Git repository', sublabel: 'Creating main branch and initial tree' },
  { id: 'ver', label: 'Verifying catalog index', sublabel: 'Synchronizing active workspace records' },
];

export const RepoForm: React.FC<RepoFormProps> = ({ onExecute, onSubmit, onClose }) => {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [lang, setLang] = useState('TypeScript');

  const workflow = useActionWorkflow({
    steps: REPO_STEPS,
    autoCloseDelay: 2000,
    onClose,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim().toLowerCase().replace(/\s+/g, '-');
    if (!cleanName) return;

    const payload = { name: cleanName, desc, isPrivate, lang };

    if (onExecute) {
      workflow.execute(async () => {
        await onExecute(payload);
        return {
          title: cleanName,
          subtitle: desc || 'Repository created with initialized main branch.',
          metaItems: [
            { label: 'Language', value: lang },
            { label: 'Visibility', value: isPrivate ? 'Private' : 'Public' },
            { label: 'Branch', value: 'main' },
          ],
        };
      });
    } else if (onSubmit) {
      onSubmit(payload);
    }
  };

  if (workflow.phase !== 'idle') {
    return (
      <ActionVerificationTracker
        phase={workflow.phase}
        steps={workflow.steps}
        activeStepIndex={workflow.activeStepIndex}
        resultSummary={workflow.resultSummary}
        errorMsg={workflow.errorMsg}
        countdownRemaining={workflow.countdownRemaining}
        onDismissNow={workflow.dismissNow}
        onBackToEdit={workflow.reset}
        onRetry={() => handleSubmit({ preventDefault: () => {} } as any)}
      />
    );
  }

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
          <label className="block text-xs font-semibold text-text-muted mb-2 uppercase tracking-wider">Language</label>
          <select value={lang} onChange={(e) => setLang(e.target.value)} className="w-full h-10 bg-main border border-border rounded-xl px-3 text-sm text-text-main outline-none focus:border-primary transition-colors">
            {['TypeScript', 'JavaScript', 'Python', 'Rust', 'Swift', 'Go', 'HTML'].map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-muted mb-2 uppercase tracking-wider">Visibility</label>
          <div className="flex gap-2">
            <button type="button" onClick={() => setIsPrivate(false)} className={`flex-1 h-10 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${!isPrivate ? 'bg-primary/10 text-primary border-primary/40' : 'bg-main border-border text-text-muted'}`}>Public</button>
            <button type="button" onClick={() => setIsPrivate(true)} className={`flex-1 h-10 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${isPrivate ? 'bg-primary/10 text-primary border-primary/40' : 'bg-main border-border text-text-muted'}`}>Private</button>
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
