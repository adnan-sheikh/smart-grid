import { z } from "zod";
import {
  postSchema,
  newPostSchema,
  postUpdateSchema,
  postFiltersSchema,
} from "../../schema/postSchema";

export type Post = z.infer<typeof postSchema>;
export type NewPost = z.infer<typeof newPostSchema>;
export type PostUpdate = z.infer<typeof postUpdateSchema>;
export type PostFilters = z.infer<typeof postFiltersSchema>;
