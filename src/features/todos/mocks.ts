import { MockEntityDatabase } from "../../lib/mock-db";
import { createMockHandlers } from "../../lib/mock-handlers-factory";
import { Todo, NewTodo, TodoUpdate } from "./types";

// Initial mock data
const initialTodos: Todo[] = [
  {
    id: "1",
    title: "Learn React",
    completed: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: "2",
    title: "Build Todo App",
    completed: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: "3",
    title: "Master TypeScript",
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    title: "Deploy application to production",
    completed: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: "5",
    title: "Write unit tests",
    completed: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "6",
    title: "Learn about AI integration",
    completed: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
];

export const todoMockDb = new MockEntityDatabase<Todo, NewTodo, TodoUpdate>(
  initialTodos
);

// Create MSW handlers for Todo API
export const todoHandlers = createMockHandlers("todos", todoMockDb, {
  baseUrl: "https://api.example.com",
  delayMs: 300,
});
