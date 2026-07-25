import React, { useState } from 'react';
import { Check, X, Play, ChevronDown, ChevronUp, Terminal, Cpu, Clock, RefreshCw } from 'lucide-react';

export interface CiCdStep {
  name: string;
  status: 'success' | 'failed' | 'running' | 'pending';
  duration: string;
  log: string;
}

export interface CiCdState {
  status: 'success' | 'failed' | 'running';
  label: string;
  color: string;
  badgeBg: string;
  duration: string;
  steps: CiCdStep[];
}

export const getCiCdStatus = (hash: string): CiCdState => {
  if (!hash) {
    return {
      status: 'success',
      label: 'Passed',
      color: 'text-emerald-500 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/10',
      badgeBg: 'bg-emerald-500/10',
      duration: '1m 24s',
      steps: []
    };
  }
  
  const cleanHash = hash.replace(/[^0-9a-f]/gi, '') || 'abc';
  const sum = cleanHash.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Deterministic status selection: 70% success, 15% failed, 15% running
  const index = sum % 100;
  let status: 'success' | 'failed' | 'running' = 'success';
  if (index < 12) {
    status = 'failed';
  } else if (index < 24) {
    status = 'running';
  }

  const durationSec = 45 + (sum % 115);
  const durationStr = `${Math.floor(durationSec / 60)}m ${durationSec % 60}s`;

  if (status === 'success') {
    return {
      status: 'success',
      label: 'Passed',
      color: 'text-emerald-500 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-500/5',
      badgeBg: 'bg-emerald-500/10 dark:bg-emerald-500/5',
      duration: durationStr,
      steps: [
        { name: 'lint-and-format', status: 'success', duration: '12s', log: '✔ ESLint checks passed successfully\n✔ Prettier formatting verified\n✔ No unused imports or variables found' },
        { name: 'unit-tests', status: 'success', duration: '28s', log: '✔ Running Jest/Vitest suite...\n✔ test: "Commit List should render with proper styling" [PASS]\n✔ test: "DiffViewer displays syntactical highlighting" [PASS]\n✔ 42 tests passed, 0 failed' },
        { name: 'production-build', status: 'success', duration: '34s', log: '✔ Vite production build created\n✔ TSX bundling completed\n✔ Assets optimized (dist/ generated: 142.4 kB gzip)' },
        { name: 'cloud-deploy', status: 'success', duration: `${durationSec - 74}s`, log: '✔ Connecting to container ingress portal...\n✔ Deployed successfully to Cloud Run instance\n✔ Service URL: https://ais-pre-azzk4cifz4c5f6qxuplgpd-41816522833.asia-southeast1.run.app' }
      ]
    };
  } else if (status === 'running') {
    const activeStepIdx = sum % 3; // 0, 1, or 2
    return {
      status: 'running',
      label: 'Running',
      color: 'text-sky-500 dark:text-sky-400 border-sky-500/20 bg-sky-500/10 dark:bg-sky-500/5',
      badgeBg: 'bg-sky-500/10 dark:bg-sky-500/5',
      duration: 'Running...',
      steps: [
        { 
          name: 'lint-and-format', 
          status: activeStepIdx === 0 ? 'running' : 'success', 
          duration: activeStepIdx === 0 ? 'running...' : '12s', 
          log: activeStepIdx === 0 ? 'ℹ Running ESLint diagnostics...\n➡ Checking AppContext imports...' : '✔ ESLint checks passed' 
        },
        { 
          name: 'unit-tests', 
          status: activeStepIdx > 1 ? 'success' : (activeStepIdx === 1 ? 'running' : 'pending'), 
          duration: activeStepIdx === 1 ? 'running...' : (activeStepIdx > 1 ? '30s' : 'pending'), 
          log: activeStepIdx === 1 
            ? 'ℹ Spawning Vitest runtime...\n➡ Running unit-tests suite (12/42)...' 
            : (activeStepIdx > 1 ? '✔ All unit tests passed' : 'Waiting for preceding steps...') 
        },
        { 
          name: 'production-build', 
          status: activeStepIdx === 2 ? 'running' : 'pending', 
          duration: activeStepIdx === 2 ? 'running...' : 'pending', 
          log: activeStepIdx === 2 ? 'ℹ Running rollup bundle optimization...' : 'Waiting for preceding steps...' 
        },
        { name: 'cloud-deploy', status: 'pending', duration: 'pending', log: 'Waiting for build completion...' }
      ]
    };
  } else {
    const failStepIdx = sum % 3; // 0, 1, or 2
    return {
      status: 'failed',
      label: 'Failed',
      color: 'text-rose-500 dark:text-rose-400 border-rose-500/20 bg-rose-500/10 dark:bg-rose-500/5',
      badgeBg: 'bg-rose-500/10 dark:bg-rose-500/5',
      duration: `${failStepIdx * 25 + 15}s`,
      steps: [
        { 
          name: 'lint-and-format', 
          status: failStepIdx === 0 ? 'failed' : 'success', 
          duration: failStepIdx === 0 ? '8s' : '12s', 
          log: failStepIdx === 0 
            ? '❌ ESLint failed:\n  /src/App.tsx: 24:10  error  "theme" is defined but never used  @typescript-eslint/no-unused-vars\n\nnpm ERR! code ELIFECYCLE' 
            : '✔ ESLint checks passed' 
        },
        { 
          name: 'unit-tests', 
          status: failStepIdx === 1 ? 'failed' : (failStepIdx > 1 ? 'success' : 'pending'), 
          duration: failStepIdx === 1 ? '18s' : (failStepIdx > 1 ? '24s' : 'pending'), 
          log: failStepIdx === 1 
            ? '❌ 1 test failed:\n  ● Commit Inspector > should render diff file highlight\n  Expected "Passed" but received "Failed"\n\n  at /src/tests/CommitInspector.test.tsx:42:15' 
            : (failStepIdx > 1 ? '✔ All unit tests passed' : 'Pipeline stopped due to preceding failures') 
        },
        { 
          name: 'production-build', 
          status: failStepIdx === 2 ? 'failed' : 'pending', 
          duration: failStepIdx === 2 ? '30s' : 'pending', 
          log: failStepIdx === 2 
            ? '❌ Build error:\n  vite: not found\n  npm ERR! code ELIFECYCLE\n  npm ERR! errno 127' 
            : 'Pipeline stopped due to preceding failures' 
        },
        { name: 'cloud-deploy', status: 'pending', duration: 'pending', log: 'Pipeline stopped due to preceding failures' }
      ]
    };
  }
};

