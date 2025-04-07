import React from "react";
import { TodoForm } from "../components/TodoForm";
import { TodoList } from "../components/TodoList";

export const TodoPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-center">Todo Application</h1>
        <p className="text-center text-gray-600 mt-2">
          A streamlined todo app with React Query
        </p>
      </header>

      <TodoForm />

      <TodoList
        instanceId="title-sorted"
        title="Title Sorted Todos"
        initialSortField="title"
        initialSortOrder="asc"
      />
    </div>
  );
};
