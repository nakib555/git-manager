import React, { useEffect, useState } from 'react';
import { useAppContext } from '../AppContext';
import { Folder, GitBranch, GitPullRequest, X, XCircle, CheckCircle2, AlertCircle, Info, MessageSquare, Bell, HardDrive } from 'lucide-react';
import { useCountUp } from '../hooks/useAnime';

export const ActionSheet: React.FC = () => {
  const { isActionSheetOpen, closeModals, showToast, openModal, navigate, closeActionSheet } = useAppContext();

  return (
    <>
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isActionSheetOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={closeModals}
      />
      <div className={`absolute left-0 w-full bg-card rounded-t-3xl z-[101] p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] border-t border-border ${isActionSheetOpen ? 'bottom-0' : '-bottom-full'}`}>
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-6"></div>
        <div className="text-lg font-semibold mb-4 text-text-main">Create New</div>
        
        <div 
          className="flex items-center gap-4 py-4 border-b border-border cursor-pointer active:opacity-70"
          onClick={() => { openModal('repo'); }}
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Folder size={20} />
          </div>
          <div>
            <div className="text-[15px] mb-1 text-text-main font-medium">Repository</div>
            <div className="text-xs text-text-muted">Create a new Git repository</div>
          </div>
        </div>
        <div 
          className="flex items-center gap-4 py-4 border-b border-border cursor-pointer active:opacity-70"
          onClick={() => { closeActionSheet(); navigate('clone'); }}
        >
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center shrink-0">
            <HardDrive size={20} />
          </div>
          <div>
            <div className="text-[15px] mb-1 text-text-main font-medium">Clone Repository</div>
            <div className="text-xs text-text-muted">Clone an existing repository</div>
          </div>
        </div>

        <div 
          className="flex items-center gap-4 py-4 border-b border-border cursor-pointer active:opacity-70"
          onClick={() => { openModal('branch'); }}
        >
          <div className="w-10 h-10 rounded-xl bg-info/10 text-info flex items-center justify-center shrink-0">
            <GitBranch size={20} />
          </div>
          <div>
            <div className="text-[15px] mb-1 text-text-main font-medium">Branch</div>
            <div className="text-xs text-text-muted">Create a branch from main</div>
          </div>
        </div>

        <div 
          className="flex items-center gap-4 py-4 cursor-pointer active:opacity-70"
          onClick={() => { openModal('pr'); }}
        >
          <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center shrink-0">
            <GitPullRequest size={20} />
          </div>
          <div>
            <div className="text-[15px] mb-1 text-text-main font-medium">Pull Request</div>
            <div className="text-xs text-text-muted">Merge changes across branches</div>
          </div>
        </div>
      </div>
    </>
  );
};

export const NotificationDrawer: React.FC = () => {
  const { isDrawerOpen, closeModals } = useAppContext();

  return (
    <>
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={closeModals}
      />
      <div className={`absolute top-0 w-[85%] max-w-[352px] h-full bg-main z-[102] p-6 pt-[max(1.5rem,env(safe-area-inset-top))] transition-all duration-300 border-l border-border overflow-y-auto ${isDrawerOpen ? 'right-0' : '-right-full'}`}>
        <div className="flex justify-between items-center mb-6">
          <div className="text-xl font-semibold text-text-main">Notifications</div>
          <X size={24} className="cursor-pointer text-text-main" onClick={closeModals} />
        </div>

        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-hover flex items-center justify-center text-text-muted mb-4 border border-border">
            <Bell size={20} />
          </div>
          <p className="text-sm font-semibold text-text-main mb-1">No notifications</p>
          <p className="text-xs text-text-muted max-w-[200px]">You're all caught up! New alerts and updates will appear here.</p>
        </div>
      </div>
    </>
  );
};

export const Toast: React.FC = () => {
  const { toastMessage, toastType } = useAppContext();

  const getVariantStyles = () => {
    switch (toastType) {
      case 'error':
        return 'bg-red-50 dark:bg-red-950/90 text-red-900 dark:text-red-200 border-red-300 dark:border-red-800/80 shadow-red-500/10';
      case 'success':
        return 'bg-emerald-50 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800/80 shadow-emerald-500/10';
      case 'info':
      default:
        return 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-700/60 dark:border-zinc-300 shadow-zinc-900/10';
    }
  };

  const getIcon = () => {
    switch (toastType) {
      case 'error':
        return <AlertCircle size={16} className="text-red-500 shrink-0" />;
      case 'success':
        return <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />;
      case 'info':
      default:
        return <Info size={16} className="text-primary shrink-0" />;
    }
  };

  return (
    <div 
      className={`fixed top-6 left-1/2 -translate-x-1/2 max-w-[92vw] sm:max-w-md border px-4 py-2 min-h-[40px] rounded-full text-xs font-semibold transition-all duration-300 z-[300] shadow-xl flex items-center gap-2 pointer-events-none backdrop-blur-md ${getVariantStyles()} ${
        toastMessage ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'
      }`}
    >
      {getIcon()}
      <span className="truncate">{toastMessage}</span>
    </div>
  );
};

export const AnimatedNumber: React.FC<{ value: number; className?: string; formatter?: (v: number) => string }> = ({ value, className, formatter }) => {
  const ref = useCountUp(value, 750, formatter);
  return <span ref={ref as any} className={className}>{formatter ? formatter(value) : value}</span>;
};
