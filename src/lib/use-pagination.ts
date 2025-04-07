import { useState } from "react";
import { PaginationParams, SortParams, FilterParams } from "./schema";

interface UsePaginationParams {
  initialPage?: number;
  initialLimit?: number;
  initialFilters?: FilterParams;
  initialSort?: SortParams;
}

export function usePagination({
  initialPage = 1,
  initialLimit = 10,
  initialFilters,
  initialSort,
}: UsePaginationParams = {}) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [filters, setFilters] = useState<FilterParams | undefined>(
    initialFilters
  );
  const [sort, setSort] = useState<SortParams | undefined>(initialSort);

  // Function to go to a specific page
  const goToPage = (newPage: number) => {
    setPage(newPage);
  };

  // Change page size
  const changeLimit = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  };

  // Update filters
  const updateFilters = (newFilters: FilterParams | undefined) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when changing filters
  };

  // Update sort
  const updateSort = (newSort: SortParams | undefined) => {
    setSort(newSort);
    setPage(1); // Reset to first page when changing sort
  };

  // Reset all pagination state
  const reset = () => {
    setPage(initialPage);
    setLimit(initialLimit);
    setFilters(initialFilters);
    setSort(initialSort);
  };

  // Current pagination state
  const pagination: PaginationParams = { page, limit };

  return {
    pagination,
    filters,
    sort,
    goToPage,
    changeLimit,
    updateFilters,
    updateSort,
    reset,
    // For direct state access if needed
    page,
    limit,
    setPage,
    setLimit,
    setFilters,
    setSort,
  };
}
