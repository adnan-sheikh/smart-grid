import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TodoPage } from "../features/todos/routes/TodoPage";
import { PostListPage } from "../features/posts/routes/PostListPage";
import { CreatePostPage } from "../features/posts/routes/CreatePostPage";
import { EditPostPage } from "../features/posts/routes/EditPostPage";
import { PostDetailPage } from "../features/posts/routes/PostDetailPage";
import { MainLayout } from "./layout";
import { BulkUploadPage } from "../features/bulk-upload";

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          {/* Default redirect */}
          <Route index element={<Navigate to="/todos" replace />} />

          {/* Todo routes */}
          <Route path="todos" element={<TodoPage />} />

          {/* Post routes */}
          <Route path="posts" element={<PostListPage />} />
          <Route path="posts/new" element={<CreatePostPage />} />
          <Route path="posts/edit/:id" element={<EditPostPage />} />
          <Route path="posts/:id" element={<PostDetailPage />} />

          {/* Bulk upload routes */}
          <Route path="bulk-upload" element={<BulkUploadPage />} />

          {/* Not found route */}
          <Route path="*" element={<div>Page not found</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
