/**
 * Formats an ISO date string or timestamp into clean human-readable relative time (e.g. '2m ago', '3h ago', '4d ago')
 */
export function formatRelativeTime(dateString?: string | number | Date | null): string {
  if (!dateString) return 'recently';

  // If already relative formatted
  if (typeof dateString === 'string') {
    if (dateString.endsWith('ago') || dateString === 'just now' || dateString === 'recently') {
      return dateString;
    }
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    // If it's a numeric string (unix epoch)
    if (typeof dateString === 'string' && /^\d+$/.test(dateString)) {
      const num = parseInt(dateString, 10);
      const parsed = new Date(num > 1e11 ? num : num * 1000);
      if (!isNaN(parsed.getTime())) {
        return formatRelativeTime(parsed);
      }
    }
    return 'recently';
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 0) return 'just now';
  if (diffInSeconds < 60) return `${Math.max(1, diffInSeconds)}s ago`;

  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;

  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

/**
 * Formats a date into full localized string (e.g. 'Oct 19, 2026, 8:42 AM')
 */
export function formatFullDateTime(dateString?: string | number | Date | null): string {
  if (!dateString) return 'Unknown date';
  if (typeof dateString === 'string' && (dateString.endsWith('ago') || dateString === 'recently' || dateString === 'just now')) {
    return dateString;
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    if (typeof dateString === 'string' && /^\d+$/.test(dateString)) {
      const num = parseInt(dateString, 10);
      const parsed = new Date(num > 1e11 ? num : num * 1000);
      if (!isNaN(parsed.getTime())) {
        return formatFullDateTime(parsed);
      }
    }
    return String(dateString);
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

/**
 * Formats into short date (e.g. 'Oct 19, 2026')
 */
export function formatShortDate(dateString?: string | number | Date | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

/**
 * Formats a file size in bytes to a clean human-readable string (e.g. '14.2 KB')
 */
export function formatBytes(bytes?: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Shortens a 40-character Git SHA to standard 7 characters
 */
export function formatShortSha(sha: string): string {
  if (!sha) return '';
  return sha.substring(0, 7);
}

/**
 * Formats a numeric count into compact engineering format (e.g. 1.2k, 45k)
 */
export function formatCompactNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
}
