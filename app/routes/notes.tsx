import { useState, useEffect, useCallback, useRef } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { Todo } from '../components/Todo';
import { useTodoExtraction } from '../hooks/useTodoExtraction';
import { useTodo } from '../hooks/useTodo';

type Tab = 'notes' | 'todos';

export default function NotesPage() {
  const [content, setContent] = useState<string | undefined>('# Start writing your note here...');
  const [activeTab, setActiveTab] = useState<Tab>('notes');

  const { todos, newTodo, setNewTodo, addTodo, toggleTodo, deleteTodo } = useTodo();
  const { candidates, isLoading, error } = useTodoExtraction(content || '');

  const handleAddCandidate = (candidateText: string) => {
    setNewTodo(candidateText);
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="md:hidden border-b">
        <div className="flex">
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeTab === 'notes'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500'
            }`}
          >
            Notes
          </button>
          <button
            onClick={() => setActiveTab('todos')}
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeTab === 'todos'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500'
            }`}
          >
            Todo List
          </button>
        </div>
      </div>

      <div className="flex-1 flex md:flex-row overflow-hidden">
        <div
          className={`
            md:border-r md:block overflow-y-auto
            ${activeTab === 'todos' ? 'flex-1' : 'hidden'}
          `}
        >
          <Todo
            todos={todos}
            newTodo={newTodo}
            setNewTodo={setNewTodo}
            addTodo={addTodo}
            toggleTodo={toggleTodo}
            deleteTodo={deleteTodo}
            candidates={candidates}
            isLoading={isLoading}
            error={error}
            onAddCandidate={handleAddCandidate}
          />
        </div>

        <div
          className={`
            md:flex-1 flex flex-col overflow-hidden
            ${activeTab === 'notes' ? 'flex-1' : 'hidden'}
            md:block
          `}
        >
          <div className="p-4 flex-1 flex flex-col">
            <h1 className="text-2xl font-bold mb-4">My Notes</h1>
            <div data-color-mode="light" className="flex-1 overflow-hidden">
              <MDEditor
                value={content}
                onChange={setContent}
                height={200}
                className="h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 