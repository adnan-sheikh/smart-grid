import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { usePostById, useDeletePost } from "../hooks";

export const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: post, isLoading, error } = usePostById(id || "");
  const deleteMutation = useDeletePost();

  if (isLoading) {
    return <div className="text-center py-8">Loading post...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Error loading post!{" "}
        <Link to="/posts" className="underline">
          Back to posts
        </Link>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-8">
        Post not found.{" "}
        <Link to="/posts" className="underline">
          Back to posts
        </Link>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this post?")) {
      deleteMutation.mutate(post.id, {
        onSuccess: () => {
          navigate("/posts");
        },
      });
    }
  };

  // Format dates nicely
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link to="/posts" className="text-blue-500 hover:underline">
          &larr; Back to Posts
        </Link>
      </div>

      <article className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <header className="mb-6">
            <div className="flex justify-between items-start">
              <h1 className="text-2xl font-bold">
                {post.title}
                {!post.published && (
                  <span className="ml-3 px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded">
                    Draft
                  </span>
                )}
              </h1>
            </div>

            <div className="text-sm text-gray-600 mt-1">
              By {post.author} • Published {formatDate(post.createdAt)}
              {post.updatedAt > post.createdAt &&
                ` • Updated ${formatDate(post.updatedAt)}`}
            </div>
          </header>

          <div className="prose max-w-none">
            {post.content.split("\n").map((paragraph, index) => (
              <p key={index} className="mb-4">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-8 flex space-x-4">
            <Link
              to={`/posts/edit/${post.id}`}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Edit
            </Link>

            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </article>
    </div>
  );
};
