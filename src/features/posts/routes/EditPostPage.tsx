import React from "react";
import { Link, useParams } from "react-router-dom";
import { usePostById } from "../hooks";
import { PostForm } from "../components/PostForm";

export const EditPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: post, isLoading, error } = usePostById(id || "");

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

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <Link to="/posts" className="text-blue-500 hover:underline">
          &larr; Back to Posts
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">Edit Post</h1>

      <PostForm post={post} isEdit={true} />
    </div>
  );
};
