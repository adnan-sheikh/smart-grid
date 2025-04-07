import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Post } from "../types";
import { useCreatePost, useUpdatePost } from "../hooks";

interface PostFormProps {
  post?: Post;
  isEdit?: boolean;
}

export const PostForm: React.FC<PostFormProps> = ({ post, isEdit = false }) => {
  const navigate = useNavigate();
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [published, setPublished] = useState(false);

  // Load post data if editing
  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
      setAuthor(post.author);
      setPublished(post.published);
    }
  }, [post]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim() || (!isEdit && !author.trim())) {
      alert("Please fill out all required fields.");
      return;
    }

    if (isEdit && post) {
      // Update existing post
      updatePost.mutate(
        {
          id: post.id,
          data: {
            title: title.trim(),
            content: content.trim(),
            published,
          },
        },
        {
          onSuccess: () => {
            navigate("/posts");
          },
        }
      );
    } else {
      // Create new post
      createPost.mutate(
        {
          title: title.trim(),
          content: content.trim(),
          author: author.trim(),
          published,
        },
        {
          onSuccess: () => {
            navigate("/posts");
          },
        }
      );
    }
  };

  const isPending = createPost.isPending || updatePost.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isPending}
          required
        />
      </div>

      {!isEdit && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Author *
          </label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isPending || isEdit}
            required
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Content *
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isPending}
          required
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="published"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          disabled={isPending}
        />
        <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
          Publish immediately
        </label>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={isPending}
        >
          {isPending ? "Saving..." : isEdit ? "Update Post" : "Create Post"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/posts")}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          disabled={isPending}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
