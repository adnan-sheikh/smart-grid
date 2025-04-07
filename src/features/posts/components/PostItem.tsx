import React from "react";
import { Link } from "react-router-dom";
import { Post } from "../types";
import { useUpdatePost, useDeletePost } from "../hooks";

interface PostItemProps {
  post: Post;
  detailed?: boolean;
}

export const PostItem: React.FC<PostItemProps> = ({
  post,
  detailed = false,
}) => {
  const updateMutation = useUpdatePost();
  const deleteMutation = useDeletePost();

  const handleTogglePublish = () => {
    updateMutation.mutate({
      id: post.id,
      data: { published: !post.published },
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this post?")) {
      deleteMutation.mutate(post.id);
    }
  };

  // Format dates nicely
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className={`${detailed ? "p-6" : "p-4"} border-b last:border-b-0`}>
      <div className="flex justify-between items-start mb-2">
        <h3
          className={`font-medium ${detailed ? "text-xl" : "text-lg"} ${
            !post.published ? "text-gray-500" : ""
          }`}
        >
          {post.title}
        </h3>
        <div className="flex items-center space-x-2">
          {!post.published && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
              Draft
            </span>
          )}
        </div>
      </div>

      <div className="text-sm text-gray-600 mb-2">
        By {post.author} • {formatDate(post.createdAt)}
      </div>

      <div
        className={`text-gray-700 ${detailed ? "mb-4" : "mb-2 line-clamp-2"}`}
      >
        {post.content}
      </div>

      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-500">
          {post.updatedAt > post.createdAt &&
            `Updated ${formatDate(post.updatedAt)}`}
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleTogglePublish}
            className={`px-3 py-1 text-sm rounded ${
              post.published
                ? "bg-gray-200 hover:bg-gray-300 text-gray-800"
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending
              ? "Updating..."
              : post.published
              ? "Unpublish"
              : "Publish"}
          </button>

          <Link
            to={`/posts/edit/${post.id}`}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
          >
            Edit
          </Link>

          <button
            onClick={handleDelete}
            className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};
