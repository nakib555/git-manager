import React, { useMemo, useState } from 'react';
import { generateHexDump, formatBytes } from '../../utils/formatters';
import { Binary, Search, ShieldCheck, Copy, Check, Download } from 'lucide-react';

interface HexDumpPreviewProps {
  rawBuffer?: Uint8Array;
  textFallback?: string;
  fileName: string;
  isUnknownFallback?: boolean;
  onDownload?: () => void;
}

export const HexDumpPreview: React.FC<HexDumpPreviewProps> = ({
  rawBuffer,
  textFallback,
  fileName,
  isUnknownFallback,
  onDownload,
}) => {
  const [filterHex, setFilterHex] = useState('');
  const [copied, setCopied] = useState(false);

  // Derive buffer from rawBuffer or textFallback
  const effectiveBuffer = useMemo(() => {
    if (rawBuffer && rawBuffer.length > 0) return rawBuffer;
    if (textFallback) {
      return new TextEncoder().encode(textFallback);
    }
    return new Uint8Array(0);
  }, [rawBuffer, textFallback]);

  const { rows, totalBytes, isTruncated } = useMemo(() => {
    if (!effectiveBuffer || effectiveBuffer.length === 0) {
      return { rows: [], totalBytes: 0, isTruncated: false };
    }
    return generateHexDump(effectiveBuffer, 32768); // 32KB of hex rows
  }, [effectiveBuffer]);

  const filteredRows = useMemo(() => {
    if (!filterHex.trim()) return rows;
    const q = filterHex.toLowerCase();
    return rows.filter(
      (r) =>
        r.offset.includes(q) ||
        r.hex.some((h) => h.includes(q)) ||
        r.ascii.toLowerCase().includes(q)
    );
  }, [rows, filterHex]);

  const handleCopyHex = () => {
    const textToCopy = rows.map((r) => `${r.offset}  ${r.hex.join(' ')}  |${r.ascii}|`).join('\n');
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-surface-1 overflow-hidden font-mono text-xs">
      {/* Unknown Fallback Security Banner */}
      {isUnknownFallback && (
        <div className="px-4 py-2 bg-surface-2 border-b border-border flex items-center justify-between text-xs text-text-secondary shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-accent shrink-0" />
            <span className="font-semibold text-text-primary">Secure Binary Inspection:</span>
            <span>Unknown file format automatically routed to isolated hexadecimal viewer.</span>
          </div>
          {onDownload && (
            <button
              type="button"
              onClick={onDownload}
              className="flex items-center gap-1 text-[11px] font-medium text-accent hover:underline cursor-pointer"
            >
              <Download size={11} />
              <span>Download Original</span>
            </button>
          )}
        </div>
      )}

      {/* Hex Toolbar */}
      <div className="px-4 py-2 border-b border-border bg-surface-2/40 flex items-center justify-between gap-4 shrink-0 flex-wrap">
        <div className="relative max-w-xs w-full sm:w-64">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            value={filterHex}
            onChange={(e) => setFilterHex(e.target.value)}
            placeholder="Search hex / ASCII..."
            className="w-full bg-surface-1 border border-border rounded-lg pl-8 pr-2.5 py-1 text-xs text-text-primary outline-none focus:border-accent transition-colors"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-text-tertiary tabular-nums">
            <Binary size={13} className="text-accent" />
            <span>{formatBytes(totalBytes)}</span>
            {isTruncated && <span className="text-amber-600 font-semibold">(first 32KB)</span>}
          </div>

          <button
            type="button"
            onClick={handleCopyHex}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-surface-1 hover:bg-surface-2 border border-border rounded-lg text-text-secondary hover:text-text-primary transition-colors cursor-pointer ${
              copied ? 'border-emerald-500/50 text-emerald-700 bg-emerald-500/10' : ''
            }`}
          >
            {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy Dump'}</span>
          </button>
        </div>
      </div>

      {/* Hex Grid Table */}
      <div className="flex-1 overflow-auto p-4 select-text">
        {filteredRows.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-text-tertiary">
            <Binary size={28} className="opacity-40 mb-2" />
            <p className="text-xs">
              {totalBytes === 0 ? 'Empty binary buffer' : 'No matching offsets, bytes or ASCII sequences found'}
            </p>
          </div>
        ) : (
          <table className="w-full border-collapse font-mono text-[11.5px] leading-5">
            <thead>
              <tr className="text-[10px] text-text-tertiary border-b border-border text-left select-none">
                <th className="pb-1.5 w-24">OFFSET</th>
                <th className="pb-1.5 font-medium tracking-wider">
                  00 01 02 03 04 05 06 07 &nbsp; 08 09 0A 0B 0C 0D 0E 0F
                </th>
                <th className="pb-1.5 pl-4 w-44">ASCII TEXT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filteredRows.map((row) => (
                <tr key={row.offset} className="hover:bg-surface-2/60 transition-colors">
                  <td className="py-0.5 text-text-tertiary font-semibold select-none tabular-nums">
                    {row.offset}
                  </td>
                  <td className="py-0.5 text-text-primary tracking-wider tabular-nums">
                    {row.hex.slice(0, 8).join(' ')} &nbsp; {row.hex.slice(8).join(' ')}
                  </td>
                  <td className="py-0.5 pl-4 text-text-secondary border-l border-border/40 select-all tracking-normal whitespace-pre font-mono">
                    {row.ascii}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
