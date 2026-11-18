export type TerminalLineTone = 'cmd' | 'out' | 'success' | 'warn' | 'error' | 'muted' | 'accent';

export interface TerminalOutputLine {
  text: string;
  tone?: TerminalLineTone;
}

export interface TerminalExecutionContext {
  currentRepo: string | null;
  currentRepoOwner: string | null;
  currentBranch: string | null;
  currentScreen: string;
  theme: string;
  isDemoMode: boolean;
  repos: { name: string; owner?: { login?: string }; full_name?: string; default_branch?: string; private?: boolean }[];
  branches: { name: string; isDefault?: boolean; isProtected?: boolean; commitCount?: number }[];
  commits: { hash: string; msg: string; author?: string; time?: string; add?: string; del?: string }[];
  files: { name: string; path?: string; type: string; size?: number }[];
  prs: { id: number; title: string; status: string; source?: string; branch?: string; target?: string }[];
  actions: {
    openRepo: (name: string, owner?: string | null) => void;
    switchBranch: (branch: string) => Promise<void> | void;
    createLocalBranch: (payload: { name: string; desc: string }) => Promise<any> | void;
    deleteBranch: (branch: string) => Promise<void> | void;
    createLocalCommit: (payload: { title: string; msg: string; branch?: string; type?: string }) => Promise<any> | void;
    createTagAtCommit: (hash: string, tagName: string) => void;
    navigate: (screen: any) => void;
    refreshData: () => Promise<void> | void;
    toggleTheme: () => void;
    readFileContent: (path: string) => Promise<string | null>;
  };
}

export interface TerminalCommandResult {
  lines: TerminalOutputLine[];
  clear?: boolean;
}

const KNOWN_COMMANDS = [
  'help',
  'clear',
  'pwd',
  'ls',
  'cat',
  'cd',
  'open',
  'theme',
  'git status',
  'git branch',
  'git checkout',
  'git switch',
  'git log',
  'git show',
  'git diff',
  'git commit -m',
  'git fetch',
  'git pull',
  'git remote -v',
  'git tag',
  'git pr list',
];

export function tokenizeCommand(input: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let quote: '"' | "'" | null = null;

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    if (quote) {
      if (ch === quote) {
        quote = null;
      } else {
        current += ch;
      }
      continue;
    }

    if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (/\s/.test(ch)) {
      if (current.length > 0) {
        tokens.push(current);
        current = '';
      }
    } else {
      current += ch;
    }
  }

  if (current.length > 0) {
    tokens.push(current);
  }
  return tokens;
}

export function getAutocompleteSuggestions(
  partial: string,
  ctx: Pick<TerminalExecutionContext, 'branches' | 'files' | 'repos'>,
): string[] {
  const trimmed = partial.trimStart();
  if (!trimmed) return KNOWN_COMMANDS.slice(0, 8);

  if (trimmed.startsWith('git checkout ') || trimmed.startsWith('git switch ')) {
    const prefix = trimmed.split(/\s+/).slice(2).join(' ').toLowerCase();
    const base = trimmed.startsWith('git switch ') ? 'git switch ' : 'git checkout ';
    return ctx.branches
      .filter((b) => b.name.toLowerCase().startsWith(prefix))
      .map((b) => `${base}${b.name}`);
  }

  if (trimmed.startsWith('cat ')) {
    const prefix = trimmed.slice(4).toLowerCase();
    return ctx.files
      .filter((f) => f.type === 'file' && (f.path || f.name).toLowerCase().startsWith(prefix))
      .slice(0, 8)
      .map((f) => `cat ${f.path || f.name}`);
  }

  if (trimmed.startsWith('open ')) {
    const prefix = trimmed.slice(5).toLowerCase();
    return ctx.repos
      .filter((r) => r.name.toLowerCase().startsWith(prefix))
      .slice(0, 8)
      .map((r) => `open ${r.name}`);
  }

  return KNOWN_COMMANDS.filter((c) => c.startsWith(trimmed.toLowerCase()));
}

const VALID_SCREENS = ['dash', 'repos', 'files', 'commits', 'branches', 'prs', 'insights', 'clone', 'settings'] as const;

