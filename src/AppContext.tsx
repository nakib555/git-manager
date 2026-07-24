import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppContextType, AppState, Screen } from './types';

const defaultState: AppState = {
  currentScreen: 'dash',
  currentRepo: null,
  isActionSheetOpen: false,
  isDrawerOpen: false,
  toastMessage: null,
  isSearchFocused: false,
  theme: (localStorage.getItem('theme') as 'dark' | 'light') || 'dark',
  githubToken: localStorage.getItem('githubToken') || null,
  githubUser: null,
  githubRepos: [],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(defaultState);

  // Apply theme to document body
  useEffect(() => {
    if (state.theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [state.theme]);

  const toggleTheme = () => {
    setState((prev) => {
      const newTheme = prev.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', newTheme);
      return { ...prev, theme: newTheme };
    });
  };

  const connectGitHub = async () => {
    try {
      const response = await fetch('/api/auth/url');
      if (!response.ok) {
        throw new Error('Failed to get auth URL');
      }
      const { url } = await response.json();
      
      const authWindow = window.open(
        url,
        'oauth_popup',
        'width=600,height=700'
      );

      if (!authWindow) {
        showToast('Please allow popups to connect your GitHub account.');
      }
    } catch (error) {
      console.error('OAuth error:', error);
      showToast('Error connecting to GitHub');
    }
  };

  const disconnectGitHub = () => {
    localStorage.removeItem('githubToken');
    setState((prev) => ({ ...prev, githubToken: null, githubUser: null, githubRepos: [] }));
    showToast('GitHub disconnected');
  };

  const setManualToken = (token: string) => {
    localStorage.setItem('githubToken', token);
    setState((prev) => ({ ...prev, githubToken: token }));
    showToast('GitHub token saved manually');
  };

  const fetchGitHubData = async (token: string) => {
    try {
      // Fetch user profile
      const userRes = await fetch('https://api.github.com/user', {
        headers: { Authorization: `token ${token}` }
      });
      if (!userRes.ok) throw new Error('Failed to fetch user');
      const userData = await userRes.json();

      // Fetch user repos
      const reposRes = await fetch('https://api.github.com/user/repos?sort=updated&per_page=20', {
        headers: { Authorization: `token ${token}` }
      });
      if (!reposRes.ok) throw new Error('Failed to fetch repos');
      const reposData = await reposRes.json();

      setState((prev) => ({
        ...prev,
        githubUser: userData,
        githubRepos: reposData,
      }));
    } catch (error) {
      console.error('GitHub fetch error:', error);
      showToast('Error loading GitHub data');
      disconnectGitHub();
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const token = event.data.token;
        localStorage.setItem('githubToken', token);
        setState((prev) => ({ ...prev, githubToken: token }));
        showToast('Successfully connected to GitHub');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (state.githubToken) {
      fetchGitHubData(state.githubToken);
    }
  }, [state.githubToken]);

  const navigate = (screen: Screen) => {
    setState((prev) => ({ ...prev, currentScreen: screen }));
  };

  const openRepo = (repoName: string) => {
    setState((prev) => ({ ...prev, currentRepo: repoName, currentScreen: 'files' }));
  };

  const openActionSheet = () => setState((prev) => ({ ...prev, isActionSheetOpen: true }));
  const closeActionSheet = () => setState((prev) => ({ ...prev, isActionSheetOpen: false }));
  
  const openDrawer = () => setState((prev) => ({ ...prev, isDrawerOpen: true }));
  const closeDrawer = () => setState((prev) => ({ ...prev, isDrawerOpen: false }));

  const closeModals = () => setState((prev) => ({ ...prev, isActionSheetOpen: false, isDrawerOpen: false }));
  
  const setSearchFocus = (focus: boolean) => setState((prev) => ({ ...prev, isSearchFocused: focus }));

  const showToast = (msg: string) => {
    setState((prev) => ({ ...prev, toastMessage: msg }));
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};
