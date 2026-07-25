import React, { useState, useEffect } from 'react';
import { 
  Check, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Cpu, 
  Clock, 
  RefreshCw, 
  ShieldCheck, 
  FileCode, 
  Gauge, 
  ExternalLink, 
  Server, 
  AlertCircle,
  Terminal,
  Play
} from 'lucide-react';

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

type Listener = () => void;
class CiCdLiveStore {
  private listeners = new Set<Listener>();
  private states: Record<string, CiCdState> = {};
  private timerIntervals: Record<string, any> = {};

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  getState(hash: string): CiCdState {
    if (!hash) return getCiCdStatus(hash);

    if (this.states[hash]) {
      return this.states[hash];
    }

    const base = getCiCdStatus(hash);
    if (base.status === 'running') {
      this.startSimulation(hash, base);
    } else {
      this.states[hash] = base;
    }

    return this.states[hash];
  }

  rerunPipeline(hash: string) {
    const base = getCiCdStatus(hash);
    const initialRunningState: CiCdState = {
      ...base,
      status: 'running',
      label: 'Running',
      color: 'text-sky-500 dark:text-sky-400 border-sky-500/20 bg-sky-500/10 dark:bg-sky-500/5',
      badgeBg: 'bg-sky-500/10 dark:bg-sky-500/5',
      duration: '0s',
      steps: base.steps.map(s => ({
        ...s,
        status: 'pending',
        duration: 'pending',
        log: 'Waiting to start...'
      }))
    };
    this.startSimulation(hash, initialRunningState);
  }

  private startSimulation(hash: string, baseState: CiCdState) {
    if (this.timerIntervals[hash]) {
      clearInterval(this.timerIntervals[hash]);
    }

    const state: CiCdState = JSON.parse(JSON.stringify(baseState));
    this.states[hash] = state;

    let seconds = 0;
    let currentStepIdx = 0;

    // Set first step to running
    if (state.steps.length > 0) {
      state.steps = state.steps.map((s, idx) => {
        if (idx === 0) {
          return {
            ...s,
            status: 'running',
            duration: 'running...',
            log: 'ℹ Initializing build runner...\n➡ Loading workspace assets and configurations...\n➡ Pre-checking compiler dependency resolution...'
          };
        }
        return {
          ...s,
          status: 'pending',
          duration: 'pending',
          log: 'Waiting for preceding steps...'
        };
      });
    }

    const stepLogs: Record<string, string[]> = {
      'lint-and-format': [
        '✔ ESLint configuration verified successfully.',
        'ℹ Auditing source files for layout & formatting constraints...',
        '✔ Prettier auto-formatting rules verified.',
        '✔ Production linter checks passed (0 errors, 0 warnings).'
      ],
      'unit-tests': [
        '✔ Initializing test environment hooks...',
        'ℹ Running Jest / Vitest spec suites (12 tests discovered)...',
        '✔ test: "Commit Inspector loads modal panels correctly" [PASS]',
        '✔ test: "DiffViewer code syntax highlight parser is valid" [PASS]',
        '✔ Vitest checks passed with absolutely 0 failed assertions.'
      ],
      'production-build': [
        '✔ Vite compiler pipeline initialization started.',
        'ℹ Compiling TypeScript application files to dist/ folder...',
        '✔ Bundle optimization complete: applet bundle generated securely.',
        '✔ Build assets cached: 145.2 kB verified successfully.'
      ],
      'cloud-deploy': [
        '✔ Creating secure production gateway connection...',
        'ℹ Authorizing artifact registry image push triggers...',
        '✔ Deploying to live server workspace successfully!',
        '✔ Production Environment URL: https://ais-pre-azzk4cifz4c5f6qxuplgpd-41816522833.asia-southeast1.run.app'
      ]
    };

    const intervalId = setInterval(() => {
      seconds++;
      state.duration = `${seconds}s`;

      const currentStep = state.steps[currentStepIdx];
      if (currentStep) {
        const logs = stepLogs[currentStep.name] || [];
        const logLinesToShow = Math.min(logs.length, Math.floor(seconds / 2) + 1);
        const activeLogs = logs.slice(0, logLinesToShow).join('\n');
        
        currentStep.log = `ℹ [Executing CI/CD Pipeline] Running timer: ${seconds}s...\n` + activeLogs;
        currentStep.duration = `${seconds % 8}s`;

        // Every 8 seconds progress to the next step
        if (seconds > 0 && seconds % 8 === 0) {
          currentStep.status = 'success';
          currentStep.duration = '8s';
          currentStep.log = `✔ [Finished] Step completed in 8s\n` + logs.join('\n');

          currentStepIdx++;
          if (currentStepIdx < state.steps.length) {
            const nextStep = state.steps[currentStepIdx];
            nextStep.status = 'running';
            nextStep.duration = 'running...';
            nextStep.log = `ℹ Spawning next process queue: ${nextStep.name}...`;
          } else {
            // All steps complete!
            state.status = 'success';
            state.label = 'Passed';
            state.color = 'text-emerald-500 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-500/5';
            state.badgeBg = 'bg-emerald-500/10 dark:bg-emerald-500/5';
            state.duration = `${seconds}s`;
            clearInterval(intervalId);
          }
        }
      } else {
        // Fallback safety if steps are empty
        state.status = 'success';
        state.label = 'Passed';
        state.color = 'text-emerald-500 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-500/5';
        state.badgeBg = 'bg-emerald-500/10 dark:bg-emerald-500/5';
        state.duration = `${seconds}s`;
        clearInterval(intervalId);
      }

      this.states[hash] = { ...state };
      this.notify();
    }, 1000);

    this.timerIntervals[hash] = intervalId;
  }
}

