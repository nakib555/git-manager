import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface PaginationControlsProps {
  currentPage: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  compact?: boolean;
  className?: string;
  itemName?: string;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalItems,
  pageSize = 10,
  onPageChange,
  isLoading = false,
  compact = false,
  className = '',
  itemName = 'items',
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const startItem = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = Math.min(safePage * pageSize, totalItems);

  // Generate page numbers with intelligent truncation
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis-left' | 'ellipsis-right')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) {
        pages.push('ellipsis-left');
      }
      const start = Math.max(2, safePage - 1);
      const end = Math.min(totalPages - 1, safePage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (safePage < totalPages - 2) {
        pages.push('ellipsis-right');
      }
      pages.push(totalPages);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav
      aria-label="Pagination Navigation"
      role="navigation"
      className={`flex items-center justify-between gap-3 select-none ${className}`}
    >
      {/* Range Status Label */}
      <div className="flex items-center gap-1.5 text-xs text-text-muted">
        <span>Showing</span>
        <span className="font-semibold text-text-main font-mono">
          {startItem}–{endItem}
        </span>
        <span>of</span>
        <span className="font-semibold text-text-main font-mono">
          {totalItems}
        </span>
        <span className="hidden sm:inline">{itemName}</span>
        <span className="text-[10px] text-primary font-mono ml-1.5 px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20">
          (10/page)
        </span>
      </div>

      {/* Button Navigation Group */}
      <div className="flex items-center gap-1">
        {/* First page button */}
        {!compact && (
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={safePage <= 1 || isLoading}
            aria-label="Go to first page"
            title="First page"
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-border text-text-muted hover:text-text-main hover:bg-hover/20 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ChevronsLeft size={13} />
          </button>
        )}

        {/* Previous page button */}
        <button
          type="button"
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage <= 1 || isLoading}
          aria-label="Go to previous page"
          title="Previous page"
          className="h-7 px-2 flex items-center gap-1 rounded-lg border border-border text-text-muted hover:text-text-main hover:bg-hover/20 disabled:opacity-30 disabled:pointer-events-none transition-colors text-xs font-medium cursor-pointer"
        >
          <ChevronLeft size={13} />
          {!compact && <span className="hidden md:inline">Prev</span>}
        </button>

        {/* Page number buttons */}
        <div className="flex items-center gap-1 mx-0.5">
          {compact ? (
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded border border-border bg-card text-text-main">
              {safePage} / {totalPages}
            </span>
          ) : (
            pages.map((item, index) => {
              if (item === 'ellipsis-left' || item === 'ellipsis-right') {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="w-6 text-center text-text-muted text-xs font-mono select-none"
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
                  className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-primary text-white font-bold shadow-sm shadow-primary/30 border border-primary'
                      : 'text-text-main border border-border/60 hover:border-border hover:bg-hover/20'
                  }`}
                >
                  {item}
                </button>
              );
            })
          )}
        </div>

        {/* Next page button */}
        <button
          type="button"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= totalPages || isLoading}
          aria-label="Go to next page"
          title="Next page"
          className="h-7 px-2 flex items-center gap-1 rounded-lg border border-border text-text-muted hover:text-text-main hover:bg-hover/20 disabled:opacity-30 disabled:pointer-events-none transition-colors text-xs font-medium cursor-pointer"
        >
          {!compact && <span className="hidden md:inline">Next</span>}
          <ChevronRight size={13} />
        </button>

        {/* Last page button */}
        {!compact && (
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            disabled={safePage >= totalPages || isLoading}
            aria-label="Go to last page"
            title="Last page"
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-border text-text-muted hover:text-text-main hover:bg-hover/20 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ChevronsRight size={13} />
          </button>
        )}
      </div>
    </nav>
  );
};
