import React from "react";
import { Link } from "react-router-dom";
import { usePagination } from "../../../lib/use-pagination";
import { SortParams } from "../../../lib/schema";
import { usePostList } from "../hooks";
import { PostItem } from "./PostItem";

interface PostListProps {
  instanceId: string;
  title?: string;
  initialSortField?: string;
  initialSortOrder?: "asc" | "desc";
  initialLimit?: number;
  initialShowPublished?: boolean | undefined;
}

export const PostList: React.FC<PostListProps> = ({
  instanceId,
  title = "Posts",
  initialSortField = "createdAt",
  initialSortOrder = "desc",
  initialLimit = 5,
  initialShowPublished,
}) => {
  // Use the pagination hook for state management
  const { pagination, filters, sort, goToPage, updateFilters, updateSort } =
    usePagination({
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

  // Fetch posts using our specialized hook
  const { data, isLoading, error } = usePostList(
    pagination.page,
    pagination.limit,
    filters,
    sort,
    instanceId
  );

  // Handle filter change
  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (value === "all") {
      updateFilters(undefined);
    } else {
      updateFilters({ published: value === "published" });
    }
  };

  // Handle sort change
  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const [field, order] = event.target.value.split(":");
    updateSort({
      field,
      order: order as "asc" | "desc",
    });
  };

  // Calculate current filter and sort values for select dropdowns
  const currentFilterValue =
    filters?.published !== undefined
      ? filters.published
        ? "published"
        : "drafts"
      : "all";

  const currentSortValue = `${sort?.field}:${sort?.order}`;

  // Loading state
  if (isLoading) {
    return <div className="text-center py-4">Loading posts...</div>;
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-4 text-red-500">Error loading posts!</div>
    );
  }

  return (
    <div className="post-list mb-8">
      <div className="flex justify-between items-center mb-4">
        {title && <h2 className="text-xl font-medium">{title}</h2>}
        <Link
          to="/posts/new"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          New Post
        </Link>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div>
          <select
            className="p-2 border rounded"
            onChange={handleFilterChange}
            value={currentFilterValue}
          >
            <option value="all">All Posts</option>
            <option value="published">Published Only</option>
            <option value="drafts">Drafts Only</option>
          </select>
        </div>

        <div>
          <select
            className="p-2 border rounded"
            onChange={handleSortChange}
            value={currentSortValue}
          >
            <option value="createdAt:desc">Newest First</option>
            <option value="createdAt:asc">Oldest First</option>
            <option value="title:asc">Title (A-Z)</option>
            <option value="title:desc">Title (Z-A)</option>
          </select>
        </div>

        {data && (
          <div className="ml-auto text-sm text-gray-500">
            Showing {data.data.length} of {data.meta.total} posts
          </div>
        )}
      </div>

      {/* Post Items */}
      {data && data.data.length > 0 ? (
        <div className="border rounded-lg overflow-hidden mb-4">
          {data.data.map((post) => (
            <PostItem key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="border rounded-lg p-6">
          <div className="text-center py-4 text-gray-500">
            <p>No posts found. Create one with the "New Post" button.</p>
          </div>
        </div>
      )}

      {/* Pagination */}
      {data && data.meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => goToPage(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>

          <span className="py-1 px-2">
            Page {pagination.page} of {data.meta.totalPages}
          </span>

          <button
            onClick={() =>
              goToPage(Math.min(data.meta.totalPages, pagination.page + 1))
            }
            disabled={pagination.page >= data.meta.totalPages}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
