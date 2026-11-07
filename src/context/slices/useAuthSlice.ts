import { useEffect } from 'react';
import { AppState } from '../../types';
import { DEMO_USER, DEMO_REPOSITORIES, DEMO_COMMITS, DEMO_BRANCHES, DEMO_PRS, DEMO_FILES } from '../../data/demoData';

interface UseAuthSliceParams {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  showToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  openModal: (modal: 'repo' | 'branch' | 'pr' | 'commit' | 'clone' | 'oauth_setup') => void;
  fetchGitHubData: (token: string, isBg?: boolean, p?: number, q?: string) => Promise<void>;
  setRefreshTrigger: React.Dispatch<React.SetStateAction<number>>;
}

export const useAuthSlice = ({
  state,
  setState,
  showToast,
  openModal,
  fetchGitHubData,
  setRefreshTrigger,
}: UseAuthSliceParams) => {
  // SSE Listener for GitHub Webhooks
  useEffect(() => {
    const sse = new EventSource('/api/events');
    sse.addEventListener('github', (e) => {
      try {
        const data = JSON.parse(e.data);
        console.log('Received GitHub webhook event:', data.event);
        setRefreshTrigger(prev => prev + 1);
      } catch (_) {}
    });
    return () => sse.close();
  }, [setRefreshTrigger]);

  // Window Message Listener for OAuth Success
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (
        origin !== window.location.origin &&
        !origin.endsWith(".run.app") && !origin.includes("localhost") && !origin.endsWith(".workers.dev") && !origin.endsWith(".pages.dev")
      ) {
        return;
      }
      if (event.data?.type === "OAUTH_AUTH_SUCCESS") {
        const token = event.data.token;
        if (token && token !== "undefined" && token !== "null") {
          localStorage.setItem("githubToken", token);
          setState((prev) => ({
            ...prev,
            githubToken: token,
            currentRepo: null,
            currentRepoOwner: null,
            currentBranch: null,
            activeCommits: [],
            activeBranches: [],
            activePRs: [],
            activeFiles: [],
          }));
          showToast("Connected to GitHub! Syncing repositories...", "success");
          fetchGitHubData(token, false, 1, "");
        } else {
          showToast("Failed to connect to GitHub. Invalid token received.", "error");
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [setState, showToast, fetchGitHubData]);

  const connectGitHub = async () => {
    try {
      const response = await fetch("/api/auth/url");
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        openModal("oauth_setup");
        if (errorData.error && errorData.error.includes("GITHUB_CLIENT_ID")) {
          showToast("Please enter a Personal Access Token to connect GitHub.");
          return;
        }
        throw new Error(errorData.error || "Failed to get auth URL");
      }
      const { url } = await response.json();
      const popup = window.open(
        url,
        "github_oauth_popup",
        "width=600,height=700,status=no,toolbar=no,menubar=no,location=no"
      );
      if (!popup) {
        showToast("Please allow popups to connect with GitHub.", "warning");
      }
    } catch (error: any) {
      showToast(error.message || "Error connecting to GitHub", "warning");
    }
  };

  const disconnectGitHub = () => {
    localStorage.removeItem("githubToken");
    localStorage.removeItem("githubUser");
    localStorage.removeItem("currentRepo");
    localStorage.removeItem("currentRepoOwner");
    localStorage.removeItem("currentBranch");
    setState((prev) => ({
      ...prev,
      githubToken: null,
      githubUser: DEMO_USER,
      githubRepos: DEMO_REPOSITORIES,
      currentRepo: "nexus-web-engine",
      currentRepoOwner: "octodev",
      currentBranch: "main",
      activeCommits: DEMO_COMMITS,
      activeBranches: DEMO_BRANCHES,
      activePRs: DEMO_PRS,
      activeFiles: DEMO_FILES,
      activeLanguages: { TypeScript: 68, Rust: 22, CSS: 10 },
      repoTotalPages: 1,
    }));
    showToast("GitHub disconnected • Demo workspace loaded", "info");
  };

  const setManualToken = (token: string) => {
    localStorage.setItem("githubToken", token);
    setState((prev) => ({
      ...prev,
      githubToken: token,
      currentRepo: null,
      currentRepoOwner: null,
      currentBranch: null,
      activeCommits: [],
      activeBranches: [],
      activePRs: [],
      activeFiles: [],
      activeLanguages: {},
    }));
    showToast("GitHub connected! Syncing live repositories...", "success");
    fetchGitHubData(token, false, 1, "");
  };

  return {
    connectGitHub,
    disconnectGitHub,
    setManualToken,
  };
};
