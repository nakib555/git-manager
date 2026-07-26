import React from 'react';
import { useAppContext } from '../AppContext';
import { Github, Shield, GitBranch, GitPullRequest, ArrowRight, KeyRound } from 'lucide-react';
import { motion } from 'motion/react';

export const UnauthenticatedState: React.FC = () => {
  const { connectGitHub, openModal } = useAppContext();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto my-auto animate-fade-up">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 shadow-sm shadow-primary/5"
      >
        <Github size={32} className="stroke-[1.75]" />
      </motion.div>

      <h2 className="text-xl font-extrabold tracking-tight text-text-main mb-2">
        Connect Your GitHub Account
      </h2>
      
      <p className="text-xs text-text-muted leading-relaxed mb-8 max-w-sm">
        Welcome to your professional version control workstation. Connect your GitHub account to manage real repositories, review branches, track issues, and merge pull requests.
      </p>

      {/* Feature list */}
      <div className="w-full space-y-3.5 mb-8 text-left">
        <div className="flex items-start gap-3 p-3 bg-card rounded-xl border border-border">
          <div className="w-7 h-7 rounded-lg bg-info/10 text-info flex items-center justify-center shrink-0">
            <GitBranch size={14} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-text-main">Real Workspace Integration</h4>
            <p className="text-[11px] text-text-muted mt-0.5">Browse real file trees, view code diffs, and create or delete active branches.</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 bg-card rounded-xl border border-border">
          <div className="w-7 h-7 rounded-lg bg-success/10 text-success flex items-center justify-center shrink-0">
            <GitPullRequest size={14} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-text-main">Pull Request & Collaboration</h4>
            <p className="text-[11px] text-text-muted mt-0.5">Open, close, merge, and manage pull requests in real time via GitHub REST APIs.</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 bg-card rounded-xl border border-border">
          <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Shield size={14} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-text-main">Secure Verification</h4>
            <p className="text-[11px] text-text-muted mt-0.5">Authenticated securely via official GitHub OAuth or Personal Access Tokens (PAT).</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <button
          onClick={connectGitHub}
          className="flex-1 bg-primary hover:bg-primary-hover text-white text-xs font-bold py-3 px-4 rounded-xl transition-all active:scale-[0.98] cursor-pointer shadow-sm shadow-primary/20 flex items-center justify-center gap-2"
        >
          <span>Connect via GitHub OAuth</span>
          <ArrowRight size={13} />
        </button>

        <button
          onClick={() => openModal('oauth_setup')}
          className="flex-1 bg-card hover:bg-hover border border-border text-text-main text-xs font-bold py-3 px-4 rounded-xl transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
        >
          <KeyRound size={13} className="text-text-muted" />
          <span>Use Access Token (PAT)</span>
        </button>
      </div>
    </div>
  );
};
