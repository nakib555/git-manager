export type DatePreset = 'all' | 'today' | '7d' | '30d' | 'year' | 'custom';

export interface CommitFilter {
  query: string;
  branch: string;
  author: string;
  since: string;
  until: string;
  datePreset?: DatePreset;
  page: number;
  pageSize?: number;
}

export const normalizeDateRange = (since?: string, until?: string) => {
  let sinceDate: Date | null = null;
  let untilDate: Date | null = null;

  if (since && since.trim()) {
    try {
      const d = new Date(since.includes('T') ? since : `${since}T00:00:00`);
      if (!isNaN(d.getTime())) sinceDate = d;
    } catch (_) {}
  }

  if (until && until.trim()) {
    try {
      const d = new Date(until.includes('T') ? until : `${until}T23:59:59.999`);
      if (!isNaN(d.getTime())) untilDate = d;
    } catch (_) {}
  }

  return { sinceDate, untilDate };
};

export const filterLocalCommits = (commits: any[], filters: Partial<CommitFilter>) => {
  if (!commits || !Array.isArray(commits)) return [];
  const q = (filters.query || '').trim().toLowerCase();
  const authorQ = (filters.author || '').trim().toLowerCase();
  const { sinceDate, untilDate } = normalizeDateRange(filters.since, filters.until);
  const sinceTime = sinceDate ? sinceDate.getTime() : null;
  const untilTime = untilDate ? untilDate.getTime() : null;

  return commits.filter((c: any) => {
    if (q) {
      const msgMatch = (c.msg || '').toLowerCase().includes(q);
      const hashMatch = (c.hash || '').toLowerCase().includes(q);
      const fullHashMatch = (c.fullHash || '').toLowerCase().includes(q);
      const authorMatch = (c.author || '').toLowerCase().includes(q);
      if (!msgMatch && !hashMatch && !fullHashMatch && !authorMatch) return false;
    }

    if (authorQ) {
      const authorMatch = (c.author || '').toLowerCase().includes(authorQ);
      if (!authorMatch) return false;
    }

    if (sinceTime !== null || untilTime !== null) {
      const rawDate = c.timestamp || c.date;
      if (rawDate) {
        const commitTime = new Date(rawDate).getTime();
        if (!isNaN(commitTime)) {
          if (sinceTime !== null && commitTime < sinceTime) return false;
          if (untilTime !== null && commitTime > untilTime) return false;
        }
      }
    }
    return true;
  });
};
