import { useTodo } from '../hooks/useTodo';
import { useTodoExtraction } from '../hooks/useTodoExtraction';
import type { TodoCandidate } from '../services/llmService';

export function Todo() {
  const {
    todos,
    newTodo,
    setNewTodo,
    addTodo,
    toggleTodo,
    deleteTodo
  } = useTodo();

  const {
    text,
    setText,
    candidates,
    isLoading
  } = useTodoExtraction();

  const handleAddCandidate = (candidate: TodoCandidate) => {
    addTodo({
      preventDefault: () => {},
    } as React.FormEvent);
    setNewTodo(candidate.text);
  };

  return (
    <div className="h-full p-4">
      <h2 className="text-xl font-bold mb-4">Todo List</h2>
      
      {/* Log Text Input */}
      <div className="mb-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your log text here..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
        />
      </div>

      {/* Todo Input Form */}
      <form onSubmit={addTodo} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add
          </button>
        </div>
      </form>

      {/* Suggested Todos */}
      {candidates.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Suggested Todos</h3>
          <div className="space-y-2">
            {candidates.map((candidate, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 bg-gray-50 rounded-md"
              >
                <span className="flex-1 text-gray-800">{candidate.text}</span>
                <button
                  onClick={() => handleAddCandidate(candidate)}
                  className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Todo List */}
      <ul className="space-y-2">
        {todos.map(todo => (
          <li
            key={todo.id}
            className="flex items-center gap-2 p-2 bg-white rounded-md shadow-sm"
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              className="h-4 w-4 text-blue-500"
            />
            <span className={`flex-1 ${todo.completed ? 'line-through text-gray-400' : ''} text-blue-500`}>
              {todo.text}
            </span>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="text-red-500 hover:text-red-600"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
} 