import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface PaginationControlsProps {
  currentPage: number;
  totalItems: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (newSize: number) => void;
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
  pageSizeOptions = [10, 25, 50, -1],
  onPageSizeChange,
  onPageChange,
  isLoading = false,
  compact = false,
  className = '',
  itemName = 'items',
}) => {
  const isAll = pageSize === -1 || (totalItems > 0 && pageSize >= totalItems);
  const effectivePageSize = isAll ? Math.max(1, totalItems) : Math.max(1, pageSize);
  const totalPages = Math.max(1, Math.ceil(totalItems / effectivePageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const startItem = totalItems === 0 ? 0 : (safePage - 1) * effectivePageSize + 1;
  const endItem = Math.min(safePage * effectivePageSize, totalItems);

  // Generate page numbers with intelligent truncation
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis-left' | 'ellipsis-right')[] = [];
    if (totalPages <= 5) {
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
      className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 select-none text-text-primary ${className}`}
    >
      {/* 1. Range Status & Page Size Selector Group */}
      <div className="flex items-center justify-between sm:justify-start gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
          <span>Showing</span>
          <span className="font-semibold text-text-primary font-mono tabular-nums">
            {isAll ? `all ${totalItems}` : `${startItem}–${endItem}`}
          </span>
          <span>of</span>
          <span className="font-semibold text-text-primary font-mono tabular-nums">
            {totalItems}
          </span>
          <span className="inline text-text-tertiary">{itemName}</span>
        </div>

        {/* Page Size Switcher (10, 25, 50, All) */}
        {onPageSizeChange && totalItems > 10 && (
          <div className="flex items-center bg-surface-2 border border-border rounded-lg p-0.5 ml-auto sm:ml-2">
            {pageSizeOptions.map((opt) => {
              const label = opt === -1 ? 'All' : String(opt);
              const isActive = (opt === -1 && isAll) || (!isAll && pageSize === opt);

              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onPageSizeChange(opt);
                    onPageChange(1);
                  }}
                  disabled={isLoading}
                  className={`min-h-[28px] px-2 py-0.5 rounded-md text-[11px] font-mono tabular-nums font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-accent text-white shadow-xs font-bold'
                      : 'text-text-tertiary hover:text-text-primary hover:bg-surface-3/50'
                  }`}
                  title={opt === -1 ? 'Show all items' : `Show ${opt} items per page`}
                  aria-pressed={isActive}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Button Navigation Group (Only show if not 'All' or if multiple pages) */}
      {!isAll && totalPages > 1 && (
        <div className="flex items-center justify-between sm:justify-end gap-1.5 pt-1 sm:pt-0">
          <div className="flex items-center gap-1">
            {/* First page button */}
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

            {/* Previous page button */}
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

          {/* Page number indicators */}
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

          {/* Next & Last page buttons */}
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
      )}
    </nav>
  );
};

export default PaginationControls;
