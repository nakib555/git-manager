import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { useActionWorkflow } from '../common/actionWorkflow/useActionWorkflow';
import { ActionVerificationTracker } from '../common/actionWorkflow/ActionVerificationTracker';
import { WorkflowStep } from '../common/actionWorkflow/types';

interface BranchFormProps {
  onExecute?: (data: any) => Promise<any> | void;
  onSubmit?: (data: any) => void;
  onClose?: () => void;
}

const BRANCH_STEPS: WorkflowStep[] = [
  { id: 'val', label: 'Validating Git ref name', sublabel: 'Checking git branch naming conventions' },
  { id: 'fork', label: 'Forking branch pointer', sublabel: 'Creating ref from current HEAD commit' },
  { id: 'ver', label: 'Verifying repository tree', sublabel: 'Switching active branch context' },
];

export const BranchForm: React.FC<BranchFormProps> = ({ onExecute, onSubmit, onClose }) => {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const workflow = useActionWorkflow({
    steps: BRANCH_STEPS,
    autoCloseDelay: 2000,
    onClose,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim().replace(/\s+/g, '-');
    if (!cleanName) return;

    const payload = { name: cleanName, desc };

    if (onExecute) {
      workflow.execute(async () => {
        const result = await onExecute(payload);
        return {
          title: cleanName,
          subtitle: desc || 'Branch created and ready for new commits.',
          metaItems: [
            { label: 'Ref', value: `refs/heads/${cleanName}` },
            { label: 'Branch', value: result?.name || cleanName },
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
        className="w-full bg-info text-white font-semibold text-sm py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2 cursor-pointer btn-tactile"
      >
        <Check size={16} strokeWidth={3} /> Create Branch
      </button>
    </form>
  );
};
