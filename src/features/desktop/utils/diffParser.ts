export type DiffLineKind = 'add' | 'del' | 'hunk' | 'meta' | 'context';

export interface ParsedDiffLine {
  lineNumber: number;
  raw: string;
  kind: DiffLineKind;
}

export interface ParsedUnifiedDiff {
  lines: ParsedDiffLine[];
  additions: number;
  deletions: number;
  hunks: number;
}

export function classifyDiffLine(line: string): DiffLineKind {
  if (line.startsWith('@@')) return 'hunk';
  if (
    line.startsWith('+++') ||
    line.startsWith('---') ||
    line.startsWith('diff --git') ||
    line.startsWith('index ') ||
    line.startsWith('new file mode') ||
    line.startsWith('deleted file mode')
  ) {
    return 'meta';
  }
  if (line.startsWith('+')) return 'add';
  if (line.startsWith('-')) return 'del';
  return 'context';
}

/**
 * Parses a unified diff patch in O(N) time so callers never re-split per line.
 */
export function parseUnifiedDiff(patch: string): ParsedUnifiedDiff {
  if (!patch) {
    return { lines: [], additions: 0, deletions: 0, hunks: 0 };
  }

  const rawLines = patch.split('\n');
  const lines: ParsedDiffLine[] = new Array(rawLines.length);
  let additions = 0;
  let deletions = 0;
  let hunks = 0;

  for (let i = 0; i < rawLines.length; i += 1) {
    const raw = rawLines[i];
    const kind = classifyDiffLine(raw);
    if (kind === 'add') additions += 1;
    else if (kind === 'del') deletions += 1;
    else if (kind === 'hunk') hunks += 1;

    lines[i] = {
      lineNumber: i + 1,
      raw,
      kind,
    };
  }

  return { lines, additions, deletions, hunks };
}
