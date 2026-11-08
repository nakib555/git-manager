import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown } from 'lucide-react';

interface CsvPreviewProps {
  content: string;
  isTsv?: boolean;
}

export const CsvPreview: React.FC<CsvPreviewProps> = ({ content, isTsv = false }) => {
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const delimiter = isTsv ? '\t' : ',';

  const rows = useMemo(() => {
    if (!content) return [];
    return content
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .map((line) => {
        // Simple CSV splitter handling basic quotes
        return line.split(delimiter).map((c) => c.replace(/^["']|["']$/g, '').trim());
      });
  }, [content, delimiter]);

  const headers = rows[0] || [];
  const bodyRows = rows.slice(1);

  const filteredRows = useMemo(() => {
    let result = bodyRows;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((row) =>
        row.some((cell) => cell.toLowerCase().includes(q))
      );
    }
    if (sortCol !== null) {
      result = [...result].sort((a, b) => {
        const valA = a[sortCol] || '';
        const valB = b[sortCol] || '';
        const numA = Number(valA);
        const numB = Number(valB);
        if (!isNaN(numA) && !isNaN(numB)) {
          return sortAsc ? numA - numB : numB - numA;
        }
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
    }
    return result;
  }, [bodyRows, search, sortCol, sortAsc]);

  const toggleSort = (colIndex: number) => {
    if (sortCol === colIndex) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(colIndex);
      setSortAsc(true);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-surface-1 overflow-hidden">
      <div className="px-4 py-2 border-b border-border bg-surface-2/40 flex items-center justify-between gap-4 shrink-0">
        <div className="relative max-w-xs w-full">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rows..."
            className="w-full bg-surface-1 border border-border rounded-lg pl-8 pr-2.5 py-1 text-xs text-text-primary outline-none focus:border-accent"
          />
        </div>
        <div className="text-[11px] font-mono text-text-tertiary tabular-nums">
          {filteredRows.length} rows · {headers.length} columns
        </div>
      </div>

      <div className="flex-1 overflow-auto text-xs font-mono">
        <table className="w-full border-collapse border-spacing-0">
          <thead className="bg-surface-2 sticky top-0 z-10 shadow-xs">
            <tr className="border-b border-border">
              <th className="w-12 px-2 py-2 text-center text-[10px] text-text-tertiary border-r border-border">#</th>
              {headers.map((h, i) => (
                <th
                  key={i}
                  onClick={() => toggleSort(i)}
                  className="px-3 py-2 text-left font-semibold text-text-primary border-r border-border truncate max-w-[200px] cursor-pointer hover:bg-surface-3 transition-colors"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate">{h || `Col ${i + 1}`}</span>
                    <ArrowUpDown size={11} className="text-text-tertiary shrink-0" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.slice(0, 200).map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-surface-2/60 transition-colors border-b border-border">
                <td className="w-12 px-2 py-1.5 text-center text-[10px] text-text-tertiary bg-surface-2/30 border-r border-border select-none tabular-nums">
                  {rIdx + 1}
                </td>
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="px-3 py-1.5 border-r border-border truncate max-w-[240px]">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
