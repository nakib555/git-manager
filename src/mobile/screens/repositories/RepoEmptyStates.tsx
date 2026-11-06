import React from 'react';
import { Search, Globe, FolderGit2, FolderPlus, Download } from 'lucide-react';
import { EmptyState } from '../../components/EmptyState';

interface RepoEmptyStatesProps {
  localSearch: string;
  repoSearchScope: 'personal' | 'global';
  githubToken: string | null;
  onClearSearch: () => void;
  onSetGlobalScope: () => void;
  onCreateRepo: () => void;
  onConnectGitHub: () => void;
  onNavigateClone: () => void;
}

export const RepoEmptyStates: React.FC<RepoEmptyStatesProps> = ({
  localSearch,
  repoSearchScope,
  githubToken,
  onClearSearch,
  onSetGlobalScope,
  onCreateRepo,
  onConnectGitHub,
  onNavigateClone,
}) => {
  if (localSearch.trim()) {
    return (
      <EmptyState
        icon={Search}
        title={`No repositories match "${localSearch}"`}
        description="Check spelling, adjust your search filter, or explore the Global GitHub scope."
        primaryAction={{
          label: 'Clear Search Filter',
          onClick: onClearSearch,
        }}
        secondaryAction={
          repoSearchScope === 'personal'
            ? {
                label: 'Search Global GitHub',
                icon: Globe,
                onClick: onSetGlobalScope,
              }
            : undefined
        }
      />
    );
  }

  return (
    <EmptyState
      icon={FolderGit2}
      title="No repositories connected"
      description="Connect your GitHub account to access all your repositories, or clone an external repository into your local workspace."
      primaryAction={
        githubToken
          ? {
              label: 'Create New Repository',
              icon: FolderPlus,
              onClick: onCreateRepo,
            }
          : {
              label: 'Connect GitHub Account',
              icon: FolderGit2,
              onClick: onConnectGitHub,
            }
      }
      secondaryAction={{
        label: 'Clone Repository',
        icon: Download,
        onClick: onNavigateClone,
      }}
    />
  );
};
