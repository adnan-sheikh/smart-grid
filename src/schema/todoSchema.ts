import { z } from "zod";
import { entitySchema } from "../lib/schema";
export const todoSchema = entitySchema.extend({
  title: z.string(),
  completed: z.boolean(),
});

export const newTodoSchema = todoSchema.pick({
  title: true,
  completed: true,
});

export const todoUpdateSchema = todoSchema
  .pick({
    title: true,
    completed: true,
  })
  .partial();

export const todoFiltersSchema = z.object({
  completed: z.boolean().optional(),
  search: z.string().optional(),
});
