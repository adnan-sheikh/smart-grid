import React, { useState, useEffect, useCallback } from "react";
import { usePagination } from "../../../lib/use-pagination";
import { useAIFilter } from "../../../lib/use-ai-filter";
import { SortParams } from "../../../lib/schema";
import { useTodoList } from "../hooks";
import { TodoItem } from "./TodoItem";
import { AIPromptInput } from "../../../components/AIPromptInput";
import { SearchInput } from "../../../components/SearchInput";
import { TodoFilters } from "../types";

interface TodoListProps {
  instanceId: string;
  title?: string;
  initialSortField?: string;
  initialSortOrder?: "asc" | "desc";
  initialLimit?: number;
  initialShowCompleted?: boolean | undefined;
}

export const TodoList: React.FC<TodoListProps> = ({
  instanceId,
  title = "Todo List",
  initialSortField = "title",
  initialSortOrder = "asc",
  initialLimit = 5,
  initialShowCompleted,
}) => {
  // Search term state (separate from filters to avoid rerender loops)
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearchTerm, setActiveSearchTerm] = useState("");

  // Use the pagination hook for state management
  const {
    pagination,
    filters,
    sort,
    goToPage,
    updateFilters,
    updateSort,
    page,
    setPage,
    setFilters,
  } = usePagination({
    initialPage: 1,
    initialLimit,
    initialFilters:
      initialShowCompleted !== undefined
        ? { completed: initialShowCompleted }
        : undefined,
    initialSort: {
      field: initialSortField,
      order: initialSortOrder,
    } as SortParams,
  });

  // Track whether we're handling an AI update
  const [isAiUpdate, setIsAiUpdate] = useState(false);

  // Custom filter update that properly handles search terms
  const handleFilterUpdate = useCallback(
    (newFilters: TodoFilters | undefined) => {
      // If this is an AI update, use the filters directly to prevent search term persistence
      if (isAiUpdate) {
        setFilters(newFilters);
        setIsAiUpdate(false);

        // Update search term if AI provides one
        if (newFilters?.search) {
          setSearchTerm(newFilters.search as string);
          setActiveSearchTerm(newFilters.search as string);
        } else if (
          newFilters &&
          "search" in newFilters &&
          newFilters.search === undefined
        ) {
          // AI explicitly cleared the search
          setSearchTerm("");
          setActiveSearchTerm("");
        }

        return;
      }

      // For normal updates, manage search term separately
      if (activeSearchTerm) {
        if (!newFilters) {
          // Just use search term as filter if no other filters
          setFilters({ search: activeSearchTerm });
        } else if (
          !("search" in newFilters) ||
          newFilters.search !== activeSearchTerm
        ) {
          // Add search term to existing filters
          setFilters({ ...newFilters, search: activeSearchTerm });
        } else {
          // Search already in filters, use as is
          setFilters(newFilters);
        }
      } else {
        // No active search term, remove search from filters if present
        if (newFilters && "search" in newFilters) {
          const { search, ...rest } = newFilters;
          setFilters(Object.keys(rest).length > 0 ? rest : undefined);
        } else {
          setFilters(newFilters);
        }
      }
    },
    [setFilters, activeSearchTerm, isAiUpdate]
  );

  // Effect to handle changes in active search term
  useEffect(() => {
    if (!isAiUpdate) {
      handleFilterUpdate(filters as TodoFilters);
    }
  }, [activeSearchTerm, handleFilterUpdate, filters, isAiUpdate]);

  // Use our backend AI filter hook with custom callbacks
  const aiFilter = useAIFilter({
    entityType: "todos",
    onFilterChange: (newFilters) => {
      // Set the flag to indicate this is an AI-driven update
      setIsAiUpdate(true);

      // Update the filters directly
      updateFilters(newFilters);

      // Reset to page 1 for new filter set
      setPage(1);
    },
    onSortChange: (newSort) => {
      updateSort(newSort);
      setPage(1);
    },
  });

  // Handle AI prompt submission to ensure filter state is cleared
  const handleAiPromptSubmit = () => {
    // Clear the flag when a new prompt is submitted
    setIsAiUpdate(true);
    return aiFilter.submitPrompt();
  };

  // Fetch todos using our hook
  const { data, isLoading, error } = useTodoList(
    pagination.page,
    pagination.limit,
    filters as TodoFilters,
    sort,
    instanceId
  );

  // Handle filter change
  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;

    if (value === "all") {
      // Remove completed filter, keep other filters
      const { completed, ...restFilters } = (filters || {}) as TodoFilters;
      handleFilterUpdate(
        Object.keys(restFilters).length > 0
          ? (restFilters as TodoFilters)
          : undefined
      );
    } else {
      // Add/update completed filter
      handleFilterUpdate({
        ...((filters || {}) as TodoFilters),
        completed: value === "completed",
      });
    }

    // Reset to page 1 when filter changes
    setPage(1);
  };

  // Handle sort change
  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const [field, order] = event.target.value.split(":");
    updateSort({
      field,
      order: order as "asc" | "desc",
    });

    // Reset to page 1 when sort changes
    setPage(1);
  };

  // Handle input change without triggering search
  const handleSearchInputChange = (value: string) => {
    setSearchTerm(value);
  };

  // Handle search execution
  const handleSearch = (term: string) => {
    setActiveSearchTerm(term);
    setPage(1);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Calculate current filter value for select dropdown
  const currentFilterValue =
    filters?.completed !== undefined
      ? filters.completed
        ? "completed"
        : "active"
      : "all";

  const currentSortValue = `${sort?.field}:${sort?.order}`;

  // Loading state
  if (isLoading) {
    return <div className="text-center py-4">Loading todos...</div>;
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-4 text-red-500">Error loading todos!</div>
    );
  }

  return (
    <div className="todo-list mb-8">
      {title && <h2 className="text-xl font-medium mb-4">{title}</h2>}

      {/* AI Prompt Input with custom submit handler */}
      <AIPromptInput
        prompt={aiFilter.prompt}
        setPrompt={aiFilter.setPrompt}
        response={aiFilter.response}
        processing={aiFilter.processing}
        submitPrompt={handleAiPromptSubmit}
        clearPrompt={aiFilter.clearPrompt}
        placeholderText="Ask AI to filter todos (e.g., 'Show completed todos')"
      />

      {/* Search Input */}
      <div className="mb-4">
        <SearchInput
          value={searchTerm}
          onChange={handleSearchInputChange}
          onSearch={handleSearch}
          placeholder="Search todos..."
          debounceMs={500} // Wait 500ms before triggering search
        />
      </div>

      {/* Traditional Controls */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div>
          <select
            className="p-2 border rounded"
            onChange={handleFilterChange}
            value={currentFilterValue}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <select
            className="p-2 border rounded"
            onChange={handleSortChange}
            value={currentSortValue}
          >
            <option value="title:asc">Title (A-Z)</option>
            <option value="title:desc">Title (Z-A)</option>
            <option value="createdAt:desc">Newest First</option>
            <option value="createdAt:asc">Oldest First</option>
          </select>
        </div>

        {data && (
          <div className="ml-auto text-sm text-gray-500">
            Showing {data.data.length} of {data.meta.total} todos
            {filters?.search && <span> matching "{filters.search}"</span>}
            {filters?.completed !== undefined && (
              <span> {filters.completed ? "(completed)" : "(active)"}</span>
            )}
          </div>
        )}
      </div>

      {/* Todo Items */}
      {data && data.data.length > 0 ? (
        <div className="border rounded-lg overflow-hidden mb-4">
          {data.data.map((todo) => (
            <TodoItem key={todo.id} todo={todo} />
          ))}
        </div>
      ) : (
        <div className="border rounded-lg p-6">
          <div className="text-center py-4 text-gray-500">
            <p>
              {filters?.search
                ? `No todos found matching "${filters.search}".`
                : "No todos found."}
            </p>
          </div>
        </div>
      )}

      {/* Pagination */}
      {data && data.meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>

          <span className="py-1 px-2">
            Page {page} of {data.meta.totalPages}
          </span>

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= data.meta.totalPages}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
