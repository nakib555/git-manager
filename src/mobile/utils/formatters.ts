/**
 * Formats an ISO date string into standard human-readable relative time (e.g. '2 hours ago', '3 days ago')
 */
export function formatRelativeTime(dateString: string | number | Date): string {
  if (!dateString) return 'recently';

  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (isNaN(diffInSeconds) || diffInSeconds < 0) return 'just now';
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;

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
 * Shortens a 40-character Git SHA to the standard 7 characters
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
