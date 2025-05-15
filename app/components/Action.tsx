import type { ActionCandidate, ActionItem } from "../models/Action";

// Define props for the Action component
interface ActionProps {
  actions: ActionItem[];
  newAction: string;
  setNewAction: (value: string) => void;
  addAction: (e: React.FormEvent) => void;
  toggleAction: (id: number) => void;
  deleteAction: (id: number) => void;
  candidates: ActionCandidate[];
  isLoading: boolean;
  error: string | null;
  onAddCandidate: (text: string) => void;
}

export function Action({
  actions,
  newAction,
  setNewAction,
  addAction,
  toggleAction,
  deleteAction,
  candidates,
  isLoading,
  error,
  onAddCandidate,
}: ActionProps) {
  return (
    <div className="h-full p-4 flex flex-col">
      <h2 className="text-xl font-bold mb-4 flex-shrink-0">Action List</h2>
      {/* Action Input Form */}
      <form onSubmit={addAction} className="mb-4 flex-shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={newAction}
            onChange={(e) => setNewAction(e.target.value)}
            placeholder="Add a new action..."
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
      {/* Suggested Actions */}
      <div className="mb-4 flex-shrink-0">
        <h3 className="text-lg font-semibold mb-2">
          Suggested Actions
          {isLoading && (
            <span className="text-sm text-gray-500 ml-2">Loading...</span>
          )}
        </h3>
        {error && (
          <p className="text-sm text-red-500 bg-red-100 p-2 rounded mb-2">
            {error}
          </p>
        )}
        {candidates.length > 0 && (
          <div className="space-y-2 overflow-y-auto border rounded p-4">
            {candidates.map((candidate, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 border-1 rounded-md shadow-sm hover:bg-white hover:text-black transition-colors duration-200"
              >
                <span className="flex-1 text-sm">{candidate.text}</span>
                <button
                  onClick={() => onAddCandidate(candidate.text)}
                  className="px-2 cursor-pointer py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 flex-shrink-0"
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
      {/* Action List */}
      <div className="flex-1 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-2">Your Actions</h3>
        <ul className="space-y-2">
          {actions.map((action) => (
            <li
              key={action.id}
              className="flex items-center gap-2 p-2 bg-black border border-white rounded-md shadow-sm"
            >
              <input
                type="checkbox"
                checked={action.completed}
                onChange={() => toggleAction(action.id)}
                className="h-4 w-4 text-blue-500"
              />
              <span
                className={`flex-1 ${
                  action.completed ? "line-through text-gray-400" : ""
                } text-white bg-black`}
              >
                {action.text}
              </span>
              <span className="text-xs text-gray-400 mr-2">
                {new Date(action.createdAt).toLocaleDateString()}
              </span>
              <button
                onClick={() => deleteAction(action.id)}
                className="cursor-pointer text-red-500 hover:text-red-600"
              >
                ×
              </button>
            </li>
          ))}
          {actions.length === 0 && (
            <p className="text-sm text-gray-400 italic">
              Your action list is empty.
            </p>
          )}
        </ul>
      </div>
    </div>
  );
} 