import { createEntityHooks } from "../../lib/query-hooks";
import { postApi } from "./api";
import { Post, NewPost, PostUpdate } from "./types";

// Create Post-specific React Query hooks
export const postHooks = createEntityHooks<Post, NewPost, PostUpdate>(
  "posts",
  postApi
);

export const {
  useList: usePostList,
  useById: usePostById,
  useCreate: useCreatePost,
  useUpdate: useUpdatePost,
  useDelete: useDeletePost,
} = postHooks;
