import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Terminal, Plus, X, Trash2, Copy, Check, ChevronDown } from 'lucide-react';
import { useAppContext } from '../../../AppContext';
import { fetchFileContentSafe } from '../../../mobile/utils/gitApi';
import {
  executeTerminalCommand,
  getAutocompleteSuggestions,
  TerminalOutputLine,
} from '../utils/terminalEngine';

interface TerminalEntry {
  id: string;
  prompt?: string;
  lines: TerminalOutputLine[];
}

interface TerminalSession {
  id: string;
  label: string;
  entries: TerminalEntry[];
  history: string[];
}

interface DesktopTerminalPanelProps {
  height: number;
  onHeightChange: (nextHeight: number) => void;
  onClose: () => void;
}

const MIN_TERMINAL_HEIGHT = 160;
const MAX_TERMINAL_HEIGHT = 520;

const createWelcomeSession = (index: number): TerminalSession => ({
  id: `term_${Date.now()}_${index}`,
  label: `shell ${index}`,
  entries: [
    {
      id: `welcome_${index}`,
      lines: [
        {
          text: 'Git Manager Interactive Shell · Type `help` for git & workspace commands, `Tab` to autocomplete.',
          tone: 'muted',
        },
      ],
    },
  ],
  history: [],
});

export const DesktopTerminalPanel: React.FC<DesktopTerminalPanelProps> = ({
  height,
  onHeightChange,
  onClose,
}) => {
  const {
    currentRepo,
    currentRepoOwner,
    currentBranch,
    currentScreen,
    theme,
    demoMode,
    githubToken,
    githubRepos,
    activeBranches,
    activeCommits,
    activeFiles,
    activePRs,
    openRepo,
    switchBranch,
    createLocalBranch,
    deleteBranch,
    createLocalCommit,
    createTagAtCommit,
    navigate,
    refreshData,
    toggleTheme,
    showToast,
  } = useAppContext();

  const [sessions, setSessions] = useState<TerminalSession[]>(() => [createWelcomeSession(1)]);
  const [activeSessionId, setActiveSessionId] = useState<string>(() => '');
  const [input, setInput] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isResizingRef = useRef(false);

  const activeSession =
    sessions.find((s) => s.id === activeSessionId) || sessions[0];

  useEffect(() => {
    if (!activeSessionId && sessions[0]) {
      setActiveSessionId(sessions[0].id);
    }
  }, [activeSessionId, sessions]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 40);
  }, [activeSession?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeSession?.entries.length]);

  const startResize = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isResizingRef.current = true;
      const startY = e.clientY;
      const startH = height;

      const onMouseMove = (moveEvent: MouseEvent) => {
        if (!isResizingRef.current) return;
        const delta = startY - moveEvent.clientY;
        const maxAllowed = Math.min(MAX_TERMINAL_HEIGHT, Math.floor(window.innerHeight * 0.6));
        const clamped = Math.max(MIN_TERMINAL_HEIGHT, Math.min(maxAllowed, startH + delta));
        onHeightChange(clamped);
      };

      const onMouseUp = () => {
        isResizingRef.current = false;
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    },
    [height, onHeightChange]
  );

  const promptPrefix = currentRepo
    ? `${currentRepoOwner || 'workspace'}/${currentRepo} (${currentBranch || 'main'})`
    : 'workspace';

  const runCommand = async (raw: string) => {
    if (!activeSession) return;
    const trimmed = raw.trim();
    if (!trimmed) return;

    setSuggestions([]);
    setIsRunning(true);
    setInput('');
    setHistoryIndex(-1);

    try {
      const result = await executeTerminalCommand(trimmed, {
        currentRepo,
        currentRepoOwner,
        currentBranch,
        currentScreen,
        theme,
        isDemoMode: demoMode && !githubToken,
        repos: githubRepos,
        branches: activeBranches,
        commits: activeCommits,
        files: activeFiles,
        prs: activePRs,
        actions: {
          openRepo,
          switchBranch,
          createLocalBranch,
          deleteBranch,
          createLocalCommit,
          createTagAtCommit,
          navigate,
          refreshData,
          toggleTheme,
          readFileContent: async (filePath) => {
            if (!currentRepo) return null;
            const match = activeFiles.find(
              (f: any) => (f.path || f.name) === filePath && f.type === 'file'
            );
            if (!match) {
              // Still try localStorage/demo lookup in case user entered valid path
              const text = await fetchFileContentSafe({
                filePath,
                repoName: currentRepo,
                owner: currentRepoOwner,
                branch: currentBranch || 'main',
                token: githubToken,
              });
              if (text.startsWith('// Unable to fetch remote content')) return null;
              return text;
            }
            return fetchFileContentSafe({
              filePath,
              repoName: currentRepo,
              owner: currentRepoOwner,
              branch: currentBranch || 'main',
              token: githubToken,
            });
          },
        },
      });

      setSessions((prev) =>
        prev.map((sess) => {
          if (sess.id !== activeSession.id) return sess;
          const nextHistory =
            sess.history[sess.history.length - 1] === trimmed
              ? sess.history
              : [...sess.history, trimmed].slice(-50);

          if (result.clear) {
            return { ...sess, entries: [], history: nextHistory };
          }

          return {
            ...sess,
            history: nextHistory,
            entries: [
              ...sess.entries,
              {
                id: `entry_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                prompt: `${promptPrefix} $ ${trimmed}`,
                lines: result.lines,
              },
            ].slice(-120),
          };
        })
      );
    } catch (err: any) {
      setSessions((prev) =>
        prev.map((sess) =>
          sess.id !== activeSession.id
            ? sess
            : {
                ...sess,
                entries: [
                  ...sess.entries,
                  {
                    id: `err_${Date.now()}`,
                    prompt: `${promptPrefix} $ ${trimmed}`,
                    lines: [{ text: err?.message || 'Command execution failed.', tone: 'error' }],
                  },
                ],
              }
        )
      );
    } finally {
      setIsRunning(false);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!isRunning) runCommand(input);
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const hist = activeSession?.history || [];
      if (hist.length === 0) return;
      const nextIdx = historyIndex === -1 ? hist.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIdx);
      setInput(hist[nextIdx] || '');
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const hist = activeSession?.history || [];
      if (historyIndex === -1) return;
      if (historyIndex >= hist.length - 1) {
        setHistoryIndex(-1);
        setInput('');
      } else {
        const nextIdx = historyIndex + 1;
        setHistoryIndex(nextIdx);
        setInput(hist[nextIdx] || '');
      }
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const matches = getAutocompleteSuggestions(input, {
        branches: activeBranches,
        files: activeFiles,
        repos: githubRepos,
      });
      if (matches.length === 1) {
        setInput(matches[0]);
        setSuggestions([]);
      } else if (matches.length > 1) {
        setSuggestions(matches.slice(0, 6));
      }
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
      e.preventDefault();
      handleClearSession();
    }
  };

  const handleClearSession = () => {
    if (!activeSession) return;
    setSessions((prev) =>
      prev.map((s) => (s.id === activeSession.id ? { ...s, entries: [] } : s))
    );
    setSuggestions([]);
  };

  const handleAddSession = () => {
    const nextNum = sessions.length + 1;
    const created = createWelcomeSession(nextNum);
    setSessions((prev) => [...prev, created]);
    setActiveSessionId(created.id);
  };

  const handleCloseSession = (id: string) => {
    if (sessions.length <= 1) {
      onClose();
      return;
    }
    const remaining = sessions.filter((s) => s.id !== id);
    setSessions(remaining);
    if (activeSessionId === id && remaining[0]) {
      setActiveSessionId(remaining[0].id);
    }
  };

  const handleCopyOutput = async () => {
    if (!activeSession) return;
    const dump = activeSession.entries
      .map((entry) => [entry.prompt, ...entry.lines.map((l) => l.text)].filter(Boolean).join('\n'))
      .join('\n');
    try {
      await navigator.clipboard.writeText(dump);
      setCopiedId(true);
      showToast('Terminal output copied to clipboard', 'success');
      setTimeout(() => setCopiedId(false), 1800);
    } catch (_) {}
  };

  const toneClass = (tone?: TerminalOutputLine['tone']) => {
    switch (tone) {
      case 'success':
        return 'text-addition';
      case 'error':
        return 'text-danger';
      case 'warn':
        return 'text-warning';
      case 'accent':
        return 'text-primary font-medium';
      case 'muted':
        return 'text-text-tertiary';
      default:
        return 'text-text-primary';
    }
  };

  return (
    <section
      id="desktop-terminal-panel"
      role="region"
      aria-label="Workspace Terminal"
      style={{ height: `${height}px` }}
      className="border-t border-border bg-surface-1 flex flex-col shrink-0 relative z-20"
    >
      {/* Top Resize Handle */}
      <div
        role="separator"
        aria-orientation="horizontal"
        aria-label="Resize terminal panel"
        tabIndex={0}
        onMouseDown={startResize}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            onHeightChange(Math.min(MAX_TERMINAL_HEIGHT, height + 20));
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            onHeightChange(Math.max(MIN_TERMINAL_HEIGHT, height - 20));
          }
        }}
        className="h-1.5 w-full cursor-row-resize hover:bg-primary/40 focus-visible:bg-primary/50 transition-colors shrink-0 outline-none"
        title="Drag to resize terminal"
      />

      {/* Terminal Header Bar */}
      <div className="h-9 px-3 border-b border-border bg-card flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-1.5 min-w-0 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-text-primary pr-2 shrink-0">
            <Terminal size={13} className="text-primary" />
            <span>Terminal</span>
          </div>

          <div className="flex items-center gap-1">
            {sessions.map((sess) => {
              const isActive = sess.id === activeSession?.id;
              return (
                <div
                  key={sess.id}
                  className={`flex items-center gap-1 rounded-lg border text-[11px] font-mono transition-colors ${
                    isActive
                      ? 'bg-surface-2 border-border text-text-primary font-semibold'
                      : 'border-transparent text-text-secondary hover:bg-hover/60'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveSessionId(sess.id)}
                    className="px-2 py-1 cursor-pointer whitespace-nowrap"
                  >
                    {sess.label}
                  </button>
                  {sessions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleCloseSession(sess.id)}
                      aria-label={`Close ${sess.label}`}
                      className="pr-1.5 text-text-tertiary hover:text-text-primary cursor-pointer"
                    >
                      <X size={11} />
                    </button>
                  )}
                </div>
              );
            })}
            <button
              type="button"
              onClick={handleAddSession}
              aria-label="Add shell tab"
              title="Add shell tab"
              className="w-6 h-6 rounded-md hover:bg-hover text-text-secondary hover:text-text-primary flex items-center justify-center cursor-pointer"
            >
              <Plus size={13} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleCopyOutput}
            aria-label="Copy terminal output"
            title="Copy output"
            className="w-7 h-7 rounded-md hover:bg-hover text-text-secondary hover:text-text-primary flex items-center justify-center cursor-pointer"
          >
            {copiedId ? <Check size={13} className="text-addition" /> : <Copy size={13} />}
          </button>
          <button
            type="button"
            onClick={handleClearSession}
            aria-label="Clear terminal output"
            title="Clear terminal (Ctrl+L)"
            className="w-7 h-7 rounded-md hover:bg-hover text-text-secondary hover:text-text-primary flex items-center justify-center cursor-pointer"
          >
            <Trash2 size={13} />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Minimize terminal panel"
            title="Hide terminal (Ctrl+`)"
            className="w-7 h-7 rounded-md hover:bg-hover text-text-secondary hover:text-text-primary flex items-center justify-center cursor-pointer"
          >
            <ChevronDown size={15} />
          </button>
        </div>
      </div>

      {/* Scrollable Output */}
      <div
        ref={scrollRef}
        onClick={() => inputRef.current?.focus()}
        className="flex-1 overflow-y-auto px-4 py-2.5 font-mono text-xs space-y-2 bg-main/60 cursor-text"
      >
        {activeSession?.entries.map((entry) => (
          <div key={entry.id} className="space-y-0.5">
            {entry.prompt && (
              <div className="text-primary font-semibold break-all">{entry.prompt}</div>
            )}
            {entry.lines.map((line, i) => (
              <pre
                key={i}
                className={`whitespace-pre-wrap break-words font-mono text-[11.5px] leading-relaxed ${toneClass(
                  line.tone
                )}`}
              >
                {line.text}
              </pre>
            ))}
          </div>
        ))}

        {suggestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {suggestions.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setInput(item);
                  setSuggestions([]);
                  inputRef.current?.focus();
                }}
                className="px-2 py-0.5 rounded border border-border bg-surface-2 hover:border-primary/50 text-[11px] font-mono text-text-primary cursor-pointer"
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Prompt Input Row */}
      <div className="px-4 py-2 border-t border-border/70 bg-surface-1 flex items-center gap-2 font-mono text-xs shrink-0">
        <span className="text-primary font-semibold shrink-0 truncate max-w-[260px]">
          {promptPrefix} $
        </span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (suggestions.length) setSuggestions([]);
          }}
          onKeyDown={handleKeyDown}
          disabled={isRunning}
          aria-label="Terminal command input"
          placeholder="git status, git branch, git log -n 5, ls, cat README.md, help..."
          className="flex-1 bg-transparent border-none outline-none text-text-main placeholder:text-text-tertiary text-xs font-mono min-w-0"
        />
      </div>
    </section>
  );
};
