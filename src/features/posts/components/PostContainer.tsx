import React from "react";
import { usePagination } from "../../../lib/use-pagination";
import { useSearchAndAIFilter } from "../../../lib/use-search-and-ai-filter";
import { SortParams } from "../../../lib/schema";
import { usePostList } from "../hooks";
import { PostList } from "./PostList";
import { PostFilters } from "../types";
import { AIPromptInput } from "../../../components/AIPromptInput";

interface PostContainerProps {
  instanceId: string;
  title?: string;
  initialSortField?: string;
  initialSortOrder?: "asc" | "desc";
  initialLimit?: number;
  initialShowPublished?: boolean | undefined;
}

export const PostContainer: React.FC<PostContainerProps> = ({
  instanceId,
  title = "Posts",
  initialSortField = "createdAt",
  initialSortOrder = "desc",
  initialLimit = 5,
  initialShowPublished,
}) => {
  // Use the pagination hook for state management
  const {
    pagination,
    filters,
    sort,
    updateFilters,
    updateSort,
    setFilters,
    page,
    setPage
  } = usePagination({
    initialPage: 1,
    initialLimit,
    initialFilters:
      initialShowPublished !== undefined
        ? { published: initialShowPublished }
        : undefined,
    initialSort: {
      field: initialSortField,
      order: initialSortOrder,
    } as SortParams,
  });

  // Use our generic search and AI filter hook
  // Posts don't have a search field in their filter schema, so we set hasSearchField: false
  const { aiFilter } = useSearchAndAIFilter<PostFilters>({
    entityType: "posts",
    initialFilters: filters as PostFilters | undefined,
    setFilters: setFilters as (filters: PostFilters | undefined) => void,
    updateFilters: updateFilters as (filters: PostFilters | undefined) => void,
    updateSort,
    setPage,
    filters: filters as PostFilters | undefined,
    hasSearchField: false // Posts don't support search in the current schema
  });

  // Fetch posts using our hook
  const { data, isLoading, error } = usePostList(
    pagination.page,
    pagination.limit,
    filters as PostFilters,
    sort,
    instanceId
  );

  // Handle filter change
  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (value === "all") {
      updateFilters(undefined);
    } else {
      updateFilters({ published: value === "published" } as PostFilters);
    }
    setPage(1);
  };

  // Handle sort change
  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const [field, order] = event.target.value.split(":");
    updateSort({
      field,
      order: order as "asc" | "desc",
    });
    setPage(1);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // We're enhancing the original PostList with AI filtering
  return (
    <div className="post-list-container">
      {/* AI Prompt Input */}
      <AIPromptInput
        prompt={aiFilter.prompt}
        setPrompt={aiFilter.setPrompt}
        response={aiFilter.response}
        processing={aiFilter.processing}
        submitPrompt={aiFilter.submitPrompt}
        clearPrompt={aiFilter.clearPrompt}
        placeholderText="Ask AI to filter posts (e.g., 'Show published posts')"
      />
      
      <PostList
        title={title}
        data={data}
        isLoading={isLoading}
        error={error}
        filters={filters as PostFilters}
        page={page}
        currentSortValue={`${sort?.field}:${sort?.order}`}
        currentFilterValue={
          filters?.published !== undefined
            ? filters.published
              ? "published"
              : "drafts"
            : "all"
        }
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        onPageChange={handlePageChange}
      />
    </div>
  );
};