import React from 'react';

export type WorkflowPhase = 'idle' | 'validating' | 'executing' | 'verifying' | 'success' | 'error';

export interface WorkflowStep {
  id: string;
  label: string;
  sublabel?: string;
}

export interface ActionResultSummary {
  title: string;
  subtitle?: string;
  badgeLabel?: string;
  metaItems?: Array<{ label: string; value: string }>;
  icon?: React.ReactNode;
}

export interface ActionWorkflowOptions {
  steps?: WorkflowStep[];
  autoCloseDelay?: number; // ms, default 2000
  onSuccess?: () => void;
  onClose?: () => void;
}
