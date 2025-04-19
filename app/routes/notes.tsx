import { useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { Todo } from '../components/Todo';

export default function NotesPage() {
  const [content, setContent] = useState<string | undefined>('# Start writing your note here...');

  return (
    <div className="flex h-screen">
      {/* Markdown Editor - Right Side */}
      <div className="flex-1 p-4" data-color-mode="dark">
        <div>
        </div>
      </div>
      <div className=" border-l">
        <Todo />
      </div>
    </div>
  );
} 