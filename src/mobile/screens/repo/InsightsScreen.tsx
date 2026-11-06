import React from 'react';
import { useAppContext } from '../../../AppContext';
import { BarChart2, GitBranch, Plus } from 'lucide-react';
import { EmptyState } from '../../components/EmptyState';
import { InsightsActivityChart } from './insights/InsightsActivityChart';
import { InsightsCompositionCard } from './insights/InsightsCompositionCard';

export const InsightsScreen: React.FC = () => {
  const { currentRepo, activeCommits, activeFiles, openModal } = useAppContext();

  if (activeCommits.length === 0 && activeFiles.length === 0) {
    return (
      <div className="px-4 py-4 space-y-4 pb-6">
        <div>
          <h2 className="text-base font-semibold text-text-primary tracking-tight">Insights</h2>
          <p className="text-xs text-text-tertiary mt-0.5">
            Activity analytics and code composition for {currentRepo || 'this repository'}
          </p>
        </div>

        <EmptyState
          icon={BarChart2}
          title="No analytics data available"
          description={`There are no commits or tracked files in ${currentRepo || 'this repository'} to generate insights.`}
          primaryAction={{
            label: 'Create First Commit',
            icon: Plus,
            onClick: () => openModal('commit'),
          }}
          secondaryAction={{
            label: 'Switch Branch',
            icon: GitBranch,
            onClick: () => openModal('branch'),
          }}
        />
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-6 pb-6">
      <div>
        <h2 className="text-base font-semibold text-text-primary tracking-tight">Insights</h2>
        <p className="text-xs text-text-tertiary mt-0.5">
          Activity analytics and code composition for {currentRepo}
        </p>
      </div>

      <InsightsActivityChart activeCommits={activeCommits} />
      <InsightsCompositionCard activeFiles={activeFiles} />
    </div>
  );
};

export const MobileInsights = InsightsScreen;
