export interface NoteContent {
  text: string;
  lastModified: number;
  date: string; // YYYY-MM-DD format
}

interface NotesStorage {
  [date: string]: NoteContent;
}

const STORAGE_KEY = "notes-content";

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

export function loadNote(date?: string): NoteContent {
  if (typeof window === "undefined") {
    return {
      text: "",
      lastModified: Date.now(),
      date: getToday(),
    };
  }

  const savedNotes = localStorage.getItem(STORAGE_KEY);
  const targetDate = date || getToday();

  if (savedNotes) {
    try {
      const notes: NotesStorage = JSON.parse(savedNotes);
      if (notes[targetDate]) {
        return notes[targetDate];
      }
    } catch {
      // Fall through to default return
    }
  }

  return {
    text: "",
    lastModified: Date.now(),
    date: targetDate,
  };
}

export function saveNote(note: NoteContent): void {
  if (typeof window === "undefined") return;

  const savedNotes = localStorage.getItem(STORAGE_KEY);
  let notes: NotesStorage = {};

  if (savedNotes) {
    try {
      notes = JSON.parse(savedNotes);
    } catch {
      // Use empty notes object if parse fails
    }
  }

  // Only allow saving if it's today's note
  if (note.date === getToday()) {
    notes[note.date] = note;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }
}

export function getAllDates(): string[] {
  if (typeof window === "undefined") return [getToday()];

  const savedNotes = localStorage.getItem(STORAGE_KEY);
  if (!savedNotes) return [getToday()];

  try {
    const notes: NotesStorage = JSON.parse(savedNotes);
    return Object.keys(notes).sort().reverse();
  } catch {
    return [getToday()];
  }
}
