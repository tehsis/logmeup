import type { TodoCandidate } from '../services/llmService';
import type { TodoItem } from '../hooks/useTodo'; // Import TodoItem type

// Define props for the Todo component
interface TodoProps {
  todos: TodoItem[];
  newTodo: string;
  setNewTodo: (value: string) => void;
  addTodo: (e: React.FormEvent) => void;
  toggleTodo: (id: number) => void;
  deleteTodo: (id: number) => void;
  candidates: TodoCandidate[];
  isLoading: boolean;
  onAddCandidate: (text: string) => void; // Function to handle adding a candidate
}

export function Todo({
  todos,
  newTodo,
  setNewTodo,
  addTodo,
  toggleTodo,
  deleteTodo,
  candidates,
  isLoading,
  onAddCandidate // Destructure the new prop
}: TodoProps) {

  // Removed internal hook calls (useTodo, useTodoExtraction)
  // Removed handleAddCandidate as it's now passed via props

  return (
    <div className="h-full p-4 flex flex-col"> {/* Use flex-col */}
      <h2 className="text-xl font-bold mb-4 flex-shrink-0">Todo List</h2>

      {/* Todo Input Form */}
      <form onSubmit={addTodo} className="mb-4 flex-shrink-0">
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
      <div className="mb-4 flex-shrink-0"> {/* Added flex-shrink-0 */}
         <h3 className="text-lg font-semibold mb-2">
           Suggested Todos {isLoading && <span className="text-sm text-gray-500 ml-2">Loading...</span>}
         </h3>
        {candidates.length > 0 && (
          <div className="space-y-2 max-h-48 overflow-y-auto border rounded p-2 bg-gray-50"> {/* Scrollable container */}
            {candidates.map((candidate, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 bg-white rounded-md shadow-sm"
              >
                <span className="flex-1 text-sm text-gray-800">{candidate.text}</span>
                <button
                  onClick={() => onAddCandidate(candidate.text)} // Use the passed handler
                  className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 flex-shrink-0"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        )}
        {!isLoading && candidates.length === 0 && (
             <p className="text-sm text-gray-400 italic">No suggestions found.</p>
        )}
      </div>


      {/* Todo List - Make this scrollable */}
      <div className="flex-1 overflow-y-auto"> {/* Added flex-1 and overflow-y-auto */}
         <h3 className="text-lg font-semibold mb-2">Your Todos</h3>
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
           {todos.length === 0 && (
             <p className="text-sm text-gray-400 italic">Your todo list is empty.</p>
           )}
        </ul>
      </div>
    </div>
  );
} 