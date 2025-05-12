import { useState, useEffect } from "react";
import { type NoteContent, loadNote, saveNote } from "../models/Note";

interface NotesProps {
  onContentChange: (content: string, lastModified: number) => void;
}

export function Notes({ onContentChange }: NotesProps) {
  const [content, setContent] = useState<string>(() => loadNote().text);
  const [lastModified, setLastModified] = useState<number>(
    () => loadNote().lastModified
  );

  // Save content to localStorage whenever it changes
  useEffect(() => {
    const noteContent: NoteContent = {
      text: content,
      lastModified: Date.now(),
    };
    saveNote(noteContent);
    setLastModified(noteContent.lastModified);
    onContentChange(content, noteContent.lastModified);
  }, [content, onContentChange]);

  return (
    <div className="p-4 flex-1 flex flex-col">
      <h1 className="text-2xl font-bold mb-4">My Notes</h1>
      <div className="flex-1 overflow-hidden">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-full p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Start writing your note here..."
        />
      </div>
    </div>
  );
}
