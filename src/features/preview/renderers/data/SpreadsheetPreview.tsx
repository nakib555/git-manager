import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Table, Search, AlertCircle } from 'lucide-react';

interface SpreadsheetPreviewProps {
  rawBuffer?: Uint8Array;
  fileName: string;
}

export const SpreadsheetPreview: React.FC<SpreadsheetPreviewProps> = ({ rawBuffer, fileName }) => {
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [activeSheet, setActiveSheet] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!rawBuffer || rawBuffer.length === 0) {
      setError('Spreadsheet file is empty.');
      return;
    }
    try {
      const wb = XLSX.read(rawBuffer, { type: 'array' });
      setWorkbook(wb);
      if (wb.SheetNames.length > 0) {
        setActiveSheet(wb.SheetNames[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to parse spreadsheet file.');
    }
  }, [rawBuffer]);

  const sheetData = useMemo(() => {
    if (!workbook || !activeSheet) return [];
    const sheet = workbook.Sheets[activeSheet];
    if (!sheet) return [];
    return XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: '' });
  }, [workbook, activeSheet]);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return sheetData;
    const q = searchQuery.toLowerCase();
    return sheetData.filter((row) =>
      row.some((cell) => String(cell).toLowerCase().includes(q))
    );
  }, [sheetData, searchQuery]);

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-text-secondary">
        <AlertCircle size={40} className="text-rose-500 mb-3 opacity-80" />
        <p className="text-sm font-medium text-text-primary">Unable to read spreadsheet</p>
        <p className="text-xs text-text-tertiary mt-1 max-w-sm">{error}</p>
      </div>
    );
  }

  if (!workbook) {
    return (
      <div className="w-full h-full flex items-center justify-center text-xs text-text-secondary">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mr-2" />
        Loading spreadsheet...
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-surface-1 overflow-hidden">
      <div className="px-4 py-2 border-b border-border bg-surface-2/40 flex items-center justify-between gap-4 shrink-0">
        <div className="relative max-w-xs w-full">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search spreadsheet cells..."
            className="w-full bg-surface-1 border border-border rounded-lg pl-8 pr-2.5 py-1 text-xs text-text-primary outline-none focus:border-accent"
          />
        </div>
        <div className="text-[11px] font-mono text-text-tertiary tabular-nums">
          {filteredData.length} rows · {sheetData[0]?.length || 0} columns
        </div>
      </div>

      <div className="flex-1 overflow-auto text-xs font-mono">
        <table className="w-full border-collapse border-spacing-0">
          <tbody>
            {filteredData.slice(0, 150).map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-surface-2/60 transition-colors border-b border-border">
                <td className="w-12 px-2 py-1.5 text-center text-[10px] text-text-tertiary bg-surface-2/50 border-r border-border select-none sticky left-0 tabular-nums">
                  {rIdx + 1}
                </td>
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="px-3 py-1.5 border-r border-border truncate max-w-[240px]">
                    {String(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {workbook.SheetNames.length > 1 && (
        <div className="px-4 py-2 border-t border-border bg-surface-2/70 flex items-center gap-1.5 overflow-x-auto shrink-0">
          <span className="text-[11px] text-text-tertiary mr-1 font-sans">Sheets:</span>
          {workbook.SheetNames.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setActiveSheet(name)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                activeSheet === name
                  ? 'bg-surface-1 text-text-primary shadow-xs font-semibold border border-border'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
