import React, { useState } from 'react';
import { Download, CheckCircle2, Archive, Loader2 } from 'lucide-react';
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
  const [format, setFormat] = useState<'zip' | 'tar'>('zip');
  const [targetRef, setTargetRef] = useState('main');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const tokenParam = githubToken ? `&token=${encodeURIComponent(githubToken)}` : '';
      const ref = archiveMode === 'latest' ? 'main' : (targetRef.trim() || 'main');
      
      const downloadUrl = `/api/github/download?owner=${encodeURIComponent(repoOwner)}&repo=${encodeURIComponent(repoName)}&ref=${encodeURIComponent(ref)}${tokenParam}`;

      let res: Response | null = null;
      try {
        res = await fetch(downloadUrl);
      } catch (_) {
        res = null;
      }

      if (!res || !res.ok) {
        // Fallback to direct GitHub public archive URL
        const ext = format === 'tar' ? 'tar.gz' : 'zip';
        const directUrl = `https://github.com/${repoOwner}/${repoName}/archive/refs/heads/${ref}.${ext}`;
        const link = document.createElement('a');
        link.href = directUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.download = `${repoName}-${ref}.${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast(`Started direct archive download for ${repoName} (${ref})`, 'success');
        return;
      }

      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${repoName}-${ref}.${format === 'tar' ? 'tar.gz' : 'zip'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      showToast(`Archive ${repoName}-${ref}.zip downloaded successfully!`, 'success');
    } catch (err: any) {
      showToast(`Archive error: ${err.message}`, 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-4 py-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div
          onClick={() => setArchiveMode('latest')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            archiveMode === 'latest'
              ? 'border-primary bg-primary/5 shadow-xs'
              : 'border-border hover:border-primary/40 bg-card'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-xs text-text-main">Default Branch Release</span>
            {archiveMode === 'latest' && <CheckCircle2 size={16} className="text-primary" />}
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed">
            Head revision of default branch (<code className="text-text-main font-semibold">main</code>) packaged as a clean snapshot.
          </p>
        </div>

        <div
          onClick={() => setArchiveMode('full')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            archiveMode === 'full'
              ? 'border-primary bg-primary/5 shadow-xs'
              : 'border-border hover:border-primary/40 bg-card'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-xs text-text-main">Specific Branch / Tag</span>
            {archiveMode === 'full' && <CheckCircle2 size={16} className="text-primary" />}
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed">
            Target an explicit branch, release tag (e.g. <code className="text-text-main font-semibold">v1.2.0</code>), or commit SHA.
          </p>
        </div>
      </div>

      {archiveMode === 'full' && (
        <div className="space-y-2 bg-main border border-border p-3.5 rounded-xl">
          <label className="text-[11px] font-bold text-text-muted uppercase">Target Branch or Tag</label>
          <input
            type="text"
            value={targetRef}
            onChange={(e) => setTargetRef(e.target.value)}
            placeholder="main, dev, v1.0.0, or commit SHA"
            className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs font-mono text-text-main outline-none focus:border-primary"
          />
          <div className="flex items-center gap-1.5 pt-1">
            <span className="text-[10px] text-text-muted">Quick refs:</span>
            {['main', 'master', 'develop', 'v1.0.0'].map(chip => (
              <button
                key={chip}
                type="button"
                onClick={() => setTargetRef(chip)}
                className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-card border border-border text-text-secondary hover:text-text-main cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Archive Format Toggle */}
      <div className="flex items-center justify-between bg-main border border-border p-2.5 rounded-xl">
        <span className="text-xs font-semibold text-text-main flex items-center gap-1.5">
          <Archive size={14} className="text-primary" />
          <span>Compression Archive Format</span>
        </span>
        <div className="flex bg-card p-0.5 rounded-lg border border-border text-[10px] font-bold">
          <button
            type="button"
            onClick={() => setFormat('zip')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              format === 'zip' ? 'bg-primary text-white shadow-xs' : 'text-text-muted hover:text-text-main'
            }`}
          >
            .ZIP
          </button>
          <button
            type="button"
            onClick={() => setFormat('tar')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              format === 'tar' ? 'bg-primary text-white shadow-xs' : 'text-text-muted hover:text-text-main'
            }`}
          >
            .TAR.GZ
          </button>
        </div>
      </div>

      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isDownloading ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            <span>Packaging & Fetching Archive...</span>
          </>
        ) : (
          <>
            <Download size={14} />
            <span>Download {format.toUpperCase()} Archive ({archiveMode === 'latest' ? 'main' : targetRef})</span>
          </>
        )}
      </button>
    </div>
  );
};
