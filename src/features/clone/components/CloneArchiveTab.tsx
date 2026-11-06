import React, { useState } from 'react';
import { Download, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../../../AppContext';

interface CloneArchiveTabProps {
  repoName: string;
  repoOwner: string;
}

export const CloneArchiveTab: React.FC<CloneArchiveTabProps> = ({
  repoName,
  repoOwner,
}) => {
  const { githubToken, showToast } = useAppContext();
  const [archiveMode, setArchiveMode] = useState<'latest' | 'full'>('latest');
  const [targetRef, setTargetRef] = useState('main');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const tokenParam = githubToken ? `&token=${encodeURIComponent(githubToken)}` : '';
      const ref = archiveMode === 'latest' ? 'main' : targetRef;
      const downloadUrl = `/api/github/download?owner=${encodeURIComponent(repoOwner)}&repo=${encodeURIComponent(repoName)}&ref=${encodeURIComponent(ref)}${tokenParam}`;

      const res = await fetch(downloadUrl);
      if (!res.ok) throw new Error(`Download failed with status ${res.status}`);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${repoName}-${archiveMode === 'latest' ? 'latest' : ref}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      showToast(`Archive ${repoName}.zip downloaded successfully!`, 'success');
    } catch (err: any) {
      showToast(`Archive error: ${err.message}`, 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-5 py-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          onClick={() => setArchiveMode('latest')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            archiveMode === 'latest'
              ? 'border-primary bg-primary/5 shadow-xs'
              : 'border-border hover:border-primary/40 bg-card'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-xs text-text-main">Latest Release ZIP</span>
            {archiveMode === 'latest' && <CheckCircle2 size={16} className="text-primary" />}
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed">
            Head revision of default branch without historical packfiles. Fastest download.
          </p>
        </div>

        <div
          onClick={() => setArchiveMode('full')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            archiveMode === 'full'
              ? 'border-primary bg-primary/5 shadow-xs'
              : 'border-border hover:border-primary/40 bg-card'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-xs text-text-main">Specific Branch/Ref</span>
            {archiveMode === 'full' && <CheckCircle2 size={16} className="text-primary" />}
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed">
            Package code from an explicit git branch, tag, or commit hash.
          </p>
        </div>
      </div>

      {archiveMode === 'full' && (
        <div className="space-y-1.5 bg-main border border-border p-3.5 rounded-xl">
          <label className="text-[11px] font-bold text-text-muted uppercase">Target Branch / Ref</label>
          <input
            type="text"
            value={targetRef}
            onChange={(e) => setTargetRef(e.target.value)}
            placeholder="main or v1.0.0"
            className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs font-mono text-text-main outline-none focus:border-primary"
          />
        </div>
      )}

      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-primary/20 disabled:opacity-40"
      >
        <Download size={14} />
        <span>{isDownloading ? 'Packaging Archive...' : 'Download ZIP Archive'}</span>
      </button>
    </div>
  );
};
