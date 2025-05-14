export interface TodoCandidate {
  text: string;
  confidence: number;
}

export interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
  createdAt: number;
}

const STORAGE_KEY = "todos";

export function loadTodos(): TodoItem[] {
  if (typeof window === "undefined") return [];
  const savedTodos = localStorage.getItem(STORAGE_KEY);
  if (savedTodos) {
    const parsedTodos = JSON.parse(savedTodos);
    // Add createdAt to any existing todos that don't have it
    return parsedTodos.map((todo: TodoItem) => ({
      ...todo,
      createdAt: todo.createdAt || todo.id, // Use id as fallback since it was Date.now()
    }));
  }
  return [];
}

export function saveTodos(todos: TodoItem[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }
}

export function createTodo(text: string): TodoItem {
  const now = Date.now();
  return {
    id: now,
    text: text.trim(),
    completed: false,
    createdAt: now,
  };
}

export function toggleTodoCompletion(
  todos: TodoItem[],
  id: number
): TodoItem[] {
  return todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
}

export function deleteTodoById(todos: TodoItem[], id: number): TodoItem[] {
  return todos.filter((todo) => todo.id !== id);
}
