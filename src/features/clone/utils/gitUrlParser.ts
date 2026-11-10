import { CloneProtocol } from '../types';

export interface ParsedGitUrl {
  raw: string;
  owner: string;
  repo: string;
  host: string;
  protocol: CloneProtocol;
  isValid: boolean;
  cleanName: string;
}

export function parseGitUrl(input: string, fallbackDefault = { owner: 'nakib555', repo: 'git-manager' }): ParsedGitUrl {
  if (!input || !input.trim()) {
    return {
      raw: '',
      owner: fallbackDefault.owner,
      repo: fallbackDefault.repo,
      host: 'github.com',
      protocol: 'https',
      isValid: false,
      cleanName: `${fallbackDefault.owner}/${fallbackDefault.repo}`,
    };
  }

  let str = input.trim();

  // Strip CLI prefixes if present: "git clone ...", "gh repo clone ..."
  if (str.startsWith('git clone ')) {
    str = str.replace(/^git clone\s+/, '').trim();
    // remove flags like --depth 1, -b branch
    str = str.replace(/--[a-zA-Z0-9_-]+(\s+[^\s]+)?/g, '').replace(/-[a-zA-Z0-9](\s+[^\s]+)?/g, '').trim();
  } else if (str.startsWith('gh repo clone ')) {
    str = str.replace(/^gh repo clone\s+/, '').trim();
  }

  let host = 'github.com';
  let owner = '';
  let repo = '';
  let detectedProtocol: CloneProtocol = 'https';

  // Case 1: SSH format - git@github.com:owner/repo.git
  const sshMatch = str.match(/^(?:ssh:\/\/)?git@([a-zA-Z0-9.-]+):([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+?)(?:\.git)?$/);
  if (sshMatch) {
    host = sshMatch[1];
    owner = sshMatch[2];
    repo = sshMatch[3];
    detectedProtocol = 'ssh';
  } else {
    // Case 2: Standard URL - https://github.com/owner/repo.git or http://...
    try {
      if (str.startsWith('http://') || str.startsWith('https://')) {
        const urlObj = new URL(str);
        host = urlObj.hostname;
        const segments = urlObj.pathname.split('/').filter(Boolean);
        if (segments.length >= 2) {
          owner = segments[0];
          repo = segments[1].replace(/\.git$/, '');
          detectedProtocol = 'https';
        }
      }
    } catch (_) {}

    // Case 3: Shorthand owner/repo (e.g., "facebook/react" or "nakib555/git-manager")
    if (!owner || !repo) {
      const shorthandMatch = str.match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+?)(?:\.git)?$/);
      if (shorthandMatch) {
        owner = shorthandMatch[1];
        repo = shorthandMatch[2];
        detectedProtocol = 'https';
      }
    }

    // Case 4: General fallback path split
    if (!owner || !repo) {
      const parts = str.replace(/\.git$/, '').split(/[/:]/).filter(Boolean);
      if (parts.length >= 2) {
        repo = parts[parts.length - 1];
        owner = parts[parts.length - 2];
      }
    }
  }

  const cleanOwner = (owner || fallbackDefault.owner).replace(/[^a-zA-Z0-9_.-]/g, '');
  const cleanRepo = (repo || fallbackDefault.repo).replace(/[^a-zA-Z0-9_.-]/g, '');
  const isValid = Boolean(owner && repo);

  return {
    raw: input,
    owner: cleanOwner,
    repo: cleanRepo,
    host,
    protocol: detectedProtocol,
    isValid,
    cleanName: `${cleanOwner}/${cleanRepo}`,
  };
}

export function formatGitUrl(owner: string, repo: string, protocol: CloneProtocol, host = 'github.com'): string {
  const safeOwner = owner || 'owner';
  const safeRepo = repo || 'repo';
  const safeHost = host || 'github.com';

  switch (protocol) {
    case 'ssh':
      return `git@${safeHost}:${safeOwner}/${safeRepo}.git`;
    case 'cli':
      return safeHost === 'github.com'
        ? `gh repo clone ${safeOwner}/${safeRepo}`
        : `git clone https://${safeHost}/${safeOwner}/${safeRepo}.git`;
    case 'https':
    default:
      return `https://${safeHost}/${safeOwner}/${safeRepo}.git`;
  }
}
