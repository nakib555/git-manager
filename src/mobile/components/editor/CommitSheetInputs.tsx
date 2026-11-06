import React from 'react';
import { Check, AlertCircle, Loader2 } from 'lucide-react';

interface CommitSheetInputsProps {
  filePath: string;
  commitSummary: string;
  commitDescription: string;
  errorMsg: string | null;
  isStaged: boolean;
  isSubmitting: boolean;
  onSummaryChange: (val: string) => void;
  onDescriptionChange: (val: string) => void;
}

export const CommitSheetInputs: React.FC<CommitSheetInputsProps> = ({
  filePath,
  commitSummary,
  commitDescription,
  errorMsg,
  isStaged,
  isSubmitting,
  onSummaryChange,
  onDescriptionChange,
}) => {
  const summaryTrimmed = commitSummary.trim();
  const isOverLength = summaryTrimmed.length > 72;
  const isFormValid = summaryTrimmed.length > 0 && isStaged && !isSubmitting;

  return (
    <>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <label htmlFor="commit-summary" className="font-semibold text-text-primary">
            Commit message <span className="text-rose-500">*</span>
          </label>
          <span className={`font-mono text-[11px] tabular-nums ${isOverLength ? 'text-amber-500 font-semibold' : 'text-text-tertiary'}`}>
            {summaryTrimmed.length}/72
          </span>
        </div>
        <input
          id="commit-summary"
          type="text"
          required
          autoFocus
          value={commitSummary}
          onChange={(e) => onSummaryChange(e.target.value)}
          placeholder={`Update ${filePath.split('/').pop() || 'file'}`}
          className="w-full h-12 px-3.5 bg-surface-2 border border-border rounded-xl text-xs font-sans text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent focus:ring-1 focus:ring-accent transition"
        />
        {isOverLength && (
          <p className="text-[11px] text-amber-500 flex items-center gap-1">
            <AlertCircle size={12} />
            <span>GitHub recommends keeping commit summaries under 72 characters.</span>
          </p>
        )}
        {errorMsg && (
          <p className="text-[11px] text-rose-500 flex items-center gap-1">
            <AlertCircle size={12} />
            <span>{errorMsg}</span>
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <label htmlFor="commit-description" className="font-semibold text-text-secondary">
            Extended description <span className="text-text-tertiary font-normal">(optional)</span>
          </label>
        </div>
        <textarea
          id="commit-description"
          rows={3}
          value={commitDescription}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Add optional extended description explaining what changed and why..."
          className="w-full p-3 bg-surface-2 border border-border rounded-xl text-xs font-sans text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent focus:ring-1 focus:ring-accent transition resize-none leading-relaxed"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={!isFormValid}
          className="w-full h-12 bg-accent hover:opacity-95 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Committing changes...</span>
            </>
          ) : !isStaged ? (
            <>
              <AlertCircle size={16} />
              <span>Stage file to commit</span>
            </>
          ) : (
            <>
              <Check size={16} />
              <span>Commit changes</span>
            </>
          )}
        </button>
      </div>
    </>
  );
};