export const ciCdStore = new CiCdLiveStore();

export const useCiCdStatus = (hash: string) => {
  const [cicd, setCicd] = useState<CiCdState>(() => ciCdStore.getState(hash));

  useEffect(() => {
    // Immediate sync
    setCicd(ciCdStore.getState(hash));

    const unsubscribe = ciCdStore.subscribe(() => {
      setCicd(ciCdStore.getState(hash));
    });

    return unsubscribe;
  }, [hash]);

  return cicd;
};

export const CiCdBadge = ({ hash, isCompact = false }: { hash: string; isCompact?: boolean }) => {
  const cicd = useCiCdStatus(hash);
  
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
      <div className={`inline-flex items-center gap-1.5 text-[9px] font-bold px-2 py-0.5 rounded-full border ${cicd.color} transition-all select-none`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse shrink-0" />
        <span>{cicd.label}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`inline-flex items-center gap-2 text-[10px] font-bold px-3 py-1.5 rounded-xl border ${cicd.color} shadow-sm select-none`}>
        {getIcon()}
        <span className="uppercase tracking-wider text-[8px] font-extrabold opacity-60">CI/CD</span>
        <span className="font-semibold">{cicd.label}</span>
      </div>
      <span className="text-text-muted/40">•</span>
      <span className="text-[10px] text-text-muted font-semibold flex items-center gap-1">
        <Clock size={11} /> {cicd.duration}
      </span>
    </div>
  );
};

// UI line parsing helper to avoid terminal styling
const parseLogLine = (line: string) => {
  let cleanText = line.trim();
  let type: 'success' | 'error' | 'running' | 'info' | 'pending' | 'neutral' = 'neutral';

  if (cleanText.startsWith('✔')) {
    type = 'success';
    cleanText = cleanText.substring(1).trim();
  } else if (cleanText.startsWith('❌')) {
    type = 'error';
    cleanText = cleanText.substring(1).trim();
  } else if (cleanText.startsWith('ℹ')) {
    type = 'info';
    cleanText = cleanText.substring(1).trim();
  } else if (cleanText.startsWith('➡')) {
    type = 'running';
    cleanText = cleanText.substring(1).trim();
  } else if (cleanText.toLowerCase().includes('error') || cleanText.toLowerCase().includes('failed')) {
    type = 'error';
  } else if (cleanText.toLowerCase().includes('passed') || cleanText.toLowerCase().includes('success')) {
    type = 'success';
  } else if (cleanText.toLowerCase().includes('running') || cleanText.toLowerCase().includes('executing')) {
    type = 'running';
  } else if (cleanText.toLowerCase().includes('waiting')) {
    type = 'pending';
  }

  return { type, text: cleanText };
};

