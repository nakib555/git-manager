import { GitHubUser } from '../types';
import { getSvgAvatar } from '../utils/avatarUtils';

export const DEMO_USER: GitHubUser = {
  login: 'octodev',
  name: 'Alex Chen',
  avatar_url: getSvgAvatar('Alex Chen', 215),
  followers: 482,
  following: 129,
  bio: 'Staff Systems Engineer • Open Source Contributor • Rust & TypeScript',
};
