import React from 'react';

interface PaginationSizeSelectorProps {
  isAll: boolean;
  totalItems: number;
  startItem: number;
  endItem: number;
  itemName: string;
  pageSize: number;
  pageSizeOptions: number[];
  onPageSizeChange?: (newSize: number) => void;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}

export const PaginationSizeSelector: React.FC<PaginationSizeSelectorProps> = ({
  isAll,
  totalItems,
  startItem,
  endItem,
  itemName,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  onPageChange,
  isLoading,
}) => {
  return (
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
  );
};
