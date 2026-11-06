import React, { useState, useMemo } from 'react';
import { Search, Download, CheckSquare, Square, Folder, FileCode, FileText } from 'lucide-react';
import { useAppContext } from '../../../AppContext';
import { packageAndDownloadZip } from '../../../mobile/utils/zipExport';
import { TreeFileItem } from '../types';

interface CloneSelectiveTabProps {
  repoName: string;
}

export const CloneSelectiveTab: React.FC<CloneSelectiveTabProps> = ({ repoName }) => {
  const { showToast } = useAppContext();
  const [fileSearch, setFileSearch] = useState('');
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set(['src/AppContext.tsx', 'README.md']));
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set(['src']));
  const [isPackaging, setIsPackaging] = useState(false);

  const fileTree: TreeFileItem[] = useMemo(() => [
    {
      id: 'src', path: 'src', name: 'src', type: 'dir',
      children: [
        { id: 'src/AppContext.tsx', path: 'src/AppContext.tsx', name: 'AppContext.tsx', type: 'file', sizeBytes: 14200, content: '// Application state' },
        { id: 'src/types.ts', path: 'src/types.ts', name: 'types.ts', type: 'file', sizeBytes: 5200, content: '// TypeScript definitions' },
        { id: 'src/App.tsx', path: 'src/App.tsx', name: 'App.tsx', type: 'file', sizeBytes: 8100, content: '// Root App component' }
      ]
    },
    { id: 'package.json', path: 'package.json', name: 'package.json', type: 'file', sizeBytes: 1494, content: '{\n  "name": "git-manager"\n}' },
    { id: 'README.md', path: 'README.md', name: 'README.md', type: 'file', sizeBytes: 2840, content: '# Git Manager' }
  ], []);

  const toggleSelect = (path: string) => {
    setSelectedPaths(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const handleDownloadZip = async () => {
    if (selectedPaths.size === 0) {
      showToast('Select files or folders to download');
      return;
    }
    setIsPackaging(true);
    try {
      const files = [
        { path: 'src/AppContext.tsx', content: '// AppContext' },
        { path: 'README.md', content: '# Readme' },
        { path: 'package.json', content: '{"name": "git-manager"}' }
      ].filter(f => selectedPaths.has(f.path));
      await packageAndDownloadZip(files, `${repoName}-selected-files`);
      showToast(`Packaged and downloaded ${files.length} files as ZIP`);
    } catch (e: any) {
      showToast(`Error: ${e.message}`);
    } finally {
      setIsPackaging(false);
    }
  };

  return (
    <div className="space-y-4 py-2">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={fileSearch}
          onChange={(e) => setFileSearch(e.target.value)}
          placeholder="Filter files to package..."
          className="w-full bg-main border border-border rounded-xl pl-8 pr-3 py-2 text-xs text-text-main outline-none focus:border-primary"
        />
      </div>

      <div className="bg-main border border-border rounded-xl p-3 max-h-[220px] overflow-y-auto space-y-1 font-mono text-xs">
        {fileTree.map(item => (
          <div key={item.id} className="space-y-1">
            <div
              onClick={() => toggleSelect(item.path)}
              className="flex items-center gap-2 p-1.5 hover:bg-hover rounded-lg cursor-pointer"
            >
              {selectedPaths.has(item.path) ? (
                <CheckSquare size={14} className="text-primary shrink-0" />
              ) : (
                <Square size={14} className="text-text-muted shrink-0" />
              )}
              <Folder size={14} className="text-primary shrink-0" />
              <span className="text-text-main font-semibold">{item.name}</span>
            </div>
            {item.children?.map(child => (
              <div
                key={child.id}
                onClick={() => toggleSelect(child.path)}
                className="flex items-center gap-2 p-1.5 pl-6 hover:bg-hover rounded-lg cursor-pointer"
              >
                {selectedPaths.has(child.path) ? (
                  <CheckSquare size={14} className="text-primary shrink-0" />
                ) : (
                  <Square size={14} className="text-text-muted shrink-0" />
                )}
                <FileCode size={13} className="text-text-muted shrink-0" />
                <span className="text-text-main text-[11px]">{child.name}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <button
        onClick={handleDownloadZip}
        disabled={isPackaging || selectedPaths.size === 0}
        className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-primary/20 disabled:opacity-40"
      >
        <Download size={14} />
        <span>{isPackaging ? 'Packaging ZIP...' : `Download ${selectedPaths.size} Selected Files`}</span>
      </button>
    </div>
  );
};
