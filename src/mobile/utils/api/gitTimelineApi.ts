import { TimelineEventItem } from './gitApiTypes';
import { DEMO_ACTIVITY_EVENTS } from '../../../data/demoData';

export async function fetchTimelineEvents({
  username,
  repoOwner,
  repoName,
  token,
}: {
  username?: string | null;
  repoOwner?: string | null;
  repoName?: string | null;
  token?: string | null;
}): Promise<TimelineEventItem[]> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (token) {
    headers['Authorization'] = token.startsWith('ghp_') || token.startsWith('github_pat_') || token.startsWith('gho_') || token.startsWith('Bearer ')
      ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`)
      : `token ${token}`;
  } else {
    return DEMO_ACTIVITY_EVENTS;
  }

  let url = '';
  if (username && username !== 'guest') {
    url = `https://api.github.com/users/${username}/events?per_page=30`;
  } else if (repoOwner && repoName) {
    url = `https://api.github.com/repos/${repoOwner}/${repoName}/events?per_page=30`;
  } else {
    url = `https://api.github.com/events?per_page=30`;
  }

  try {
    const res = await fetch(url, { headers });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data.map((item: any) => ({
          id: item.id,
          type: item.type,
          actor: {
            login: item.actor?.login || 'User',
            avatarUrl: item.actor?.avatar_url,
          },
          repo: {
            name: item.repo?.name || 'repository',
          },
          createdAt: item.created_at,
          payload: item.payload || {},
        }));
      }
    }
  } catch (err) {
    console.warn('[GitAPI] Error fetching timeline events:', err);
  }

  return [];
}
