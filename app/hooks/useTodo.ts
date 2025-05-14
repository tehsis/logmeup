import { useState, useEffect } from "react";
import {
  type TodoItem,
  loadTodos,
  saveTodos,
  createTodo,
  toggleTodoCompletion,
  deleteTodoById,
} from "../models/Todo";

export function useTodo() {
  const [todos, setTodos] = useState<TodoItem[]>(() => loadTodos());
  const [newTodo, setNewTodo] = useState("");

  // Save to localStorage whenever todos change
  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim() === "") return;

    setTodos([...todos, createTodo(newTodo)]);
    setNewTodo("");
  };

  const toggleTodo = (id: number) => {
    setTodos(toggleTodoCompletion(todos, id));
  };

  const deleteTodo = (id: number) => {
    setTodos(deleteTodoById(todos, id));
  };

  return {
    todos,
    newTodo,
    setNewTodo,
    addTodo,
    toggleTodo,
    deleteTodo,
  };
}
