function calculateRelative(targetMs: number): string {
  const diffInSeconds = Math.floor((Date.now() - targetMs) / 1000);
  if (diffInSeconds < 10) return 'just now';
  if (diffInSeconds < 60) return `${Math.max(1, diffInSeconds)}s ago`;
  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function normalizeRelativePhrase(phrase: string): string {
  return phrase
    .replace(/(\d+)\s*hours?\s*ago/i, '$1h ago')
    .replace(/(\d+)\s*mins?\s*ago/i, '$1m ago')
    .replace(/(\d+)\s*minutes?\s*ago/i, '$1m ago')
    .replace(/(\d+)\s*days?\s*ago/i, '$1d ago')
    .replace(/(\d+)\s*months?\s*ago/i, '$1mo ago')
    .replace(/(\d+)\s*years?\s*ago/i, '$1y ago')
    .replace(/(\d+)\s*secs?\s*ago/i, '$1s ago')
    .replace(/(\d+)\s*seconds?\s*ago/i, '$1s ago');
}

/** Formats an ISO date string, unix timestamp, or Date into dynamic relative time */
export function formatRelativeTime(
  dateInput?: string | number | Date | null,
  fallbackInput?: string | number | Date | null
): string {
  const input = dateInput || fallbackInput;
  if (!input) return 'just now';
  if (input instanceof Date) return isNaN(input.getTime()) ? 'recently' : calculateRelative(input.getTime());
  if (typeof input === 'number') {
    if (isNaN(input) || input <= 0) return 'recently';
    return calculateRelative(input > 1e11 ? input : input * 1000);
  }
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) return 'just now';
    if (/^\d+$/.test(trimmed)) {
      const num = parseInt(trimmed, 10);
      return calculateRelative(num > 1e11 ? num : num * 1000);
    }
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) return calculateRelative(parsed.getTime());
    if (fallbackInput && fallbackInput !== dateInput) return formatRelativeTime(fallbackInput);
    if (trimmed.endsWith('ago') || trimmed === 'just now' || trimmed === 'recently') return normalizeRelativePhrase(trimmed);
    if (trimmed.toLowerCase() === 'yesterday') return '1d ago';
    return trimmed;
  }
  return 'recently';
}

/** Formats a date into full localized string (e.g. 'Oct 19, 2026, 8:42 AM') */
export function formatFullDateTime(dateString?: string | number | Date | null): string {
  if (!dateString) return 'Unknown date';
  if (typeof dateString === 'string' && (dateString.endsWith('ago') || dateString === 'recently' || dateString === 'just now')) return dateString;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    if (typeof dateString === 'string' && /^\d+$/.test(dateString)) {
      const num = parseInt(dateString, 10);
      const parsed = new Date(num > 1e11 ? num : num * 1000);
      if (!isNaN(parsed.getTime())) return formatFullDateTime(parsed);
    }
    return String(dateString);
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(date);
}

/** Formats into short date (e.g. 'Oct 19, 2026') */
export function formatShortDate(dateString?: string | number | Date | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

/** Formats a file size in bytes to a clean human-readable string (e.g. '14.2 KB') */
export function formatBytes(bytes?: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/** Shortens a 40-character Git SHA to standard 7 characters */
export function formatShortSha(sha: string): string {
  return sha ? sha.substring(0, 7) : '';
}

/** Formats a numeric count into compact engineering format (e.g. 1.2k, 45k) */
export function formatCompactNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
}

/** Formats date to 'DD/MM/YYYY, HH:mm:ss' to match Git mobile commit inspection screenshot */
export function formatCommitDateTime(dateInput?: string | number | Date | null): string {
  if (!dateInput) return '—';
  let date: Date;
  if (dateInput instanceof Date) {
    date = dateInput;
  } else if (typeof dateInput === 'number') {
    date = new Date(dateInput > 1e11 ? dateInput : dateInput * 1000);
  } else {
    const trimmed = String(dateInput).trim();
    const num = parseInt(trimmed, 10);
    date = !isNaN(num) && /^\d+$/.test(trimmed) ? new Date(num > 1e11 ? num : num * 1000) : new Date(trimmed);
  }
  if (isNaN(date.getTime())) return String(dateInput);

  const pad = (n: number) => n.toString().padStart(2, '0');
  const d = pad(date.getDate());
  const m = pad(date.getMonth() + 1);
  const y = date.getFullYear();
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${d}/${m}/${y},  ${hh}:${mm}:${ss}`;
}
