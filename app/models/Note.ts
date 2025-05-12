export interface NoteContent {
  text: string;
  lastModified: number;
}

const STORAGE_KEY = "notes-content";

export function loadNote(): NoteContent {
  if (typeof window === "undefined") {
    return {
      text: "# Start writing your note here...",
      lastModified: Date.now(),
    };
  }

  const savedNote = localStorage.getItem(STORAGE_KEY);
  if (savedNote) {
    try {
      return JSON.parse(savedNote);
    } catch {
      return {
        text: "# Start writing your note here...",
        lastModified: Date.now(),
      };
    }
  }

  return {
    text: "# Start writing your note here...",
    lastModified: Date.now(),
  };
}

export function saveNote(note: NoteContent): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(note));
  }
}