export const CiCdPipelineFlow = ({ hash }: { hash: string }) => {
  const cicd = useCiCdStatus(hash);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  // Deterministic values for custom widgets
  const shortHash = hash ? hash.substring(0, 7) : 'a1b2c3d';
  const cleanHash = hash ? hash.replace(/[^0-9a-f]/gi, '') : '123';
  const hashSum = cleanHash.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const coveragePercent = 95 + (hashSum % 5);
  const bundleSizeKB = 135 + (hashSum % 20);
  const totalTests = 30 + (hashSum % 25);

  const getStepIcon = (status: CiCdStep['status']) => {
    switch (status) {
      case 'success':
        return (
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
            <Check size={14} className="stroke-[3]" />
          </div>
        );
      case 'failed':
        return (
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0 animate-bounce">
            <X size={14} className="stroke-[3]" />
          </div>
        );
      case 'running':
        return (
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-500 flex items-center justify-center shrink-0 relative">
            <span className="absolute inset-0 rounded-xl bg-sky-500/20 animate-ping opacity-75"></span>
            <RefreshCw size={14} className="animate-spin stroke-[2.5] relative z-10" />
          </div>
        );
      case 'pending':
        return (
          <div className="w-8 h-8 rounded-xl bg-neutral-500/5 border border-border text-text-muted flex items-center justify-center shrink-0">
            <Clock size={14} />
          </div>
        );
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-emerald-500/10 dark:bg-emerald-500/5 border-emerald-500/15';
      case 'failed': return 'bg-rose-500/10 dark:bg-rose-500/5 border-rose-500/15';
      case 'running': return 'bg-sky-500/10 dark:bg-sky-500/5 border-sky-500/15';
      default: return 'bg-neutral-500/5 border-border/70';
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-6 shadow-sm">
      {/* Redesigned Pipeline Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Cpu size={16} className="text-primary animate-pulse" />
            <span className="text-xs font-bold text-text-main tracking-widest uppercase">Pipeline Workflow</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-text-muted font-semibold bg-main px-2 py-0.5 rounded-md border border-border">
              Ref: <span className="font-mono text-primary font-bold">{shortHash}</span>
            </span>
            <span className="text-[10px] text-text-muted font-semibold bg-main px-2 py-0.5 rounded-md border border-border">
              Runner: <span className="font-mono text-text-main font-bold">runner-node18-x64</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {cicd.status !== 'running' && (
            <button
              onClick={() => ciCdStore.rerunPipeline(hash)}
              className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-primary hover:text-white bg-primary/10 hover:bg-primary px-3 py-1.5 rounded-xl transition-all active:scale-95 cursor-pointer shadow-sm border border-primary/20"
            >
              <RefreshCw size={11} className="transition-transform group-hover:rotate-180 duration-500" />
              <span>Rerun Pipeline</span>
            </button>
          )}
          <CiCdBadge hash={hash} />
        </div>
      </div>

      {/* Visual Topology Pipeline Map */}
      <div className="bg-main/30 border border-border/60 rounded-xl p-4">
        <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-4 flex items-center justify-between">
          <span>Topology Map</span>
          <span className="text-[9px] font-semibold text-primary">Live Connection Track</span>
        </div>
        
        <div className="grid grid-cols-4 gap-2 relative">
          {/* Connector Track Lines */}
          <div className="absolute top-[22px] left-[12%] right-[12%] h-[2px] bg-border/40 z-0 hidden sm:block">
            <div 
              className={`h-full transition-all duration-1000 ${
                cicd.status === 'success' ? 'bg-emerald-500 w-full' :
                cicd.status === 'failed' ? 'bg-rose-500 w-[50%]' :
                'bg-sky-500 w-[35%] animate-pulse'
              }`}
            />
          </div>

          {cicd.steps.map((step, idx) => {
            const stepNameShort = step.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            const isStepActive = step.status === 'running';
            const isStepSuccess = step.status === 'success';
            const isStepFailed = step.status === 'failed';

            return (
              <div key={step.name} className="flex flex-col items-center text-center relative z-10">
                <div className="relative">
                  {getStepIcon(step.status)}
                  {isStepActive && (
                    <span className="absolute -inset-1 rounded-xl border border-sky-400/50 animate-pulse" />
                  )}
                </div>
                <span className={`text-[9px] font-bold mt-2 truncate max-w-full ${
                  isStepActive ? 'text-sky-500' :
                  isStepSuccess ? 'text-text-main' :
                  isStepFailed ? 'text-rose-500' :
                  'text-text-muted/60'
                }`}>
                  {stepNameShort}
                </span>
                <span className="text-[8px] font-semibold text-text-muted/60 mt-0.5">
                  {step.status === 'pending' ? 'Wait' : step.duration}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modern High-Fidelity Non-Terminal Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-main/30 border border-border/60 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <ShieldCheck size={16} />
          </div>
          <div className="min-w-0">
            <span className="block text-[8px] font-bold text-text-muted uppercase tracking-wider">Test Suite</span>
            <span className="text-xs font-extrabold text-text-main block mt-0.5">
              {cicd.status === 'failed' && hashSum % 3 === 1 ? 'Failed Spec' : `${totalTests}/${totalTests} Passed`}
            </span>
            <span className="text-[8px] text-emerald-500 font-semibold">{coveragePercent}% Code Coverage</span>
          </div>
        </div>

        <div className="bg-main/30 border border-border/60 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
            <FileCode size={16} />
          </div>
          <div className="min-w-0">
            <span className="block text-[8px] font-bold text-text-muted uppercase tracking-wider">Production Build</span>
            <span className="text-xs font-extrabold text-text-main block mt-0.5">Vite Bundle CJS</span>
            <span className="text-[8px] text-text-muted font-semibold">{bundleSizeKB} kB optimized assets</span>
          </div>
        </div>

        <div className="bg-main/30 border border-border/60 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Server size={16} />
          </div>
          <div className="min-w-0">
            <span className="block text-[8px] font-bold text-text-muted uppercase tracking-wider">Deploy Ingress</span>
            <span className="text-xs font-extrabold text-text-main block mt-0.5">Cloud Run Container</span>
            <span className="text-[8px] text-text-muted font-semibold">Region: asia-southeast1</span>
          </div>
        </div>
      </div>

      {/* Beautiful Checklist Timeline Steps (Not Terminal-like) */}
      <div className="space-y-3.5">
        <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
          <Gauge size={12} className="text-text-muted" />
          <span>Detailed Pipeline Steps</span>
        </div>

        <div className="space-y-2.5">
          {cicd.steps.map((step, idx) => {
            const isExpanded = expandedStep === idx || (step.status === 'running' && expandedStep === null);
            const formattedName = step.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            
            // Parse log output into beautiful structured checkpoints instead of monospace code blocks
            const lines = step.log.split('\n').filter(Boolean);
            const parsedLines = lines.map(line => parseLogLine(line));

            return (
              <div 
                key={step.name} 
                className={`border rounded-xl transition-all duration-200 overflow-hidden ${getStatusBgColor(step.status)}`}
              >
                {/* Accordion Trigger */}
                <div 
                  onClick={() => setExpandedStep(expandedStep === idx ? -1 : idx)}
                  className="flex items-center justify-between p-3.5 cursor-pointer select-none hover:bg-main/10 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {step.status === 'success' && <Check size={14} className="text-emerald-500 shrink-0 stroke-[3]" />}
                    {step.status === 'failed' && <X size={14} className="text-rose-500 shrink-0 stroke-[3]" />}
                    {step.status === 'running' && <RefreshCw size={14} className="text-sky-500 animate-spin shrink-0 stroke-[2.5]" />}
                    {step.status === 'pending' && <Clock size={14} className="text-text-muted/60 shrink-0" />}
                    
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-text-main block truncate">{formattedName}</span>
                      <span className="text-[9px] text-text-muted block font-semibold mt-0.5">
                        {step.status === 'running' ? 'Active simulation timer running' : `Duration: ${step.duration}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronUp size={14} className="text-text-muted/70" />
                    ) : (
                      <ChevronDown size={14} className="text-text-muted/70" />
                    )}
                  </div>
                </div>

                {/* Simulated live progress bar for running steps */}
                {step.status === 'running' && (
                  <div className="h-[2px] bg-sky-500/10 w-full relative overflow-hidden">
                    <div className="absolute top-0 bottom-0 left-0 bg-sky-500 animate-pulse w-full origin-left transition-transform duration-1000" style={{ transform: 'scaleX(0.7)' }} />
                  </div>
                )}

                {/* Redesigned log panel: Beautiful checklist items with icons, not code blocks */}
                {isExpanded && (
                  <div className="px-4.5 pb-4.5 pt-1 border-t border-border/20 bg-card/40 divide-y divide-border/20">
                    <div className="space-y-2.5 pt-3">
                      {parsedLines.length === 0 ? (
                        <div className="text-[10px] text-text-muted/70 italic py-1">No log checkpoints recorded yet.</div>
                      ) : (
                        parsedLines.map((parsed, lIdx) => {
                          const isUrl = parsed.text.startsWith('http');
                          
                          return (
                            <div key={lIdx} className="flex items-start gap-2 text-[10px] leading-relaxed animate-fade-down" style={{ animationDelay: `${lIdx * 40}ms` }}>
                              {/* Sleek icon indicator matching types */}
                              {parsed.type === 'success' && (
                                <span className="w-4 h-4 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                                  <Check size={9} className="stroke-[3]" />
                                </span>
                              )}
                              {parsed.type === 'error' && (
                                <span className="w-4 h-4 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                                  <X size={9} className="stroke-[3]" />
                                </span>
                              )}
                              {parsed.type === 'running' && (
                                <span className="w-4 h-4 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-500 flex items-center justify-center shrink-0 mt-0.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping" />
                                </span>
                              )}
                              {parsed.type === 'info' && (
                                <span className="w-4 h-4 rounded-full bg-neutral-500/10 border border-border text-text-muted flex items-center justify-center shrink-0 mt-0.5">
                                  <Clock size={9} />
                                </span>
                              )}
                              {parsed.type === 'neutral' && (
                                <span className="w-1.5 h-1.5 rounded-full bg-text-muted/40 shrink-0 mt-2 ml-1.5" />
                              )}

                              <div className="flex-1 min-w-0 font-medium text-text-main/90">
                                {isUrl ? (
                                  <a 
                                    href={parsed.text} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="text-primary hover:underline inline-flex items-center gap-1 font-bold break-all"
                                  >
                                    <span>{parsed.text}</span>
                                    <ExternalLink size={10} className="shrink-0" />
                                  </a>
                                ) : (
                                  <p className="break-words">
                                    {parsed.text}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
