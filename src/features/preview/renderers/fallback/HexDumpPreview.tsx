import React, { useMemo, useState } from 'react';
import { generateHexDump, formatBytes } from '../../utils/formatters';
import { Binary, Search } from 'lucide-react';

interface HexDumpPreviewProps {
  rawBuffer?: Uint8Array;
  fileName: string;
}

export const HexDumpPreview: React.FC<HexDumpPreviewProps> = ({ rawBuffer, fileName }) => {
  const [filterHex, setFilterHex] = useState('');

  const { rows, totalBytes, isTruncated } = useMemo(() => {
    if (!rawBuffer) return { rows: [], totalBytes: 0, isTruncated: false };
    return generateHexDump(rawBuffer, 16384); // 16KB of hex rows
  }, [rawBuffer]);

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

  return (
    <div className="w-full h-full flex flex-col bg-surface-1 overflow-hidden font-mono text-xs">
      <div className="px-4 py-2 border-b border-border bg-surface-2/40 flex items-center justify-between gap-4 shrink-0">
        <div className="relative max-w-xs w-full">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            value={filterHex}
            onChange={(e) => setFilterHex(e.target.value)}
            placeholder="Search hex / ASCII..."
            className="w-full bg-surface-1 border border-border rounded-lg pl-8 pr-2.5 py-1 text-xs text-text-primary outline-none focus:border-accent"
          />
        </div>
        <div className="flex items-center gap-2 text-[11px] text-text-tertiary tabular-nums">
          <Binary size={13} />
          <span>{formatBytes(totalBytes)}</span>
          {isTruncated && <span className="text-amber-600">(showing first 16KB)</span>}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 select-text">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-[10px] text-text-tertiary border-b border-border text-left select-none">
              <th className="pb-1.5 w-24">OFFSET</th>
              <th className="pb-1.5">00 01 02 03 04 05 06 07  08 09 0A 0B 0C 0D 0E 0F</th>
              <th className="pb-1.5 pl-4 w-40">DECODED TEXT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {filteredRows.map((row) => (
              <tr key={row.offset} className="hover:bg-surface-2/50 transition-colors">
                <td className="py-1 text-text-tertiary font-medium select-none tabular-nums">
                  {row.offset}
                </td>
                <td className="py-1 text-text-primary tracking-wider tabular-nums">
                  {row.hex.slice(0, 8).join(' ')} &nbsp; {row.hex.slice(8).join(' ')}
                </td>
                <td className="py-1 pl-4 text-text-secondary border-l border-border/40 select-all tracking-normal">
                  {row.ascii}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
