import { createApi } from "../../lib/api-factory";
import { Post, NewPost, PostUpdate } from "./types";

// Create the Post API with our factory
export const postApi = createApi<Post, NewPost, PostUpdate>({
  baseUrl: "https://api.example.com",
  entityName: "posts",
});
