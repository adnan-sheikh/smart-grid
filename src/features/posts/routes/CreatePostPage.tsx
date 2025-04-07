import React from "react";
import { Link } from "react-router-dom";
import { PostForm } from "../components/PostForm";

export const CreatePostPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <Link to="/posts" className="text-blue-500 hover:underline">
          &larr; Back to Posts
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">Create New Post</h1>

      <PostForm />
    </div>
  );
};