export const CiCdBadge = ({ hash, isCompact = false }: { hash: string; isCompact?: boolean }) => {
  const cicd = getCiCdStatus(hash);
  
  const getIcon = () => {
    switch (cicd.status) {
      case 'success':
        return <Check size={11} className="stroke-[3]" />;
      case 'failed':
        return <X size={11} className="stroke-[3]" />;
      case 'running':
        return <RefreshCw size={11} className="animate-spin stroke-[2.5]" />;
    }
  };

  if (isCompact) {
    return (
      <div className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded border ${cicd.color} transition-all select-none`}>
        {getIcon()}
        <span>{cicd.label}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-lg border ${cicd.color} shadow-sm select-none`}>
        {getIcon()}
        <span className="uppercase tracking-wider text-[8px] font-extrabold text-text-muted/70">CI/CD</span>
        <span className="font-semibold">{cicd.label}</span>
      </div>
      <span className="text-text-muted/40">•</span>
      <span className="text-[10px] text-text-muted font-mono flex items-center gap-1"><Clock size={11} /> {cicd.duration}</span>
    </div>
  );
};

export const CiCdPipelineFlow = ({ hash }: { hash: string }) => {
  const cicd = getCiCdStatus(hash);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const getStepIcon = (status: CiCdStep['status']) => {
    switch (status) {
      case 'success':
        return <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center shrink-0"><Check size={10} className="stroke-[3]" /></div>;
      case 'failed':
        return <div className="w-5 h-5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-500 flex items-center justify-center shrink-0"><X size={10} className="stroke-[3]" /></div>;
      case 'running':
        return <div className="w-5 h-5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-500 flex items-center justify-center shrink-0"><RefreshCw size={10} className="animate-spin stroke-[2.5]" /></div>;
      case 'pending':
        return <div className="w-5 h-5 rounded-full bg-hover/40 border border-border text-text-muted flex items-center justify-center shrink-0"><Clock size={10} /></div>;
    }
  };

  return (
    <div className="bg-main/30 border border-border rounded-xl p-4.5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu size={14} className="text-primary" />
          <span className="text-[11px] font-bold text-text-main tracking-wider uppercase">CI/CD PIPELINE STATUS</span>
        </div>
        <CiCdBadge hash={hash} isCompact={true} />
      </div>

      <div className="relative pl-1.5 space-y-3.5">
        {/* Continuous track line */}
        <div className="absolute top-2.5 bottom-2.5 left-[15px] w-[1px] bg-border/80 z-0"></div>

        {cicd.steps.map((step, idx) => {
          const isExpanded = expandedStep === idx;
          return (
            <div key={step.name} className="relative z-10 space-y-2">
              <div 
                onClick={() => setExpandedStep(isExpanded ? null : idx)}
                className="flex items-center justify-between cursor-pointer hover:bg-hover/10 p-1.5 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getStepIcon(step.status)}
                  <div>
                    <span className="text-xs font-semibold text-text-main font-mono">{step.name}</span>
                    <span className="text-[9px] text-text-muted ml-2 font-mono">{step.duration}</span>
                  </div>
                </div>
                {isExpanded ? <ChevronUp size={14} className="text-text-muted" /> : <ChevronDown size={14} className="text-text-muted" />}
              </div>

              {isExpanded && (
                <div className="pl-8 pr-2">
                  <div className="bg-card border border-border/70 rounded-lg p-3 font-mono text-[10px] text-text-main/90 overflow-x-auto select-text whitespace-pre-wrap flex gap-2 items-start leading-relaxed shadow-inner">
                    <Terminal size={12} className="text-text-muted/70 shrink-0 mt-0.5" />
                    <code className="block flex-1">{step.log}</code>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
