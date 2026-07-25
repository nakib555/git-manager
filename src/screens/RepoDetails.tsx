import React from 'react';
import { useAppContext } from '../AppContext';
import { Folder } from 'lucide-react';

import { SkeletonDetails } from './repodetails/SkeletonDetails';
import { FilesScreen } from './repodetails/FilesScreen';
import { CommitsScreen } from './repodetails/CommitsScreen';
import { BranchesScreen } from './repodetails/BranchesScreen';
import { InsightsScreen } from './repodetails/InsightsScreen';
import { PRsScreen } from './repodetails/PRsScreen';

export const RepoDetails: React.FC = () => {
  const { currentScreen, isLoadingRepoDetails, currentRepo, navigate } = useAppContext();

  if (!currentRepo) {
    return (
      <div className="bg-card rounded-2xl border border-border p-8 text-center flex flex-col items-center justify-center my-12 mx-5 animate-fade-up">
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
          <Folder size={24} />
        </div>
        <h3 className="font-semibold text-text-main mb-1 text-sm">No Repository Selected</h3>
        <p className="text-xs text-text-muted max-w-[280px] mb-4">Please select a repository from the list to view its commits, pull requests, files, and branch details.</p>
        <button
          onClick={() => navigate('repos')}
          className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2 rounded-xl active:scale-95 transition-all shadow-sm cursor-pointer"
        >
          View Repositories
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      {isLoadingRepoDetails ? (
        <SkeletonDetails screen={currentScreen} />
      ) : (
        <>
          {currentScreen === 'files' && <FilesScreen />}
          {currentScreen === 'commits' && <CommitsScreen />}
          {currentScreen === 'branches' && <BranchesScreen />}
          {currentScreen === 'insights' && <InsightsScreen />}
          {currentScreen === 'prs' && <PRsScreen />}
        </>
      )}
    </div>
  );
};