export async function executeTerminalCommand(
  rawInput: string,
  ctx: TerminalExecutionContext,
): Promise<TerminalCommandResult> {
  const trimmed = rawInput.trim();
  if (!trimmed) return { lines: [] };

  const tokens = tokenizeCommand(trimmed);
  const cmd = tokens[0]?.toLowerCase();

  if (cmd === 'clear' || cmd === 'cls') {
    return { lines: [], clear: true };
  }

  if (cmd === 'help' || cmd === '?') {
    return {
      lines: [
        { text: 'Available commands:', tone: 'accent' },
        { text: '  git status                  Show active workspace, branch, and repo metrics' },
        { text: '  git branch [name | -d name] List branches, create, or delete a branch' },
        { text: '  git checkout [-b] <branch>  Switch to or create a branch' },
        { text: '  git switch <branch>         Switch active branch' },
        { text: '  git log [-n N] [--oneline]  Display recent commit history' },
        { text: '  git show [sha]              Inspect latest or specified commit metadata' },
        { text: '  git commit -m "<message>"   Create a commit on the active branch' },
        { text: '  git tag <tagName> [sha]     Tag HEAD or a specific commit' },
        { text: '  git fetch / git pull        Sync repository details from workspace source' },
        { text: '  git remote -v               Show configured remote URLs' },
        { text: '  git pr list                 List open pull requests in this repo' },
        { text: '  ls [prefix]                 List repository files or directories' },
        { text: '  cat <path>                  Print file contents from current repository' },
        { text: '  open <repo>                 Open a repository from the catalog' },
        { text: '  cd <view>                   Navigate view (dash, repos, files, commits, branches, prs, insights, settings)' },
        { text: '  theme | pwd | clear         Toggle theme, show context path, or clear terminal' },
      ],
    };
  }

  if (cmd === 'pwd') {
    const repoPart = ctx.currentRepo
      ? `${ctx.currentRepoOwner || 'workspace'}/${ctx.currentRepo}@${ctx.currentBranch || 'main'}`
      : 'workspace';
    return {
      lines: [{ text: `/${repoPart}/${ctx.currentScreen}`, tone: 'out' }],
    };
  }

  if (cmd === 'theme') {
    ctx.actions.toggleTheme();
    return {
      lines: [{ text: `Toggled theme (was ${ctx.theme}).`, tone: 'success' }],
    };
  }

  if (cmd === 'open') {
    const targetName = tokens[1];
    if (!targetName) {
      return { lines: [{ text: 'Usage: open <repository-name>', tone: 'warn' }] };
    }
    const found = ctx.repos.find((r) => r.name.toLowerCase() === targetName.toLowerCase());
    if (!found) {
      return {
        lines: [{ text: `Repository '${targetName}' not found. Run 'ls' on workspace or check Repositories.`, tone: 'error' }],
      };
    }
    ctx.actions.openRepo(found.name, found.owner?.login || null);
    return {
      lines: [{ text: `Opened repository ${found.full_name || found.name}`, tone: 'success' }],
    };
  }

  if (cmd === 'cd') {
    const target = tokens[1]?.toLowerCase();
    if (!target || !(VALID_SCREENS as readonly string[]).includes(target)) {
      return {
        lines: [{ text: `Usage: cd <${VALID_SCREENS.join('|')}>`, tone: 'warn' }],
      };
    }
    if (['files', 'commits', 'branches', 'prs', 'insights'].includes(target) && !ctx.currentRepo) {
      return {
        lines: [{ text: `Select or 'open <repo>' before navigating to '${target}'.`, tone: 'warn' }],
      };
    }
    ctx.actions.navigate(target);
    return { lines: [{ text: `Switched view to ${target}`, tone: 'muted' }] };
  }

  if (cmd === 'ls') {
    if (!ctx.currentRepo) {
      if (ctx.repos.length === 0) {
        return { lines: [{ text: 'No repositories loaded.', tone: 'muted' }] };
      }
      return {
        lines: ctx.repos.slice(0, 20).map((r) => ({
          text: `${r.owner?.login || 'local'}/${r.name}`,
          tone: 'out' as const,
        })),
      };
    }
    const prefix = (tokens[1] || '').replace(/^\/+|\/+$/g, '').toLowerCase();
    const matching = ctx.files.filter((f) => {
      const p = (f.path || f.name).toLowerCase();
      return !prefix || p.startsWith(prefix);
    });
    if (matching.length === 0) {
      return { lines: [{ text: prefix ? `No entries matching '${prefix}'` : 'Working tree is empty.', tone: 'muted' }] };
    }
    return {
      lines: matching.slice(0, 30).map((f) => ({
        text: `${f.type === 'dir' ? 'dir ' : 'file'}  ${f.path || f.name}`,
        tone: f.type === 'dir' ? 'accent' : 'out',
      })),
    };
  }

  if (cmd === 'cat') {
    const filePath = tokens[1];
    if (!filePath) {
      return { lines: [{ text: 'Usage: cat <file-path>', tone: 'warn' }] };
    }
    if (!ctx.currentRepo) {
      return { lines: [{ text: 'No active repository. Run `open <repo>` first.', tone: 'error' }] };
    }
    const content = await ctx.actions.readFileContent(filePath);
    if (content === null) {
      return { lines: [{ text: `cat: ${filePath}: No such text file in ${ctx.currentRepo}`, tone: 'error' }] };
    }
    const fileLines = content.split('\n').slice(0, 80);
    const out: TerminalOutputLine[] = fileLines.map((line) => ({ text: line, tone: 'out' }));
    if (content.split('\n').length > 80) {
      out.push({ text: '... (truncated after 80 lines; open in Files view for full file)', tone: 'muted' });
    }
    return { lines: out };
  }

  if (cmd !== 'git') {
    return {
      lines: [{ text: `Unknown command '${tokens[0]}'. Type 'help' for supported commands.`, tone: 'error' }],
    };
  }

  const sub = tokens[1]?.toLowerCase();
  if (!sub) {
    return { lines: [{ text: "Usage: git <status|branch|checkout|switch|log|show|commit|tag|fetch|pull|remote|pr>", tone: 'warn' }] };
  }

  if (!ctx.currentRepo) {
    return {
      lines: [{ text: `fatal: not inside a repository workspace. Run 'open <repo>' first.`, tone: 'error' }],
    };
  }

  if (sub === 'status') {
    const openPrCount = ctx.prs.filter((p) => p.status === 'Open' || p.status === 'Draft').length;
    return {
      lines: [
        { text: `On branch ${ctx.currentBranch || 'main'}`, tone: 'accent' },
        { text: `Repository: ${ctx.currentRepoOwner || 'workspace'}/${ctx.currentRepo} (${ctx.isDemoMode ? 'Demo Workspace' : 'GitHub Synced'})`, tone: 'out' },
        { text: `Branches: ${ctx.branches.length} · Commits loaded: ${ctx.commits.length} · Open/Draft PRs: ${openPrCount}`, tone: 'muted' },
        { text: 'Working tree synced with active workspace state.', tone: 'success' },
      ],
    };
  }

  if (sub === 'remote') {
    const owner = ctx.currentRepoOwner || 'workspace';
    const url = `https://github.com/${owner}/${ctx.currentRepo}.git`;
    return {
      lines: [
        { text: `origin  ${url} (fetch)`, tone: 'out' },
        { text: `origin  ${url} (push)`, tone: 'out' },
      ],
    };
  }

  if (sub === 'fetch' || sub === 'pull') {
    await ctx.actions.refreshData();
    return {
      lines: [
        { text: `From github.com:${ctx.currentRepoOwner || 'workspace'}/${ctx.currentRepo}`, tone: 'muted' },
        { text: `* branch ${ctx.currentBranch || 'main'} -> FETCH_HEAD (${sub === 'pull' ? 'Fast-forward synced' : 'Updated refs'})`, tone: 'success' },
      ],
    };
  }

  if (sub === 'branch') {
    if (tokens[2] === '-d' || tokens[2] === '-D') {
      const target = tokens[3];
      if (!target) {
        return { lines: [{ text: 'Usage: git branch -d <branch-name>', tone: 'warn' }] };
      }
      if (target === ctx.currentBranch) {
        return { lines: [{ text: `error: Cannot delete currently checked out branch '${target}'.`, tone: 'error' }] };
      }
      await ctx.actions.deleteBranch(target);
      return { lines: [{ text: `Deleted branch ${target}`, tone: 'success' }] };
    }
    if (tokens[2]) {
      const newBranch = tokens[2];
      await ctx.actions.createLocalBranch({ name: newBranch, desc: 'Created via workspace terminal' });
      return { lines: [{ text: `Created branch '${newBranch}' from '${ctx.currentBranch || 'main'}'`, tone: 'success' }] };
    }
    return {
      lines: ctx.branches.map((b) => ({
        text: `${b.name === ctx.currentBranch ? '* ' : '  '}${b.name}${b.isProtected ? ' [protected]' : ''}`,
        tone: b.name === ctx.currentBranch ? 'success' : 'out',
      })),
    };
  }

  if (sub === 'checkout' || sub === 'switch') {
    const isCreate = tokens[2] === '-b' || tokens[2] === '-c';
    const branchName = isCreate ? tokens[3] : tokens[2];
    if (!branchName) {
      return { lines: [{ text: `Usage: git ${sub} [-b] <branch-name>`, tone: 'warn' }] };
    }
    if (isCreate) {
      await ctx.actions.createLocalBranch({ name: branchName, desc: 'Created via git checkout -b' });
      return { lines: [{ text: `Switched to a new branch '${branchName}'`, tone: 'success' }] };
    }
    const exists = ctx.branches.some((b) => b.name === branchName);
    if (!exists) {
      return {
        lines: [{ text: `error: pathspec '${branchName}' did not match any known branch. Use -b to create it.`, tone: 'error' }],
      };
    }
    await ctx.actions.switchBranch(branchName);
    return { lines: [{ text: `Switched to branch '${branchName}'`, tone: 'success' }] };
  }

  if (sub === 'log') {
    let limit = 8;
    const nIdx = tokens.indexOf('-n');
    if (nIdx !== -1 && tokens[nIdx + 1]) {
      const parsed = parseInt(tokens[nIdx + 1], 10);
      if (Number.isFinite(parsed) && parsed > 0) limit = Math.min(parsed, 30);
    }
    const items = ctx.commits.slice(0, limit);
    if (items.length === 0) {
      return { lines: [{ text: 'No commits recorded in active history.', tone: 'muted' }] };
    }
    return {
      lines: items.map((c, idx) => ({
        text: `${c.hash.slice(0, 7)}${idx === 0 ? ' (HEAD)' : ''}  ${c.msg}  (${c.author || 'Developer'}, ${c.time || 'recent'})`,
        tone: idx === 0 ? 'accent' : 'out',
      })),
    };
  }

  if (sub === 'show') {
    const querySha = tokens[2]?.toLowerCase();
    const commit = querySha
      ? ctx.commits.find((c) => c.hash.toLowerCase().startsWith(querySha))
      : ctx.commits[0];
    if (!commit) {
      return { lines: [{ text: `fatal: bad object ${querySha || 'HEAD'}`, tone: 'error' }] };
    }
    return {
      lines: [
        { text: `commit ${commit.hash}`, tone: 'accent' },
        { text: `Author: ${commit.author || 'Developer'}`, tone: 'out' },
        { text: `When:   ${commit.time || 'recent'}`, tone: 'muted' },
        { text: `Diff:   ${commit.add || '+0'} / ${commit.del || '-0'}`, tone: 'success' },
        { text: `    ${commit.msg}`, tone: 'out' },
      ],
    };
  }

  if (sub === 'diff') {
    const latest = ctx.commits[0];
    if (!latest) {
      return { lines: [{ text: 'No commit diff baseline available.', tone: 'muted' }] };
    }
    return {
      lines: [
        { text: `Comparing HEAD (${latest.hash.slice(0, 7)}) -> working tree`, tone: 'accent' },
        { text: `Latest change summary: ${latest.msg} (${latest.add || '+0'} ${latest.del || '-0'})`, tone: 'out' },
        { text: `Tip: Run 'cd commits' or 'cd files' to inspect syntax-highlighted diffs.`, tone: 'muted' },
      ],
    };
  }

  if (sub === 'commit') {
    const mIndex = tokens.indexOf('-m');
    const msg = mIndex !== -1 ? tokens.slice(mIndex + 1).join(' ').trim() : '';
    if (!msg) {
      return { lines: [{ text: 'Usage: git commit -m "<commit message>"', tone: 'warn' }] };
    }
    await ctx.actions.createLocalCommit({
      title: msg,
      msg,
      branch: ctx.currentBranch || 'main',
      type: 'feat',
    });
    return {
      lines: [{ text: `[${ctx.currentBranch || 'main'}] ${msg}`, tone: 'success' }],
    };
  }

  if (sub === 'tag') {
    const tagName = tokens[2];
    const targetSha = tokens[3] || ctx.commits[0]?.hash;
    if (!tagName || !targetSha) {
      return { lines: [{ text: 'Usage: git tag <tag-name> [commit-sha]', tone: 'warn' }] };
    }
    ctx.actions.createTagAtCommit(targetSha, tagName);
    return {
      lines: [{ text: `Created tag '${tagName}' at ${targetSha.slice(0, 7)}`, tone: 'success' }],
    };
  }

  if (sub === 'pr') {
    if (ctx.prs.length === 0) {
      return { lines: [{ text: 'No pull requests in this repository.', tone: 'muted' }] };
    }
    return {
      lines: ctx.prs.map((p) => ({
        text: `#${p.id} [${p.status}] ${p.title} (${p.source || p.branch || 'feature'} -> ${p.target || 'main'})`,
        tone: p.status === 'Merged' ? 'accent' : p.status === 'Open' ? 'success' : 'muted',
      })),
    };
  }

  return {
    lines: [{ text: `git: '${sub}' is not supported here. Run 'help' for supported subcommands.`, tone: 'warn' }],
  };
}
