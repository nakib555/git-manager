import React from 'react';
import { PaginationSizeSelector } from './pagination/PaginationSizeSelector';
import { PaginationPageButtons } from './pagination/PaginationPageButtons';

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

  const getPageNumbers = () => {
    const pageList: (number | 'ellipsis-left' | 'ellipsis-right')[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pageList.push(i);
    } else {
      pageList.push(1);
      if (safePage > 3) pageList.push('ellipsis-left');
      const start = Math.max(2, safePage - 1);
      const end = Math.min(totalPages - 1, safePage + 1);
      for (let i = start; i <= end; i++) pageList.push(i);
      if (safePage < totalPages - 2) pageList.push('ellipsis-right');
      pageList.push(totalPages);
    }
    return pageList;
  };

  return (
    <nav
      aria-label="Pagination Navigation"
      role="navigation"
      className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 select-none text-text-primary ${className}`}
    >
      <PaginationSizeSelector
        isAll={isAll}
        totalItems={totalItems}
        startItem={startItem}
        endItem={endItem}
        itemName={itemName}
        pageSize={pageSize}
        pageSizeOptions={pageSizeOptions}
        onPageSizeChange={onPageSizeChange}
        onPageChange={onPageChange}
        isLoading={isLoading}
      />

      {!isAll && totalPages > 1 && (
        <PaginationPageButtons
          safePage={safePage}
          totalPages={totalPages}
          pages={getPageNumbers()}
          compact={compact}
          isLoading={isLoading}
          onPageChange={onPageChange}
        />
      )}
    </nav>
  );
};

export default PaginationControls;
