import React, { useEffect, useState } from 'react';
import { useAppContext } from '../AppContext';
import { Folder, GitBranch, GitPullRequest, X, XCircle, CheckCircle2, AlertCircle, Info, MessageSquare, Bell, HardDrive, LogOut } from 'lucide-react';
import { useCountUp } from '../hooks/useAnime';

export const ActionSheet: React.FC = () => {
  const { isActionSheetOpen, closeModals, showToast, openModal, navigate, closeActionSheet, githubToken, disconnectGitHub } = useAppContext();

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/75 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isActionSheetOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={closeModals}
      />
      <div className={`fixed left-0 w-full bg-[#121214] rounded-t-[20px] z-[101] px-5 pt-3 pb-[calc(1.5rem+env(safe-area-inset-bottom))] transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] border-t border-[#2A2A2E] shadow-2xl ${isActionSheetOpen ? 'bottom-0' : '-bottom-full'}`}>
        {/* Tactile Drag Handle */}
        <div className="w-9 h-1 bg-[#2A2A2E] rounded-full mx-auto mb-4"></div>
        <div className="text-base font-semibold text-[#F4F4F5] mb-2 px-1">Quick Actions</div>
        
        <div className="space-y-1">
          <div 
            className="flex items-center gap-3.5 px-3 py-3 rounded-xl hover:bg-[#1A1A1D] border border-transparent hover:border-[#2A2A2E] cursor-pointer active:scale-[0.99] transition-all"
            onClick={() => { closeActionSheet(); openModal('repo'); }}
          >
            <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/10 text-[#3B82F6] flex items-center justify-center shrink-0 border border-[#3B82F6]/20">
              <Folder size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-[#F4F4F5]">New Repository</div>
              <div className="text-xs text-[#A1A1AA] truncate">Initialize a new Git repository</div>
            </div>
          </div>

          <div 
            className="flex items-center gap-3.5 px-3 py-3 rounded-xl hover:bg-[#1A1A1D] border border-transparent hover:border-[#2A2A2E] cursor-pointer active:scale-[0.99] transition-all"
            onClick={() => { closeActionSheet(); navigate('clone'); }}
          >
            <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 text-[#22C55E] flex items-center justify-center shrink-0 border border-[#22C55E]/20">
              <HardDrive size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-[#F4F4F5]">Clone Repository</div>
              <div className="text-xs text-[#A1A1AA] truncate">Clone a remote repository to local workspace</div>
            </div>
          </div>

          <div 
            className="flex items-center gap-3.5 px-3 py-3 rounded-xl hover:bg-[#1A1A1D] border border-transparent hover:border-[#2A2A2E] cursor-pointer active:scale-[0.99] transition-all"
            onClick={() => { closeActionSheet(); openModal('branch'); }}
          >
            <div className="w-10 h-10 rounded-xl bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center shrink-0 border border-[#38BDF8]/20">
              <GitBranch size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-[#F4F4F5]">Create Branch</div>
              <div className="text-xs text-[#A1A1AA] truncate">Branch off from current HEAD</div>
            </div>
          </div>

          <div 
            className="flex items-center gap-3.5 px-3 py-3 rounded-xl hover:bg-[#1A1A1D] border border-transparent hover:border-[#2A2A2E] cursor-pointer active:scale-[0.99] transition-all"
            onClick={() => { closeActionSheet(); openModal('pr'); }}
          >
            <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/10 text-[#F59E0B] flex items-center justify-center shrink-0 border border-[#F59E0B]/20">
              <GitPullRequest size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-[#F4F4F5]">Create Pull Request</div>
              <div className="text-xs text-[#A1A1AA] truncate">Propose and compare branch changes</div>
            </div>
          </div>

          {githubToken && (
            <div 
              className="flex items-center gap-3.5 px-3 py-3 rounded-xl hover:bg-[#EF4444]/10 border border-transparent hover:border-[#EF4444]/20 cursor-pointer active:scale-[0.99] transition-all mt-2 pt-3 border-t border-[#2A2A2E]/60 text-[#EF4444]"
              onClick={() => { closeActionSheet(); disconnectGitHub(); }}
            >
              <div className="w-10 h-10 rounded-xl bg-[#EF4444]/10 text-[#EF4444] flex items-center justify-center shrink-0 border border-[#EF4444]/20">
                <LogOut size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-[#EF4444]">Disconnect GitHub</div>
                <div className="text-xs text-[#EF4444]/80 truncate">Clear stored credentials and session</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export const NotificationDrawer: React.FC = () => {
  const { isDrawerOpen, closeModals, githubUser, githubToken, connectGitHub, disconnectGitHub } = useAppContext();

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/75 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={closeModals}
      />
      <div className={`fixed top-0 w-[85%] max-w-[340px] h-full bg-[#121214] z-[102] p-6 pt-[max(1.5rem,env(safe-area-inset-top))] transition-all duration-300 border-l border-[#2A2A2E] overflow-y-auto ${isDrawerOpen ? 'right-0' : '-right-full'}`}>
        <div className="flex justify-between items-center mb-6">
          <div className="text-lg font-semibold text-[#F4F4F5]">Account & Alerts</div>
          <button onClick={closeModals} className="w-9 h-9 rounded-lg flex items-center justify-center text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[#1A1A1D] cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* User Card */}
        <div className="bg-[#1A1A1D] border border-[#2A2A2E] rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            {githubUser?.avatar_url ? (
              <img src={githubUser.avatar_url} alt="Profile" className="w-11 h-11 rounded-full border border-[#2A2A2E]" />
            ) : (
              <div className="w-11 h-11 rounded-full bg-[#242428] border border-[#2A2A2E] flex items-center justify-center text-[#A1A1AA]">
                <Folder size={20} />
              </div>
            )}
            <div className="overflow-hidden">
              <span className="block font-semibold text-sm text-[#F4F4F5] truncate">
                {githubUser ? (githubUser.name || githubUser.login) : 'Guest Developer'}
              </span>
              <span className="block text-xs text-[#A1A1AA] truncate mt-0.5">
                {githubUser ? `@${githubUser.login}` : 'Offline Mode'}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#2A2A2E]">
            {githubToken ? (
              <button 
                onClick={disconnectGitHub}
                className="w-full bg-[#EF4444]/10 hover:bg-[#EF4444]/20 border border-[#EF4444]/25 text-[#EF4444] h-9 rounded-lg text-xs font-bold transition-all cursor-pointer text-center"
              >
                Disconnect GitHub
              </button>
            ) : (
              <button 
                onClick={connectGitHub}
                className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white h-9 rounded-lg text-xs font-bold transition-all cursor-pointer text-center shadow-xs"
              >
                Connect GitHub Account
              </button>
            )}
          </div>
        </div>

        {/* Notifications list */}
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-[#1A1A1D] flex items-center justify-center text-[#71717A] mb-3 border border-[#2A2A2E]">
            <Bell size={20} />
          </div>
          <p className="text-sm font-semibold text-[#F4F4F5] mb-1">No unread notifications</p>
          <p className="text-xs text-[#A1A1AA] max-w-[200px] leading-relaxed">Repository mentions, pull request reviews, and workflow status alerts will appear here.</p>
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
        return 'bg-[#121214] text-[#F4F4F5] border-[#EF4444]/50 shadow-lg shadow-[#EF4444]/10';
      case 'success':
        return 'bg-[#121214] text-[#F4F4F5] border-[#22C55E]/50 shadow-lg shadow-[#22C55E]/10';
      case 'info':
      default:
        return 'bg-[#121214] text-[#F4F4F5] border-[#3B82F6]/50 shadow-lg shadow-[#3B82F6]/10';
    }
  };

  const getIcon = () => {
    switch (toastType) {
      case 'error':
        return <AlertCircle size={15} className="text-[#EF4444] shrink-0" />;
      case 'success':
        return <CheckCircle2 size={15} className="text-[#22C55E] shrink-0" />;
      case 'info':
      default:
        return <Info size={15} className="text-[#3B82F6] shrink-0" />;
    }
  };

  return (
    <div 
      className={`fixed top-16 left-1/2 -translate-x-1/2 max-w-[90vw] sm:max-w-md border px-4 py-2 min-h-[40px] rounded-full text-xs font-semibold transition-all duration-300 z-[300] flex items-center gap-2 pointer-events-none backdrop-blur-md ${getVariantStyles()} ${
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
