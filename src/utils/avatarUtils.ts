/**
 * Utility to generate self-contained SVG data URIs for user avatars
 * Eliminates unverified third-party external CDN image URLs.
 */
export function getSvgAvatar(name: string, hue = 215): string {
  const initials = (name || 'Dev')
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <defs>
      <linearGradient id="g_${hue}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="hsl(${hue}, 70%, 55%)"/>
        <stop offset="100%" stop-color="hsl(${(hue + 35) % 360}, 65%, 40%)"/>
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="50" fill="url(#g_${hue})"/>
    <text x="50" y="54" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="36" font-weight="700" fill="#ffffff" text-anchor="middle" dominant-baseline="middle" letter-spacing="-0.5">${initials}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
