import React from "react";
import { Todo } from "../types";
import { useUpdateTodo, useDeleteTodo } from "../hooks";

interface TodoItemProps {
  todo: Todo;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo }) => {
  const updateMutation = useUpdateTodo();
  const deleteMutation = useDeleteTodo();

  const handleToggleComplete = () => {
    updateMutation.mutate({
      id: todo.id,
      data: { completed: !todo.completed },
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this todo?")) {
      deleteMutation.mutate(todo.id);
    }
  };

  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggleComplete}
          className="h-5 w-5"
        />
        <span
          className={`text-lg ${
            todo.completed ? "line-through text-gray-500" : ""
          }`}
        >
          {todo.title}
        </span>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={handleDelete}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          disabled={deleteMutation.isPending}
        >
          {deleteMutation.isPending ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
};
