import React from "react";
import { Link } from "react-router-dom";
import { PostItem } from "./PostItem";
import { PostFilters } from "../types";
import { PaginatedResponse } from "../../../lib/schema";
import { Post } from "../types";

interface PostListProps {
  title: string;
  data: PaginatedResponse<Post> | undefined;
  isLoading: boolean;
  error: unknown;
  filters: PostFilters | undefined;
  page: number;
  currentSortValue: string;
  currentFilterValue: string;
  onFilterChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onSortChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onPageChange: (newPage: number) => void;
}

export const PostList: React.FC<PostListProps> = ({
  title,
  data,
  isLoading,
  error,
  filters,
  page,
  currentSortValue,
  currentFilterValue,
  onFilterChange,
  onSortChange,
  onPageChange,
}) => {
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
            onChange={onFilterChange}
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
            onChange={onSortChange}
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
            {filters?.published !== undefined && (
              <span> ({filters.published ? "published" : "drafts"})</span>
            )}
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
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>

          <span className="py-1 px-2">
            Page {page} of {data.meta.totalPages}
          </span>

          <button
            onClick={() => onPageChange(Math.min(data.meta.totalPages, page + 1))}
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