import React, { useState } from 'react';
import { Check, ShieldAlert } from 'lucide-react';
import { useAppContext } from '../../AppContext';
import { useActionWorkflow } from '../common/actionWorkflow/useActionWorkflow';
import { ActionVerificationTracker } from '../common/actionWorkflow/ActionVerificationTracker';
import { WorkflowStep } from '../common/actionWorkflow/types';

interface PRFormProps {
  onExecute?: (data: any) => Promise<any> | void;
  onSubmit?: (data: any) => void;
  onClose?: () => void;
}

const PR_STEPS: WorkflowStep[] = [
  { id: 'diff', label: 'Comparing branch commit trees', sublabel: 'Verifying mergeability and diff objects' },
  { id: 'pr', label: 'Opening pull request', sublabel: 'Creating review thread and assigning number' },
  { id: 'ver', label: 'Verifying PR catalog', sublabel: 'Indexing pull request in workspace' },
];

export const PRForm: React.FC<PRFormProps> = ({ onExecute, onSubmit, onClose }) => {
  const { activeBranches } = useAppContext();
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [isDraft, setIsDraft] = useState(false);
  
  const defaultSource = activeBranches.length > 1 ? activeBranches[1].name : (activeBranches[0]?.name || 'develop');
  const defaultTarget = activeBranches[0]?.name || 'main';

  const [source, setSource] = useState(defaultSource);
  const [target, setTarget] = useState(defaultTarget);

  const workflow = useActionWorkflow({
    steps: PR_STEPS,
    autoCloseDelay: 2000,
    onClose,
  });

  const isIdentical = source === target;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isIdentical) return;

    const payload = { title: title.trim(), desc, source, target, isDraft };

    if (onExecute) {
      workflow.execute(async () => {
        const result = await onExecute(payload);
        const prNumber = result?.number || Math.floor(Math.random() * 40 + 10);
        return {
          title: `#${prNumber} · ${title.trim()}`,
          subtitle: `Pull request successfully created from ${source} into ${target}.`,
          metaItems: [
            { label: 'Compare', value: `${source} → ${target}` },
            { label: 'Status', value: isDraft ? 'Draft' : 'Open' },
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
          <label className="block text-xs font-semibold text-text-main">Pull Request Title</label>
          <span className="text-[10px] text-text-muted">Required</span>
        </div>
        <input 
          type="text" 
          placeholder="e.g. feat: add repository activity dashboard" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full bg-main border border-border rounded-xl px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-primary transition-colors placeholder:text-text-muted/60"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="block text-xs font-semibold text-text-main">Overview & Context</label>
          <span className="text-[10px] text-text-muted">Optional</span>
        </div>
        <textarea 
          placeholder="Describe what these changes do..." 
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={2}
          className="w-full bg-main border border-border rounded-xl px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-primary transition-colors placeholder:text-text-muted/60 resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-text-main mb-1.5">Compare (Source)</label>
          <select 
            value={source} 
            onChange={(e) => setSource(e.target.value)}
            className="w-full bg-main border border-border rounded-xl px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-primary transition-colors"
          >
            {activeBranches.map(b => (
              <option key={b.name} value={b.name}>{b.name}</option>
            ))}
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
          <span>Source and target branches cannot be identical.</span>
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
