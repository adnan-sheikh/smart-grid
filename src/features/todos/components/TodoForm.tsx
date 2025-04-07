import React, { useState } from "react";
import { useCreateTodo } from "../hooks";

export const TodoForm: React.FC = () => {
  const [title, setTitle] = useState("");
  const createTodo = useCreateTodo();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (title.trim()) {
      createTodo.mutate(
        {
          title: title.trim(),
          completed: false,
        },
        {
          onSuccess: () => {
            setTitle("");
          },
        }
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex">
        <input
          type="text"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-grow px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={createTodo.isPending}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={createTodo.isPending || !title.trim()}
        >
          {createTodo.isPending ? "Adding..." : "Add Todo"}
        </button>
      </div>
    </form>
  );
};
