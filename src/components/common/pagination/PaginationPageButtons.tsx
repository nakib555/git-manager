import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationPageButtonsProps {
  safePage: number;
  totalPages: number;
  pages: (number | 'ellipsis-left' | 'ellipsis-right')[];
  compact: boolean;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

export const PaginationPageButtons: React.FC<PaginationPageButtonsProps> = ({
  safePage,
  totalPages,
  pages,
  compact,
  isLoading,
  onPageChange,
}) => {
  return (
    <div className="flex items-center justify-between sm:justify-end gap-1.5 pt-1 sm:pt-0">
      <div className="flex items-center gap-1">
        {!compact && (
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={safePage <= 1 || isLoading}
            aria-label="Go to first page"
            title="First page"
            className="w-8 h-8 min-w-[32px] flex items-center justify-center rounded-lg border border-border text-text-tertiary hover:text-text-primary hover:bg-surface-2 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ChevronsLeft size={14} />
          </button>
        )}

        <button
          type="button"
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage <= 1 || isLoading}
          aria-label="Go to previous page"
          title="Previous page"
          className="h-8 min-w-[36px] px-2.5 flex items-center gap-1 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-surface-2 disabled:opacity-30 disabled:pointer-events-none transition-colors text-xs font-medium cursor-pointer"
        >
          <ChevronLeft size={14} />
          <span className="hidden sm:inline">Prev</span>
        </button>
      </div>

      <div className="flex items-center gap-1">
        {compact ? (
          <span className="h-8 px-3 flex items-center justify-center text-xs font-mono tabular-nums font-semibold rounded-lg border border-border bg-surface-1 text-text-primary">
            {safePage} / {totalPages}
          </span>
        ) : (
          pages.map((item, index) => {
            if (item === 'ellipsis-left' || item === 'ellipsis-right') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="w-7 text-center text-text-tertiary text-xs font-mono select-none"
                >
                  …
                </span>
              );
            }

            const isCurrent = item === safePage;
            return (
              <button
                key={`page-${item}`}
                type="button"
                onClick={() => onPageChange(item)}
                disabled={isLoading}
                aria-current={isCurrent ? 'page' : undefined}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-mono tabular-nums font-medium transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-accent text-white font-bold shadow-xs border border-accent'
                    : 'text-text-secondary border border-border/70 hover:border-border hover:bg-surface-2 hover:text-text-primary'
                }`}
              >
                {item}
              </button>
            );
          })
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= totalPages || isLoading}
          aria-label="Go to next page"
          title="Next page"
          className="h-8 min-w-[36px] px-2.5 flex items-center gap-1 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-surface-2 disabled:opacity-30 disabled:pointer-events-none transition-colors text-xs font-medium cursor-pointer"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={14} />
        </button>

        {!compact && (
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            disabled={safePage >= totalPages || isLoading}
            aria-label="Go to last page"
            title="Last page"
            className="w-8 h-8 min-w-[32px] flex items-center justify-center rounded-lg border border-border text-text-tertiary hover:text-text-primary hover:bg-surface-2 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ChevronsRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
};
