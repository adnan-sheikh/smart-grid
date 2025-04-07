import { MockEntityDatabase } from "../../lib/mock-db";
import { createMockHandlers } from "../../lib/mock-handlers-factory";
import { Post, NewPost, PostUpdate } from "./types";

// Initial mock data
const initialPosts: Post[] = [
  {
    id: "1",
    title: "Getting Started with React",
    content:
      "React is a JavaScript library for building user interfaces. It allows you to create reusable UI components and efficiently update the DOM when your data changes.",
    author: "Alice Johnson",
    published: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  },
  {
    id: "2",
    title: "Advanced TypeScript Techniques",
    content:
      "TypeScript offers powerful features for type safety. This post explores advanced concepts like generics, conditional types, and utility types.",
    author: "Bob Smith",
    published: true,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    id: "3",
    title: "React Query Fundamentals",
    content:
      "React Query is a library for managing server state in React applications. It provides tools for fetching, caching, and updating data.",
    author: "Charlie Davis",
    published: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: "4",
    title: "Draft: State Management Options",
    content:
      "This is a draft comparing different state management libraries including Redux, MobX, Zustand, and Jotai.",
    author: "Diana Evans",
    published: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
];

// Create Post mock database
export const postMockDb = new MockEntityDatabase<Post, NewPost, PostUpdate>(
  initialPosts
);

// Create MSW handlers for Post API
export const postHandlers = createMockHandlers("posts", postMockDb, {
  baseUrl: "https://api.example.com",
  delayMs: 0,
});
