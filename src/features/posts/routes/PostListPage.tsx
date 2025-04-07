import React from "react";
import { PostList } from "../components/PostList";

export const PostListPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-center">Posts</h1>
        <p className="text-center text-gray-600 mt-2">Manage your blog posts</p>
      </header>

      <div className="grid grid-cols-1 gap-8">
        <PostList
          instanceId="main-posts"
          title="All Posts"
          initialSortField="createdAt"
          initialSortOrder="desc"
          initialLimit={10}
        />
      </div>
    </div>
  );
};
