import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  AppContextType,
  AppState,
  Screen,
  GitHubRepo,
  GitHubUser,
} from "./types";
export const INITIAL_MOCK_REPOS: GitHubRepo[] = [
  {
    id: 1001,
    name: "react-ui-components",
    private: false,
    description: "A collection of reusable React UI components built with Tailwind CSS.",
    language: "TypeScript",
    pushed_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 1002,
    name: "backend-api-service",
    private: true,
    description: "Core backend service for handling user authentication and data processing.",
    language: "Go",
    pushed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: 1003,
    name: "data-analysis-scripts",
    private: false,
    description: "Python scripts for analyzing sales data and generating weekly reports.",
    language: "Python",
    pushed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
  },
  {
    id: 1004,
    name: "mobile-app-frontend",
    private: true,
    description: "React Native frontend for the customer-facing mobile application.",
    language: "TypeScript",
    pushed_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  }
];
export const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  if (diffInHours < 1) {
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    return `${Math.max(1, diffInMins)}m ago`;
  }
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};
const getLocalRepos = (): GitHubRepo[] => {
  const local = localStorage.getItem("localRepos");
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (parsed && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {}
  }
  return INITIAL_MOCK_REPOS;
};
export const sanitizeGitHubUser = (user: any): GitHubUser | null => {
  if (!user) return null;
  if (user.login === "nakib555" || user.login?.toLowerCase() === "nakib555") {
    return {
      ...user,
      login: "git-manager-workstation",
      name: user.name === "Nakib Prince" ? "Git Manager Workstation" : (user.name || "Git Manager Workstation")
    };
  }
  return user;
};
export const getLocalRepoDetails = (
  repoId: string,
  type: "commits" | "branches" | "prs" | "files",
) => {
  const key = `local_details_${repoId}_${type}`;
  const local = localStorage.getItem(key);
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (parsed && parsed.length > 0) return parsed;
    } catch (e) {}
  }
  
  // Return dummy data if empty
  if (type === "commits") {
    return [
      {
        hash: "a1b2c3d4e5f6",
        fullHash: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0",
        msg: "Initial commit",
        author: "John Doe",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
        files: [{ filename: "README.md", status: "added", additions: 50, deletions: 0 }]
      },
      {
        hash: "f6e5d4c3b2a1",
        fullHash: "f6e5d4c3b2a10987654321fedcba987654321012",
        msg: "Update documentation and add setup guide",
        author: "Jane Smith",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        files: [{ filename: "README.md", status: "modified", additions: 15, deletions: 5 }]
      },
      {
        hash: "1a2b3c4d5e6f",
        fullHash: "1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
        msg: "Fix critical bug in authentication flow",
        author: "Alex Johnson",
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        files: [{ filename: "src/auth.ts", status: "modified", additions: 10, deletions: 2 }, { filename: "tests/auth.test.ts", status: "modified", additions: 25, deletions: 0 }]
      }
    ];
  } else if (type === "branches") {
    return [
      { name: "main", isDefault: true, lastCommit: "Fix critical bug in authentication flow", lastCommitTime: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
      { name: "feature/new-dashboard", isDefault: false, lastCommit: "Add initial dashboard layout", lastCommitTime: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
      { name: "hotfix/login-issue", isDefault: false, lastCommit: "Fix login token expiration", lastCommitTime: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() }
    ];
  } else if (type === "prs") {
    return [
      { id: 101, title: "Feature: New Analytics Dashboard", author: "Jane Smith", status: "Open", sourceBranch: "feature/new-dashboard", targetBranch: "main", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
      { id: 102, title: "Hotfix: Resolve login timeout", author: "John Doe", status: "Merged", sourceBranch: "hotfix/login-issue", targetBranch: "main", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString() },
      { id: 103, title: "Update dependencies", author: "Dependabot", status: "Closed", sourceBranch: "deps/update-react", targetBranch: "main", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString() }
    ];
  } else if (type === "files") {
    return [
      { name: "src", type: "dir", path: "src" },
      { name: "public", type: "dir", path: "public" },
      { name: "package.json", type: "file", path: "package.json", size: 1024, lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() },
      { name: "README.md", type: "file", path: "README.md", size: 2048, lastModified: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
      { name: "vite.config.ts", type: "file", path: "vite.config.ts", size: 512, lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString() }
    ];
  }
  
  return [];
};
const defaultState: AppState = {
  currentScreen: (localStorage.getItem("currentScreen") as Screen) || "dash",
  currentRepo: localStorage.getItem("currentRepo") || "",
  currentRepoOwner: localStorage.getItem("currentRepoOwner") || "",
  isActionSheetOpen: false,
  isDrawerOpen: false,
  toastMessage: null,
  isSearchFocused: false,
  theme: (localStorage.getItem("theme") as "dark" | "light") || "light",
  githubToken: localStorage.getItem("githubToken") || null,
  githubUser: localStorage.getItem("githubUser") ? sanitizeGitHubUser(JSON.parse(localStorage.getItem("githubUser")!)) : null,
  githubRepos: getLocalRepos(),
  activeCommits: getLocalRepoDetails(localStorage.getItem("currentRepo") || "", "commits"),
  activePRs: getLocalRepoDetails(localStorage.getItem("currentRepo") || "", "prs"),
  activeBranches: getLocalRepoDetails(localStorage.getItem("currentRepo") || "", "branches"),
  activeFiles: getLocalRepoDetails(localStorage.getItem("currentRepo") || "", "files"),
  activeLanguages: {},
  isLoadingRepoDetails: false,
  activeModal: null,
  sessionCommitsCount: parseInt(
    localStorage.getItem("sessionCommitsCount") || "0",
    10,
  ),
  recentClones: JSON.parse(localStorage.getItem("recentClones") || "[]"),
};
const AppContext = createContext<AppContextType | undefined>(undefined);
export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AppState>(defaultState);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  useEffect(() => {
    const sse = new EventSource('/api/events');
    sse.addEventListener('github', (e) => {
      const data = JSON.parse(e.data);
      console.log('Received GitHub webhook event:', data.event);
      setRefreshTrigger(prev => prev + 1);
    });
    return () => sse.close();
  }, []);
  // Apply theme to both document root and body
  useEffect(() => {
    if (state.theme === "dark") {
      document.documentElement.classList.add("dark-theme");
      document.body.classList.add("dark-theme");
    } else {
      document.documentElement.classList.remove("dark-theme");
      document.body.classList.remove("dark-theme");
    }
  }, [state.theme]);
  const toggleTheme = () => {
    setState((prev) => {
      const newTheme = prev.theme === "dark" ? "light" : "dark";
      localStorage.setItem("theme", newTheme);
      return { ...prev, theme: newTheme };
    });
  };
  const connectGitHub = async () => {
    try {
      console.log("Initiating GitHub OAuth flow...");
      const response = await fetch("/api/auth/url");
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to get auth URL:", errorData);
        openModal("oauth_setup");
        if (errorData.error && errorData.error.includes("GITHUB_CLIENT_ID")) {
          throw new Error("GitHub OAuth is not configured yet. Opening fallback Personal Access Token (PAT) login...");
        }
        throw new Error(errorData.error || "Failed to get auth URL");
      }
      const { url } = await response.json();
      console.log("Redirecting to OAuth URL:", url);
      window.location.href = url;
    } catch (error: any) {
      console.error("OAuth error:", error);
      showToast(error.message || "Error connecting to GitHub");
    }
  };
  const disconnectGitHub = () => {
    console.log("Disconnecting GitHub and clearing token");
    localStorage.removeItem("githubToken");
    localStorage.removeItem("githubUser");
    localStorage.removeItem("currentRepo");
    localStorage.removeItem("currentRepoOwner");
    setState((prev) => ({
      ...prev,
      githubToken: null,
      githubUser: null,
      githubRepos: getLocalRepos(),
      currentRepo: null,
      currentRepoOwner: null,
    }));
    showToast("GitHub disconnected");
  };
  const setManualToken = (token: string) => {
    console.log("Setting manual GitHub token");
    localStorage.setItem("githubToken", token);
    setState((prev) => ({ ...prev, githubToken: token }));
    showToast("GitHub token saved manually");
  };
  const fetchGitHubData = async (token: string) => {
    try {
      console.log("Fetching GitHub user data with token:", token.substring(0, 4) + "...");
      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      };
      // Fetch user profile
      const userRes = await fetch("https://api.github.com/user", { headers });
      console.log("GitHub user profile response status:", userRes.status);
      if (!userRes.ok) {
        let errorMsg = `Status ${userRes.status}`;
        try {
          const errBody = await userRes.json();
          console.error("GitHub user profile error response:", errBody);
          if (errBody.message) {
            errorMsg = errBody.message;
          }
        } catch (_) {}
        throw new Error(`Profile: ${errorMsg}`);
      }
      const userData = await userRes.json();
      const sanitizedUser = sanitizeGitHubUser(userData);
      console.log("GitHub user data fetched successfully", sanitizedUser?.login);
      if (sanitizedUser) {
        localStorage.setItem("githubUser", JSON.stringify(sanitizedUser));
      }
      // Fetch user repos
      const reposRes = await fetch(
        "https://api.github.com/user/repos?sort=updated&per_page=20",
        { headers },
      );
      console.log("GitHub user repos response status:", reposRes.status);
      if (!reposRes.ok) {
        let errorMsg = `Status ${reposRes.status}`;
        try {
          const errBody = await reposRes.json();
          console.error("GitHub user repos error response:", errBody);
          if (errBody.message) {
            errorMsg = errBody.message;
          }
        } catch (_) {}
        throw new Error(`Repositories: ${errorMsg}`);
      }
      const reposData = await reposRes.json();
      console.log(`Fetched ${reposData.length} GitHub repositories`);
      setState((prev) => ({
        ...prev,
        githubUser: sanitizedUser,
        githubRepos: reposData,
      }));
    } catch (error: any) {
      console.error("GitHub fetch error:", error);
      showToast(`Error loading GitHub data: ${error.message || error}`);
      // If unauthorized, the token might be invalid or revoked
      if (error.message.includes("401") || error.message.includes("Bad credentials")) {
        console.warn("GitHub token seems invalid or expired. Consider clearing it.");
      }
    }
  };
  const fetchRepoDetails = async (repoName: string, owner: string) => {
    if (!state.githubToken) return;
    console.log(`Fetching repo details for ${owner}/${repoName}`);
    setState((prev) => ({ ...prev, isLoadingRepoDetails: true }));
    try {
      const token = state.githubToken;
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      // Ensure webhook is setup
      try {
        const hooksRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/hooks`, { headers });
        if (hooksRes.ok) {
          const hooks = await hooksRes.json();
          const webhookUrl = `${window.location.origin}/api/webhooks/github`;
          const hasHook = hooks.some((hook: any) => hook.config.url === webhookUrl);
          if (!hasHook) {
            console.log(`Setting up webhook for ${owner}/${repoName} at ${webhookUrl}`);
            await fetch(`https://api.github.com/repos/${owner}/${repoName}/hooks`, {
              method: 'POST',
              headers: { ...headers, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: 'web',
                active: true,
                events: ['push', 'pull_request', 'issues', 'issue_comment', 'create', 'delete'],
                config: { url: webhookUrl, content_type: 'json' }
              })
            });
          }
        }
      } catch (e) {
        console.warn("Failed to ensure webhook:", e);
      }
      // 1. Fetch Commits
      console.log(`Fetching commits for ${owner}/${repoName}...`);
      const commitsRes = await fetch(
        `https://api.github.com/repos/${owner}/${repoName}/commits?per_page=15`,
        { headers },
      );
      if (!commitsRes.ok) {
        console.warn(`Commits fetch failed with status: ${commitsRes.status}`);
      }
      let commitsData = [];
      if (commitsRes.ok) {
        const rawCommits = await commitsRes.json();
        commitsData = await Promise.all(
          rawCommits.map(async (c: any, index: number) => {
            let add = "+0";
            let del = "-0";
            // Fetch detailed commit stats for top commits to get real additions/deletions
            if (index < 10 && c.url) {
              try {
                const detailRes = await fetch(c.url, { headers });
                if (detailRes.ok) {
                  const detailData = await detailRes.json();
                  if (detailData.stats) {
                    add = `+${detailData.stats.additions || 0}`;
                    del = `-${detailData.stats.deletions || 0}`;
                  }
                }
              } catch (_) {}
            }
            return {
              hash: c.sha.substring(0, 7),
              fullHash: c.sha,
              timestamp: c.commit.author?.date || c.commit.committer?.date || new Date().toISOString(),
              msg: c.commit.message,
              author: c.commit.author?.name || c.author?.login || "GitHub User",
              time: formatTime(c.commit.author?.date || c.commit.committer?.date),
              add,
              del,
              isPrimary: true,
            };
          })
        );
      }
      // 2. Fetch Branches
      const branchesRes = await fetch(
        `https://api.github.com/repos/${owner}/${repoName}/branches?per_page=15`,
        { headers },
      );
      let branchesData = [];
      if (branchesRes.ok) {
        const rawBranches = await branchesRes.json();
        branchesData = rawBranches.map((b: any) => ({
          name: b.name,
          desc: `Branch head: ${b.commit.sha.substring(0, 7)}`,
          isDefault: b.name === "main" || b.name === "master",
          borderColor:
            b.name === "main" || b.name === "master"
              ? "#38BDF8"
              : "transparent",
        }));
      }
      // 3. Fetch PRs
      const prsRes = await fetch(
        `https://api.github.com/repos/${owner}/${repoName}/pulls?state=all&per_page=15`,
        { headers },
      );
      let prsData = [];
      if (prsRes.ok) {
        const rawPRs = await prsRes.json();
        prsData = rawPRs.map((p: any) => ({
          id: p.number,
          title: p.title,
          desc: p.body || "No description provided",
          author: p.user?.login || "unknown",
          avatar: p.user?.avatar_url || "",
          time: formatTime(p.created_at),
          status: p.draft
            ? "Draft"
            : p.state === "closed"
              ? p.merged_at
                ? "Merged"
                : "Closed"
              : "Open",
          comments: p.comments || 0,
          hasConflicts: false,
          source: p.head?.ref || "feature-branch",
          target: p.base?.ref || "main",
        }));
      }
      // 4. Fetch Languages
      const langRes = await fetch(
        `https://api.github.com/repos/${owner}/${repoName}/languages`,
        { headers },
      );
      let langData: Record<string, number> = {};
      if (langRes.ok) {
        langData = await langRes.json();
      }
      // 5. Fetch Files
      const filesRes = await fetch(
        `https://api.github.com/repos/${owner}/${repoName}/git/trees/HEAD?recursive=1`,
        { headers },
      );
      let filesData = [];
      if (filesRes.ok) {
        const rawFiles = await filesRes.json();
        if (rawFiles.tree) {
          filesData = rawFiles.tree.map((f: any) => ({
            name: f.path,
            type: f.type === "tree" ? "dir" : "file",
            isCurrent:
              f.path.toLowerCase().endsWith(".tsx") ||
              f.path.toLowerCase().endsWith(".md"),
          }));
        } else {
          filesData = rawFiles.map((f: any) => ({
            name: f.name,
            type: f.type === "dir" ? "dir" : "file",
            isCurrent:
              f.name.toLowerCase().endsWith(".tsx") ||
              f.name.toLowerCase().endsWith(".md"),
          }));
        }
      }
      // Merge any local commits created in the app for this repository
      const localCommits = getLocalRepoDetails(repoName, "commits");
      const uniqueLocal = localCommits.filter(
        (lc: any) => !commitsData.some((gc: any) => gc.hash === lc.hash),
      );
      const mergedCommits = [...uniqueLocal, ...commitsData];
      // Cache all fetched/merged details in localStorage for persistence and offline display
      localStorage.setItem(
        `local_details_${repoName}_commits`,
        JSON.stringify(mergedCommits),
      );
      if (branchesData.length) {
        localStorage.setItem(
          `local_details_${repoName}_branches`,
          JSON.stringify(branchesData),
        );
      }
      if (prsData.length) {
        localStorage.setItem(
          `local_details_${repoName}_prs`,
          JSON.stringify(prsData),
        );
      }
      if (filesData.length) {
        localStorage.setItem(
          `local_details_${repoName}_files`,
          JSON.stringify(filesData),
        );
      }
      setState((prev) => ({
        ...prev,
        activeCommits: mergedCommits,
        activeBranches: branchesData.length
          ? branchesData
          : getLocalRepoDetails(repoName, "branches"),
        activePRs: prsData.length
          ? prsData
          : getLocalRepoDetails(repoName, "prs"),
        activeFiles: filesData.length
          ? filesData
          : getLocalRepoDetails(repoName, "files"),
        activeLanguages: langData,
        isLoadingRepoDetails: false,
      }));
    } catch (error) {
      console.error("Error fetching repo details:", error);
      setState((prev) => ({
        ...prev,
        activeCommits: getLocalRepoDetails(repoName, "commits"),
        activeBranches: getLocalRepoDetails(repoName, "branches"),
        activePRs: getLocalRepoDetails(repoName, "prs"),
        activeFiles: getLocalRepoDetails(repoName, "files"),
        activeLanguages: {},
        isLoadingRepoDetails: false,
      }));
    }
  };
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (
        !origin.endsWith(".run.app") && !origin.includes("localhost") && !origin.endsWith(".workers.dev") && !origin.endsWith(".pages.dev")
      ) {
        return;
      }
      if (event.data?.type === "OAUTH_AUTH_SUCCESS") {
        console.log("Received OAUTH_AUTH_SUCCESS from window message", event.data);
        const token = event.data.token;
        if (token && token !== "undefined" && token !== "null") {
          localStorage.setItem("githubToken", token);
          setState((prev) => ({ ...prev, githubToken: token }));
          showToast("Successfully connected to GitHub");
        } else {
          console.error("Received invalid token from OAuth callback", event.data);
          showToast("Failed to connect to GitHub. Invalid token received.");
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);
  useEffect(() => {
    if (state.githubToken) {
      fetchGitHubData(state.githubToken);
    }
  }, [state.githubToken, refreshTrigger]);
  useEffect(() => {
    if (state.currentRepo) {
      if (
        state.githubToken && state.currentRepoOwner
      ) {
        fetchRepoDetails(state.currentRepo, state.currentRepoOwner);
      } else {
        setState((prev) => ({
          ...prev,
          activeCommits: getLocalRepoDetails(prev.currentRepo!, "commits"),
          activeBranches: getLocalRepoDetails(prev.currentRepo!, "branches"),
          activePRs: getLocalRepoDetails(prev.currentRepo!, "prs"),
          activeFiles: getLocalRepoDetails(prev.currentRepo!, "files"),
          activeLanguages: {},
          isLoadingRepoDetails: false,
        }));
      }
    }
  }, [state.currentRepo, state.githubToken, refreshTrigger]);
  const navigate = (screen: Screen) => {
    localStorage.setItem("currentScreen", screen);
    setState((prev) => ({ ...prev, currentScreen: screen }));
  };
  const openRepo = (repoName: string, owner: string | null = null) => {
    setState((prev) => {
      const actualOwner =
        owner || (prev.githubToken ? prev.githubUser?.login : null);
      localStorage.setItem("currentRepo", repoName);
      localStorage.setItem("currentRepoOwner", actualOwner);
      localStorage.setItem("currentScreen", "files");
      return {
        ...prev,
        currentRepo: repoName,
        currentRepoOwner: actualOwner,
        currentScreen: "files",
      };
    });
  };
  const openActionSheet = () =>
    setState((prev) => ({ ...prev, isActionSheetOpen: true }));
  const closeActionSheet = () =>
    setState((prev) => ({ ...prev, isActionSheetOpen: false }));
  const openDrawer = () =>
    setState((prev) => ({ ...prev, isDrawerOpen: true }));
  const closeDrawer = () =>
    setState((prev) => ({ ...prev, isDrawerOpen: false }));
  const closeModals = () =>
    setState((prev) => ({
      ...prev,
      isActionSheetOpen: false,
      isDrawerOpen: false,
      activeModal: null,
    }));
  const setSearchFocus = (focus: boolean) =>
    setState((prev) => ({ ...prev, isSearchFocused: focus }));
  const showToast = (msg: string) => {
    setState((prev) => ({ ...prev, toastMessage: msg }));
  };
  const openModal = (
    modalType: "repo" | "branch" | "pr" | "commit" | "oauth_setup",
  ) => {
    setState((prev) => ({
      ...prev,
      activeModal: modalType,
      isActionSheetOpen: false,
    }));
  };
  const closeModal = () => {
    setState((prev) => ({ ...prev, activeModal: null }));
  };
  const addRecentClone = (clone: { name: string; url: string; dest: string; timestamp: number }) => {
    setState((prev) => {
      const clones = [clone, ...prev.recentClones.filter(c => c.url !== clone.url)].slice(0, 5);
      localStorage.setItem("recentClones", JSON.stringify(clones));
      return { ...prev, recentClones: clones };
    });
  };

  const cloneRepository = async (repo: { url: string; destFolder: string; branch: string; shallow: boolean; submodules: boolean }) => {
    let owner = 'custom-owner';
    let name = 'custom-repo';
    try {
      const cleanUrl = repo.url.trim().replace(/\.git$/, '');
      if (cleanUrl.startsWith('git@github.com:')) {
        const parts = cleanUrl.replace('git@github.com:', '').split('/');
        if (parts.length >= 2) {
          owner = parts[0];
          name = parts[1];
        }
      } else {
        const urlStr = cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`;
        const urlObj = new URL(urlStr);
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        if (pathParts.length >= 2) {
          owner = pathParts[pathParts.length - 2];
          name = pathParts[pathParts.length - 1];
        } else if (pathParts.length === 1) {
          name = pathParts[0];
        }
      }
    } catch (e) {
      const parts = repo.url.split('/');
      if (parts.length >= 2) {
        owner = parts[parts.length - 2];
        name = parts[parts.length - 1].replace(/\.git$/, '');
      } else if (parts.length === 1) {
        name = parts[0].replace(/\.git$/, '');
      }
    }

    addRecentClone({
      name,
      url: repo.url,
      dest: repo.destFolder,
      timestamp: Date.now()
    });

    const newRepo: any = {
      id: Date.now(),
      name,
      private: false,
      description: `Cloned from ${repo.url}`,
      language: 'TypeScript',
      pushed_at: new Date().toISOString(),
      owner: {
        login: owner
      }
    };

    // If we have a token, attempt to fetch actual repository info to seed localStorage
    let fetchedCommits = null;
    let fetchedBranches = null;
    let fetchedPrs = null;
    let fetchedFiles = null;

    if (state.githubToken) {
      const headers = { Authorization: `Bearer ${state.githubToken}` };
      try {
        // Fetch commits
        const commitsRes = await fetch(`https://api.github.com/repos/${owner}/${name}/commits?per_page=15`, { headers });
        if (commitsRes.ok) {
          const rawCommits = await commitsRes.json();
          fetchedCommits = rawCommits.map((c: any) => ({
            hash: c.sha.substring(0, 7),
            fullHash: c.sha,
            msg: c.commit.message,
            author: c.commit.author.name || c.commit.author.email || "Author",
            timestamp: c.commit.author.date,
            files: []
          }));
        }

        // Fetch branches
        const branchesRes = await fetch(`https://api.github.com/repos/${owner}/${name}/branches?per_page=15`, { headers });
        if (branchesRes.ok) {
          const rawBranches = await branchesRes.json();
          fetchedBranches = rawBranches.map((b: any) => ({
            name: b.name,
            isDefault: b.name === (repo.branch || 'main'),
            lastCommit: b.commit.sha.substring(0, 7),
            lastCommitTime: new Date().toISOString()
          }));
        }

        // Fetch PRs
        const prsRes = await fetch(`https://api.github.com/repos/${owner}/${name}/pulls?state=all&per_page=15`, { headers });
        if (prsRes.ok) {
          const rawPrs = await prsRes.json();
          fetchedPrs = rawPrs.map((p: any) => ({
            id: p.number,
            title: p.title,
            author: p.user?.login || "User",
            status: p.state === 'open' ? 'Open' : (p.merged_at ? 'Merged' : 'Closed'),
            sourceBranch: p.head?.ref || "source",
            targetBranch: p.base?.ref || "main",
            createdAt: p.created_at
          }));
        }

        // Fetch Files
        const filesRes = await fetch(`https://api.github.com/repos/${owner}/${name}/git/trees/HEAD?recursive=1`, { headers });
        if (filesRes.ok) {
          const treeData = await filesRes.json();
          fetchedFiles = treeData.tree.map((item: any) => ({
            name: item.path,
            type: item.type === 'blob' ? 'file' : 'dir',
            path: item.path,
            size: item.size || 0,
            lastModified: new Date().toISOString()
          }));
        }
      } catch (e) {
        console.warn("Error fetching real Git repository metadata:", e);
      }
    }

    if (fetchedFiles) {
      localStorage.setItem(`local_details_${name}_files`, JSON.stringify(fetchedFiles));
      localStorage.setItem(`local_details_${name}_commits`, JSON.stringify(fetchedCommits || []));
      localStorage.setItem(`local_details_${name}_branches`, JSON.stringify(fetchedBranches || []));
      localStorage.setItem(`local_details_${name}_prs`, JSON.stringify(fetchedPrs || []));
    } else {
      const getHash = () => Math.random().toString(16).substring(2, 9);
      const getFullHash = () => getHash() + getHash() + getHash() + getHash() + getHash() + getHash();
      
      // Offline/local backup custom data generator based on name
      let files = [
        { name: "README.md", type: "file", path: "README.md", size: 1450, lastModified: new Date().toISOString() },
        { name: "package.json", type: "file", path: "package.json", size: 840, lastModified: new Date().toISOString() },
        { name: ".gitignore", type: "file", path: ".gitignore", size: 210, lastModified: new Date().toISOString() },
        { name: "src", type: "dir", path: "src" },
        { name: "src/index.ts", type: "file", path: "src/index.ts", size: 450, lastModified: new Date().toISOString() },
      ];

      let commits = [
        {
          hash: getHash(),
          fullHash: getFullHash(),
          msg: "Initial commit",
          author: "Git Manager Workstation",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
          files: [{ filename: "README.md", status: "added", additions: 50, deletions: 0 }]
        },
        {
          hash: getHash(),
          fullHash: getFullHash(),
          msg: `Set up basic architecture for ${name}`,
          author: "Git Manager Workstation",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
          files: [{ filename: "package.json", status: "added", additions: 25, deletions: 0 }, { filename: "src/index.ts", status: "added", additions: 15, deletions: 0 }]
        },
        {
          hash: getHash(),
          fullHash: getFullHash(),
          msg: "Improve README layout and update configuration",
          author: "Git Manager Workstation",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          files: [{ filename: "README.md", status: "modified", additions: 12, deletions: 2 }]
        }
      ];

      let branches = [
        { name: "main", isDefault: true, lastCommit: "Improve README layout and update configuration", lastCommitTime: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString() },
        { name: "develop", isDefault: false, lastCommit: "Set up basic architecture", lastCommitTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() },
      ];

      let prs = [
        { id: 101, title: `Configure CI/CD pipelines for ${name}`, author: "Git Manager Workstation", status: "Open", sourceBranch: "develop", targetBranch: "main", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() }
      ];

      const lower = name.toLowerCase();
      if (lower.includes('react') || lower.includes('ui') || lower.includes('frontend')) {
        files = [
          { name: "README.md", type: "file", path: "README.md", size: 1820, lastModified: new Date().toISOString() },
          { name: "package.json", type: "file", path: "package.json", size: 1120, lastModified: new Date().toISOString() },
          { name: "vite.config.ts", type: "file", path: "vite.config.ts", size: 420, lastModified: new Date().toISOString() },
          { name: "src", type: "dir", path: "src" },
          { name: "src/main.tsx", type: "file", path: "src/main.tsx", size: 340, lastModified: new Date().toISOString() },
          { name: "src/App.tsx", type: "file", path: "src/App.tsx", size: 1420, lastModified: new Date().toISOString() },
          { name: "src/components", type: "dir", path: "src/components" },
          { name: "src/components/Button.tsx", type: "file", path: "src/components/Button.tsx", size: 850, lastModified: new Date().toISOString() },
          { name: "src/index.css", type: "file", path: "src/index.css", size: 230, lastModified: new Date().toISOString() },
        ];
        
        localStorage.setItem(`local_file_content_${name}_README.md`, `# ${name}\n\nA premium React component library compiled with Vite and Tailwind CSS.\n\n## Getting Started\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\``);
        localStorage.setItem(`local_file_content_${name}_package.json`, `{\n  "name": "${name}",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^18.2.0",\n    "react-dom": "^18.2.0",\n    "lucide-react": "^0.300.0"\n  }\n}`);
        localStorage.setItem(`local_file_content_${name}_vite.config.ts`, `import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\nexport default defineConfig({\n  plugins: [react()]\n});`);
        localStorage.setItem(`local_file_content_${name}_src/App.tsx`, `import React from 'react';\nimport { Button } from './components/Button';\n\nexport default function App() {\n  return (\n    <div className="p-8 text-center bg-gray-50 min-h-screen">\n      <h1 className="text-3xl font-extrabold tracking-tight">${name} Ready</h1>\n      <p className="text-gray-500 my-4">Your modern component workspace is ready.</p>\n      <Button>Explore Components</Button>\n    </div>\n  );\n}`);
        localStorage.setItem(`local_file_content_${name}_src/components/Button.tsx`, `import React from 'react';\n\nexport const Button: React.FC<{ children: React.ReactNode }> = ({ children }) => {\n  return (\n    <button className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors">\n      {children}\n    </button>\n  );\n};`);
      } else if (lower.includes('api') || lower.includes('backend') || lower.includes('server')) {
        files = [
          { name: "README.md", type: "file", path: "README.md", size: 1200, lastModified: new Date().toISOString() },
          { name: "package.json", type: "file", path: "package.json", size: 980, lastModified: new Date().toISOString() },
          { name: "src", type: "dir", path: "src" },
          { name: "src/server.ts", type: "file", path: "src/server.ts", size: 1280, lastModified: new Date().toISOString() },
          { name: "src/routes.ts", type: "file", path: "src/routes.ts", size: 840, lastModified: new Date().toISOString() },
          { name: "src/db.ts", type: "file", path: "src/db.ts", size: 520, lastModified: new Date().toISOString() },
        ];

        localStorage.setItem(`local_file_content_${name}_README.md`, `# ${name}\n\nScalable Express backend API server. Out of the box TypeScript setup.\n\n## REST API Endpoints\n- \`GET /api/health\`\n- \`GET /api/v1/users\``);
        localStorage.setItem(`local_file_content_${name}_package.json`, `{\n  "name": "${name}",\n  "version": "1.0.0",\n  "scripts": {\n    "start": "ts-node src/server.ts"\n  },\n  "dependencies": {\n    "express": "^4.18.2",\n    "cors": "^2.8.5"\n  }\n}`);
        localStorage.setItem(`local_file_content_${name}_src/server.ts`, `import express from 'express';\nimport cors from 'cors';\nimport { router } from './routes';\n\nconst app = express();\napp.use(cors());\napp.use(express.json());\napp.use('/api/v1', router);\n\napp.listen(3001, () => {\n  console.log('Server running on port 3001');\n});`);
        localStorage.setItem(`local_file_content_${name}_src/routes.ts`, `import { Router } from 'express';\n\nexport const router = Router();\n\nrouter.get('/health', (req, res) => {\n  res.json({ status: 'healthy', timestamp: new Date() });\n});`);
        localStorage.setItem(`local_file_content_${name}_src/db.ts`, `// Core DB client setup\nexport const db = {\n  connect: async () => {\n    console.log('Connected to local database instance.');\n  }\n};`);
      } else {
        localStorage.setItem(`local_file_content_${name}_README.md`, `# ${name}\n\nLocal cloned repository repository built and checked out via Git Manager Workstation.\n\nEnjoy browsing and making local commits, branches, and merging pull requests!`);
        localStorage.setItem(`local_file_content_${name}_package.json`, `{\n  "name": "${name}",\n  "version": "1.0.0",\n  "description": "Local workspace package."\n}`);
        localStorage.setItem(`local_file_content_${name}_.gitignore`, `node_modules/\ndist/\n.env\n.DS_Store`);
        localStorage.setItem(`local_file_content_${name}_src/index.ts`, `console.log("Welcome to ${name}!");\n// Implement your core application functions here`);
      }

      localStorage.setItem(`local_details_${name}_files`, JSON.stringify(files));
      localStorage.setItem(`local_details_${name}_commits`, JSON.stringify(commits));
      localStorage.setItem(`local_details_${name}_branches`, JSON.stringify(branches));
      localStorage.setItem(`local_details_${name}_prs`, JSON.stringify(prs));
    }

    setState((prev) => {
      const newRepos = [newRepo, ...prev.githubRepos.filter(r => r.name !== name)];
      localStorage.setItem("localRepos", JSON.stringify(newRepos));
      return { ...prev, githubRepos: newRepos };
    });
    
    showToast(`Repository ${name} cloned successfully`);
  };

  const createLocalRepo = async (repo: {
    name: string;
    desc: string;
    isPrivate: boolean;
    lang: string;
  }) => {
    if (state.githubToken) {
      try {
        const token = state.githubToken;
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github.v3+json",
        };
        const res = await fetch("https://api.github.com/user/repos", {
          method: "POST",
          headers,
          body: JSON.stringify({
            name: repo.name,
            description: repo.desc,
            private: repo.isPrivate,
            auto_init: true,
          }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `Status ${res.status}`);
        }
        const newRepoData = await res.json();
        showToast(`Repository '${repo.name}' created on GitHub!`);
        await fetchGitHubData(token);
      } catch (error: any) {
        console.error("Error creating GitHub repository:", error);
        showToast(`Failed to create repository: ${error.message || error}`);
      }
    } else {
      const newRepo: GitHubRepo = {
        id: Date.now(),
        name: repo.name,
        private: repo.isPrivate,
        description: repo.desc || "No description provided.",
        language: repo.lang || "TypeScript",
        pushed_at: new Date().toISOString(),
      };
      const existing = localStorage.getItem("localRepos")
        ? JSON.parse(localStorage.getItem("localRepos")!)
        : INITIAL_MOCK_REPOS;
      const updated = [newRepo, ...existing];
      localStorage.setItem("localRepos", JSON.stringify(updated));
      // Create an initial commit for this repo so it's not empty
      const initialCommit = {
        hash: crypto.randomUUID().replace(/-/g, "").substring(0, 7),
        fullHash: crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "").substring(0, 8),
        msg: "Initial commit",
        author: state.githubUser?.name || state.githubUser?.login || "User",
        time: "Just now",
        add: "+1",
        del: "-0",
        isPrimary: true,
      };
      localStorage.setItem(
        `local_details_${repo.name}_commits`,
        JSON.stringify([initialCommit]),
      );
      setState((prev) => {
        const nextCount = prev.sessionCommitsCount + 1;
        localStorage.setItem("sessionCommitsCount", nextCount.toString());
        return {
          ...prev,
          githubRepos: updated,
          sessionCommitsCount: nextCount,
        };
      });
      showToast(`Repository '${repo.name}' created!`);
    }
  };
  const findBaseSha = async (
    owner: string,
    repo: string,
    headers: any,
  ): Promise<string> => {
    const defaultBranch =
      state.activeBranches.find((b) => b.isDefault)?.name || "main";
    try {
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${defaultBranch}`,
        { headers },
      );
      if (res.ok) {
        const data = await res.json();
        if (data?.object?.sha) return data.object.sha;
      }
    } catch (e) {
      console.warn("Failed to fetch default branch ref directly:", e);
    }
    try {
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/master`,
        { headers },
      );
      if (res.ok) {
        const data = await res.json();
        if (data?.object?.sha) return data.object.sha;
      }
    } catch (e) {}
    try {
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`,
        { headers },
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0 && data[0]?.sha) {
          return data[0].sha;
        }
      }
    } catch (e) {}
    throw new Error("Could not find a base commit/branch to branch off of.");
  };
  const createLocalBranch = async (branch: { name: string; desc: string }) => {
    if (!state.currentRepo) return;
    if (
      state.githubToken && state.currentRepoOwner
    ) {
      try {
        const token = state.githubToken;
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github.v3+json",
        };
        const owner = state.currentRepoOwner;
        const repo = state.currentRepo;
        const baseSha = await findBaseSha(owner, repo, headers);
        const branchName = branch.name.trim().replace(/\s+/g, "-");
        const res = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/git/refs`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              ref: `refs/heads/${branchName}`,
              sha: baseSha,
            }),
          },
        );
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `Status ${res.status}`);
        }
        showToast(`Branch '${branchName}' created on GitHub!`);
        await fetchRepoDetails(repo, owner);
      } catch (error: any) {
        console.error("Error creating GitHub branch:", error);
        showToast(`Failed to create branch: ${error.message || error}`);
      }
    } else {
      const key = `local_details_${state.currentRepo}_branches`;
      const current = getLocalRepoDetails(state.currentRepo, "branches");
      const newBranch = {
        name: branch.name,
        desc: branch.desc || "Active branch",
        isDefault: false,
      };
      const updated = [newBranch, ...current];
      localStorage.setItem(key, JSON.stringify(updated));
      setState((prev) => ({
        ...prev,
        activeBranches: updated,
      }));
      showToast(`Branch '${branch.name}' created!`);
    }
  };
  const createLocalPR = async (pr: {
    title: string;
    desc: string;
    source: string;
    target: string;
    isDraft?: boolean;
  }) => {
    if (!state.currentRepo) return;
    if (
      state.githubToken && state.currentRepoOwner
    ) {
      try {
        const token = state.githubToken;
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github.v3+json",
        };
        const owner = state.currentRepoOwner;
        const repo = state.currentRepo;
        const res = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/pulls`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              title: pr.title,
              body: pr.desc || "No description provided.",
              head: pr.source,
              base: pr.target,
              draft: pr.isDraft || false,
            }),
          },
        );
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          let errMsg = errData.message || `Status ${res.status}`;
          if (errData.errors && Array.isArray(errData.errors)) {
            const details = errData.errors.map((e: any) => e.message || e.code).filter(Boolean).join(", ");
            if (details) {
              errMsg = `${errMsg}: ${details}`;
            }
          }
          throw new Error(errMsg);
        }
        const prData = await res.json();
        showToast(`Pull Request #${prData.number} opened on GitHub!`);
        await fetchRepoDetails(repo, owner);
      } catch (error: any) {
        console.error("Error creating GitHub Pull Request:", error);
        showToast(`Failed to open Pull Request: ${error.message || error}`);
      }
    } else {
      const key = `local_details_${state.currentRepo}_prs`;
      const current = getLocalRepoDetails(state.currentRepo, "prs");
      const newPR = {
        id: current.length + 1,
        title: pr.title,
        desc: pr.desc || "No description provided.",
        author: state.githubUser?.login || "User",
        time: "Just now",
        status: pr.isDraft ? "Draft" : "Open",
        avatar: state.githubUser?.avatar_url || "",
        hasConflicts: false,
        source: pr.source || "feature-branch",
        target: pr.target || "main",
      };
      const updated = [newPR, ...current];
      localStorage.setItem(key, JSON.stringify(updated));
      setState((prev) => ({
        ...prev,
        activePRs: updated,
      }));
      showToast(`Pull Request #${newPR.id} opened!`);
    }
  };
  const updateLocalPRStatus = (prId: number, status: 'Open' | 'Merged' | 'Closed') => {
    if (!state.currentRepo) return;
    const key = `local_details_${state.currentRepo}_prs`;
    const current = getLocalRepoDetails(state.currentRepo, "prs");
    const updated = current.map((item: any) => {
      if (item.id === prId) {
        return { ...item, status };
      }
      return item;
    });
    localStorage.setItem(key, JSON.stringify(updated));
    setState((prev) => ({
      ...prev,
      activePRs: updated,
    }));
    showToast(`Pull Request #${prId} is now ${status}!`);
  };
  const createLocalCommit = async (commit: {
    msg: string;
    author: string;
    hash?: string;
    fullHash?: string;
    add?: string;
    del?: string;
    filePath?: string;
    fileContent?: string;
  }) => {
    if (!state.currentRepo) return;
    if (
      state.githubToken && state.currentRepoOwner
    ) {
      try {
        const token = state.githubToken;
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github.v3+json",
        };
        const owner = state.currentRepoOwner;
        const repo = state.currentRepo;
        const branch =
          state.activeBranches.find((b) => b.isDefault)?.name || "main";
        const path = commit.filePath?.trim() || "README.md";
        const contentStr =
          commit.fileContent ||
          `# ${repo}\n\nActivity log commit: ${commit.msg}\n\n_Committed via Git Manager App at ${new Date().toISOString()}_`;
        const utf8Bytes = new TextEncoder().encode(contentStr);
        let binaryStr = "";
        for (let i = 0; i < utf8Bytes.length; i++) {
          binaryStr += String.fromCharCode(utf8Bytes[i]);
        }
        const b64Content = btoa(binaryStr);
        let sha: string | undefined = undefined;
        try {
          const fileRes = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1/${path}?ref=${branch}`,
            { headers },
          );
          if (fileRes.ok) {
            const fileData = await fileRes.json();
            sha = fileData.sha;
          }
        } catch (e) {
          console.warn("File might not exist yet, creating a new one.", e);
        }
        const commitRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1/${path}`,
          {
            method: "PUT",
            headers,
            body: JSON.stringify({
              message: commit.msg,
              content: b64Content,
              sha,
              branch,
            }),
          },
        );
        if (!commitRes.ok) {
          const errData = await commitRes.json().catch(() => ({}));
          throw new Error(errData.message || `Status ${commitRes.status}`);
        }
        const commitData = await commitRes.json();
        showToast(
          `Commit successfully pushed to GitHub! SHA: ${commitData.commit.sha.substring(0, 7)}`,
        );
        await fetchRepoDetails(repo, owner);
      } catch (error: any) {
        console.error("Error committing to GitHub:", error);
        showToast(`Failed to commit to GitHub: ${error.message || error}`);
      }
    } else {
      const key = `local_details_${state.currentRepo}_commits`;
      const current = getLocalRepoDetails(state.currentRepo, "commits");
      const genHash = crypto.randomUUID().replace(/-/g, "").substring(0, 7);
      const newCommit = {
        hash: commit.hash || genHash,
        fullHash: commit.fullHash || (crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "").substring(0, 8)),
        msg: commit.msg,
        author:
          commit.author ||
          state.githubUser?.name ||
          state.githubUser?.login ||
          "User",
        time: "Just now",
        add: commit.add || "+1",
        del: commit.del || "-0",
        isPrimary: true,
      };
      const updatedLocal = [newCommit, ...current];
      localStorage.setItem(key, JSON.stringify(updatedLocal));
      const updatedUI = [newCommit, ...(state.activeCommits || [])];
      setState((prev) => {
        const nextCount = prev.sessionCommitsCount + 1;
        localStorage.setItem("sessionCommitsCount", nextCount.toString());
        return {
          ...prev,
          activeCommits: updatedUI,
          sessionCommitsCount: nextCount,
        };
      });
      showToast(`Committed: ${newCommit.hash}`);
    }
  };
  const editCommitMessage = async (hash: string, newMsg: string) => {
    if (!state.currentRepo) return;
    if (
      state.githubToken && state.currentRepoOwner
    ) {
      try {
        const token = state.githubToken;
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github.v3+json",
        };
        const owner = state.currentRepoOwner;
        const repo = state.currentRepo;
        const branch =
          state.activeBranches.find((b) => b.isDefault)?.name || "main";
        // 1. Get original commit
        const commitRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/git/commits/${hash}`,
          { headers },
        );
        if (!commitRes.ok) throw new Error("Failed to fetch commit details");
        const commitData = await commitRes.json();
        // 2. Create new commit
        const newCommitRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/git/commits`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              message: newMsg,
              tree: commitData.tree.sha,
              parents: commitData.parents.map((p: any) => p.sha),
            }),
          },
        );
        if (!newCommitRes.ok) throw new Error("Failed to create new commit");
        const newCommitData = await newCommitRes.json();
        // 3. Update branch ref
        const refRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`,
          {
            method: "PATCH",
            headers,
            body: JSON.stringify({
              sha: newCommitData.sha,
              force: true,
            }),
          },
        );
        if (!refRes.ok) throw new Error("Failed to update branch reference");
        showToast("Commit message updated on GitHub!");
        await fetchRepoDetails(repo, owner);
      } catch (error: any) {
        console.error("Error editing commit message:", error);
        showToast(`Failed to edit commit: ${error.message || error}`);
      }
    } else {
      const key = `local_details_${state.currentRepo}_commits`;
      const updatedCommits = state.activeCommits.map((c: any) => {
        if (c.hash === hash) {
          return { ...c, msg: newMsg };
        }
        return c;
      });
      localStorage.setItem(key, JSON.stringify(updatedCommits));
      setState((prev) => ({
        ...prev,
        activeCommits: updatedCommits,
      }));
      showToast(`Commit message updated!`);
    }
  };
  const deleteCommit = async (hash: string) => {
    if (!state.currentRepo) return;
    if (
      state.githubToken && state.currentRepoOwner
    ) {
      try {
        const token = state.githubToken;
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github.v3+json",
        };
        const owner = state.currentRepoOwner;
        const repo = state.currentRepo;
        const branch =
          state.activeBranches.find((b) => b.isDefault)?.name || "main";
        // 1. Get original commit
        const commitRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/git/commits/${hash}`,
          { headers },
        );
        if (!commitRes.ok) throw new Error("Failed to fetch commit details");
        const commitData = await commitRes.json();
        if (!commitData.parents || commitData.parents.length === 0) {
          throw new Error("Cannot delete initial commit");
        }
        const parentSha = commitData.parents[0].sha;
        // 2. Update branch ref to parent
        const refRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`,
          {
            method: "PATCH",
            headers,
            body: JSON.stringify({
              sha: parentSha,
              force: true,
            }),
          },
        );
        if (!refRes.ok) throw new Error("Failed to update branch reference");
        showToast("Commit deleted from GitHub!");
        await fetchRepoDetails(repo, owner);
      } catch (error: any) {
        console.error("Error deleting commit:", error);
        showToast(`Failed to delete commit: ${error.message || error}`);
      }
    } else {
      const key = `local_details_${state.currentRepo}_commits`;
      const updatedCommits = state.activeCommits.filter(
        (c: any) => c.hash !== hash,
      );
      localStorage.setItem(key, JSON.stringify(updatedCommits));
      setState((prev) => ({
        ...prev,
        activeCommits: updatedCommits,
      }));
      showToast(`Commit deleted successfully!`);
    }
  };
  const amendLatestCommit = (
    msg: string,
    contentOnly: boolean,
    messageOnly: boolean,
    changes?: { add?: string; del?: string },
  ) => {
    if (!state.currentRepo || state.activeCommits.length === 0) return;
    const key = `local_details_${state.currentRepo}_commits`;
    const updatedCommits = state.activeCommits.map((c: any, idx: number) => {
      if (idx === 0) {
        const updated = { ...c };
        if (!contentOnly) {
          updated.msg = msg;
        }
        if (!messageOnly) {
          updated.add = changes?.add || c.add || "+1";
          updated.del = changes?.del || c.del || "-0";
        }
        return updated;
      }
      return c;
    });
    localStorage.setItem(key, JSON.stringify(updatedCommits));
    setState((prev) => ({
      ...prev,
      activeCommits: updatedCommits,
    }));
    showToast(`Latest commit amended successfully!`);
  };
  const undoLatestCommit = () => {
    if (!state.currentRepo || state.activeCommits.length === 0) return;
    const key = `local_details_${state.currentRepo}_commits`;
    const updatedCommits = state.activeCommits.slice(1);
    localStorage.setItem(key, JSON.stringify(updatedCommits));
    setState((prev) => ({
      ...prev,
      activeCommits: updatedCommits,
    }));
    showToast(`Undone latest commit! Changes moved to index staging area.`);
  };
  const restoreFilesToCommit = (hash: string) => {
    if (!state.currentRepo) return;
    const key = `local_details_${state.currentRepo}_commits`;
    const genHash = crypto.randomUUID().replace(/-/g, "").substring(0, 7);
    const newCommit = {
      hash: genHash,
      fullHash: crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "").substring(0, 8),
      msg: `Restore files to match state at ${hash}`,
      author: state.githubUser?.name || state.githubUser?.login || "User",
      time: "Just now",
      add: `+0`,
      del: `-0`,
      isPrimary: true,
    };
    const updatedCommits = [newCommit, ...state.activeCommits];
    localStorage.setItem(key, JSON.stringify(updatedCommits));
    setState((prev) => ({
      ...prev,
      activeCommits: updatedCommits,
    }));
    showToast(`Restored files to ${hash}! Created new commit.`);
  };
  const resetBranchToCommit = (hash: string) => {
    if (!state.currentRepo) return;
    const key = `local_details_${state.currentRepo}_commits`;
    const targetIdx = state.activeCommits.findIndex(
      (c: any) => c.hash === hash,
    );
    if (targetIdx === -1) return;
    const updatedCommits = state.activeCommits.slice(targetIdx);
    localStorage.setItem(key, JSON.stringify(updatedCommits));
    setState((prev) => ({
      ...prev,
      activeCommits: updatedCommits,
    }));
    showToast(`Branch reset to ${hash}. Later commits removed.`);
  };
  const createBranchAtCommit = (hash: string, branchName: string) => {
    if (!state.currentRepo) return;
    const key = `local_details_${state.currentRepo}_branches`;
    const current = getLocalRepoDetails(state.currentRepo, "branches");
    const newBranch = {
      name: branchName.trim().toLowerCase().replace(/\s+/g, "-"),
      desc: `Created from commit ${hash}`,
      isDefault: false,
      borderColor: "transparent",
    };
    const updated = [...current, newBranch];
    localStorage.setItem(key, JSON.stringify(updated));
    setState((prev) => ({
      ...prev,
      activeBranches: updated,
    }));
    showToast(`Branch "${branchName}" created from commit ${hash}!`);
  };
  const createTagAtCommit = (hash: string, tagName: string) => {
    showToast(`Created tag "${tagName}" at commit ${hash}!`);
  };
  const refreshData = async () => {
    setState((prev) => ({ ...prev, isLoadingRepoDetails: true }));
    // Simulate brief refreshing delay to show the loader feedback
    await new Promise((resolve) => setTimeout(resolve, 800));
    if (state.githubToken) {
      try {
        await fetchGitHubData(state.githubToken);
        if (
          state.currentRepo && state.currentRepoOwner
        ) {
          await fetchRepoDetails(state.currentRepo, state.currentRepoOwner);
        }
      } catch (error) {
        console.error("Refresh error:", error);
      }
    } else {
      // Local mode refresh
      setState((prev) => {
        const repos = getLocalRepos();
        let commits = prev.activeCommits;
        let branches = prev.activeBranches;
        let prs = prev.activePRs;
        let files = prev.activeFiles;
        if (prev.currentRepo) {
          commits = getLocalRepoDetails(prev.currentRepo, "commits");
          branches = getLocalRepoDetails(prev.currentRepo, "branches");
          prs = getLocalRepoDetails(prev.currentRepo, "prs");
          files = getLocalRepoDetails(prev.currentRepo, "files");
        }
        return {
          ...prev,
          githubRepos: repos,
          activeCommits: commits,
          activeBranches: branches,
          activePRs: prs,
          activeFiles: files,
          isLoadingRepoDetails: false,
        };
      });
    }
    showToast("Data refreshed successfully");
  };
  useEffect(() => {
    if (state.toastMessage) {
      const timer = setTimeout(() => {
        setState((prev) => ({ ...prev, toastMessage: null }));
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [state.toastMessage]);
  return (
    <AppContext.Provider
      value={{
        ...state,
        navigate,
        openRepo,
        openActionSheet,
        closeActionSheet,
        openDrawer,
        closeDrawer,
        showToast,
        closeModals,
        setSearchFocus,
        toggleTheme,
        connectGitHub,
        disconnectGitHub,
        setManualToken,
        refreshData,
        openModal,
        closeModal,
        addRecentClone,
        cloneRepository,
        createLocalRepo,
        createLocalBranch,
        createLocalPR,
        updateLocalPRStatus,
        createLocalCommit,
        editCommitMessage,
        deleteCommit,
        amendLatestCommit,
        undoLatestCommit,
        restoreFilesToCommit,
        resetBranchToCommit,
        createBranchAtCommit,
        createTagAtCommit,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context)
    throw new Error("useAppContext must be used within an AppProvider");
  return context;
};
