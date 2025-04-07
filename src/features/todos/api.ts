import { createApi } from "../../lib/api-factory";
import { Todo, NewTodo, TodoUpdate } from "./types";

// Create the Todo API with our factory
export const todoApi = createApi<Todo, NewTodo, TodoUpdate>({
  baseUrl: "https://api.example.com",
  entityName: "todos",
});
