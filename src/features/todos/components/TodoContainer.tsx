import React from "react";
import { usePagination } from "../../../lib/use-pagination";
import { useSearchAndAIFilter } from "../../../lib/use-search-and-ai-filter";
import { SortParams } from "../../../lib/schema";
import { useTodoList } from "../hooks";
import { TodoList } from "./TodoList";
import { TodoFilters } from "../types";
import { AIPromptInput } from "../../../components/AIPromptInput";

interface TodoContainerProps {
  instanceId: string;
  title?: string;
  initialSortField?: string;
  initialSortOrder?: "asc" | "desc";
  initialLimit?: number;
  initialShowCompleted?: boolean | undefined;
}

export const TodoContainer: React.FC<TodoContainerProps> = ({
  instanceId,
  title = "Todo List",
  initialSortField = "title",
  initialSortOrder = "asc",
  initialLimit = 5,
  initialShowCompleted,
}) => {
  // Use the pagination hook for state management
  const {
    pagination,
    filters,
    sort,
    page,
    setPage,
    updateFilters,
    updateSort,
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

  // Use our generic search and AI filter hook
  const {
    searchTerm,
    setSearchTerm,
    handleSearch,
    handleFilterUpdate,
    aiFilter,
  } = useSearchAndAIFilter<TodoFilters>({
    entityType: "todos",
    initialFilters: filters as TodoFilters | undefined,
    setFilters: setFilters as (filters: TodoFilters | undefined) => void,
    updateFilters: updateFilters as (filters: TodoFilters | undefined) => void,
    updateSort,
    setPage,
    filters: filters as TodoFilters | undefined,
    hasSearchField: true, // Todos support search
    searchFieldName: "search",
  });

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

  return (
    <div className="todo-container">
      {/* AI Prompt Input */}
      <AIPromptInput
        prompt={aiFilter.prompt}
        setPrompt={aiFilter.setPrompt}
        response={aiFilter.response}
        processing={aiFilter.processing}
        submitPrompt={aiFilter.submitPrompt}
        clearPrompt={aiFilter.clearPrompt}
        placeholderText="Ask AI to filter todos (e.g., 'Show completed todos')"
      />

      <TodoList
        title={title}
        data={data}
        isLoading={isLoading}
        error={error}
        filters={filters as TodoFilters}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onSearch={handleSearch}
        page={page}
        setPage={setPage}
        currentSortValue={`${sort?.field}:${sort?.order}`}
        currentFilterValue={
          filters?.completed !== undefined
            ? filters.completed
              ? "completed"
              : "active"
            : "all"
        }
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
      />
    </div>
  );
};
