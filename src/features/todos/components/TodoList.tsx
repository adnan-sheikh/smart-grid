import React from "react";
import { TodoItem } from "./TodoItem";
import { SearchInput } from "../../../components/SearchInput";
import { TodoFilters } from "../types";
import { PaginatedResponse } from "../../../lib/schema";
import { Todo } from "../types";

interface TodoListProps {
  title: string;
  data: PaginatedResponse<Todo> | undefined;
  isLoading: boolean;
  error: unknown;
  filters: TodoFilters | undefined;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSearch: (term: string) => void;
  page: number;
  setPage: (page: number) => void;
  currentSortValue: string;
  currentFilterValue: string;
  onFilterChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onSortChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const TodoList: React.FC<TodoListProps> = ({
  title,
  data,
  isLoading,
  error,
  filters,
  searchTerm,
  setSearchTerm,
  onSearch,
  page,
  setPage,
  currentSortValue,
  currentFilterValue,
  onFilterChange,
  onSortChange,
}) => {
  // Handle input change without triggering search
  const handleSearchInputChange = (value: string) => {
    setSearchTerm(value);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

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

      {/* Search Input */}
      <div className="mb-4">
        <SearchInput
          value={filters?.search ?? searchTerm}
          onChange={handleSearchInputChange}
          onSearch={onSearch}
          placeholder="Search todos..."
          debounceMs={500} // Wait 500ms before triggering search
        />
      </div>

      {/* Traditional Controls */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div>
          <select
            className="p-2 border rounded"
            onChange={onFilterChange}
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
            onChange={onSortChange}
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