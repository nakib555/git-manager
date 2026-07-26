import React, { useState, useEffect } from 'react';
import { useAppContext } from '../AppContext';
import { Folder } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { SkeletonDetails } from './repodetails/SkeletonDetails';
import { FilesScreen } from './repodetails/FilesScreen';
import { CommitsScreen } from './repodetails/CommitsScreen';
import { BranchesScreen } from './repodetails/BranchesScreen';
import { InsightsScreen } from './repodetails/InsightsScreen';
import { PRsScreen } from './repodetails/PRsScreen';
import { CloneScreen } from './CloneScreen';

const TAB_ORDER = ['commits', 'prs', 'branches', 'files', 'insights', 'clone'];

export const RepoDetails: React.FC = () => {
  const { currentScreen, isLoadingRepoDetails, currentRepo, navigate } = useAppContext();
  const [prevScreen, setPrevScreen] = useState(currentScreen);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if (currentScreen !== prevScreen) {
      const prevIdx = TAB_ORDER.indexOf(prevScreen);
      const currentIdx = TAB_ORDER.indexOf(currentScreen);
      
      if (prevIdx !== -1 && currentIdx !== -1) {
        setDirection(currentIdx > prevIdx ? 1 : -1);
      } else {
        setDirection(0);
      }
      setPrevScreen(currentScreen);
    }
  }, [currentScreen, prevScreen]);

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

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 40 : dir < 0 ? -40 : 0,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -40 : dir < 0 ? 40 : 0,
      opacity: 0,
    }),
  };

  return (
    <div className="overflow-x-hidden w-full">
      {isLoadingRepoDetails ? (
        <SkeletonDetails screen={currentScreen} />
      ) : (
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={currentScreen}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 350, damping: 30 },
              opacity: { duration: 0.15 }
            }}
            className="w-full px-5"
          >
            {currentScreen === 'files' && <FilesScreen />}
            {currentScreen === 'commits' && <CommitsScreen />}
            {currentScreen === 'branches' && <BranchesScreen />}
            {currentScreen === 'insights' && <InsightsScreen />}
            {currentScreen === 'prs' && <PRsScreen />}
            {currentScreen === 'clone' && <CloneScreen />}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};
