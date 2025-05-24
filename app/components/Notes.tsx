import { useState, useEffect } from "react";
import {
  type NoteContent,
  loadNote,
  saveNote,
  getAllDates,
} from "../models/Note";
import { useTheme } from "../contexts/ThemeContext";
import { getThemeClasses } from "../utils/theme";

interface NotesProps {
  onContentChange: (content: string, lastModified: number) => void;
}

export function Notes({ onContentChange }: NotesProps) {
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  
  const [selectedDate, setSelectedDate] = useState<string>(
    () => new Date().toISOString().split("T")[0]
  );
  const [availableDates, setAvailableDates] = useState<string[]>(() =>
    getAllDates()
  );
  const [content, setContent] = useState<string>(
    () => loadNote(selectedDate).text
  );
  const [lastModified, setLastModified] = useState<number>(
    () => loadNote(selectedDate).lastModified
  );

  // Load note content when selected date changes
  useEffect(() => {
    const note = loadNote(selectedDate);
    setContent(note.text);
    setLastModified(note.lastModified);
  }, [selectedDate]);

  // Save content to localStorage whenever it changes
  useEffect(() => {
    const noteContent: NoteContent = {
      text: content,
      lastModified: Date.now(),
      date: selectedDate,
    };
    saveNote(noteContent);
    setLastModified(noteContent.lastModified);
    onContentChange(content, noteContent.lastModified);

    // Update available dates when a new note is created
    setAvailableDates(getAllDates());
  }, [content, selectedDate, onContentChange]);

  const isToday = selectedDate === new Date().toISOString().split("T")[0];

  return (
    <div className={`p-4 h-full flex flex-col ${theme.bg.primary}`}>
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h1 className={`text-2xl font-bold ${theme.text.primary}`}>My Notes</h1>
        <select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isDark 
              ? 'bg-gray-800 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          {availableDates.map((date) => (
            <option key={date} value={date}>
              {new Date(date).toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1 overflow-hidden">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={!isToday}
          className={`w-full h-full p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-y-auto ${
            !isToday 
              ? `${isDark ? 'bg-gray-800' : 'bg-gray-100'} cursor-not-allowed ${theme.text.muted}` 
              : `${theme.bg.input} ${theme.border.input} ${theme.text.primary}`
          }`}
          placeholder={
            isToday
              ? "Start writing your note here..."
              : "This note is from a previous day and cannot be edited"
          }
        />
      </div>
      {!isToday && (
        <div className={`mt-2 text-sm ${theme.text.muted}`}>
          This note is from a previous day and cannot be edited
        </div>
      )}
    </div>
  );
}
