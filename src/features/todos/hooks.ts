import { createEntityHooks } from "../../lib/query-hooks";
import { todoApi } from "./api";
import { Todo, NewTodo, TodoUpdate } from "./types";

// Create Todo-specific React Query hooks
export const todoHooks = createEntityHooks<Todo, NewTodo, TodoUpdate>(
  "todos",
  todoApi
);

// Export individual hooks for convenience
export const {
  useList: useTodoList,
  useById: useTodoById,
  useCreate: useCreateTodo,
  useUpdate: useUpdateTodo,
  useDelete: useDeleteTodo,
} = todoHooks;
