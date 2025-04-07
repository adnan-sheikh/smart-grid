import { z } from "zod";
import {
  newTodoSchema,
  todoFiltersSchema,
  todoSchema,
  todoUpdateSchema,
} from "../../schema/todoSchema";

export type Todo = z.infer<typeof todoSchema>;
export type NewTodo = z.infer<typeof newTodoSchema>;
export type TodoUpdate = z.infer<typeof todoUpdateSchema>;
export type TodoFilters = z.infer<typeof todoFiltersSchema>;
