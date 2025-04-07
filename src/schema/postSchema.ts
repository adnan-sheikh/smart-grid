import { z } from "zod";
import { entitySchema } from "../lib/schema";

export const postSchema = entitySchema.extend({
  title: z.string(),
  content: z.string(),
  author: z.string(),
  published: z.boolean(),
});

export const newPostSchema = postSchema.pick({
  title: true,
  content: true,
  author: true,
  published: true,
});

export const postUpdateSchema = postSchema
  .pick({
    title: true,
    content: true,
    published: true,
  })
  .partial();

export const postFiltersSchema = z.object({
  published: z.boolean().optional(),
});
