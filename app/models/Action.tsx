export interface ActionCandidate {
  text: string;
  confidence: number;
}

export interface ActionItem {
  id: number;
  text: string;
  completed: boolean;
  createdAt: number;
}

const STORAGE_KEY = "actions";

export function loadActions(): ActionItem[] {
  if (typeof window === "undefined") return [];
  const savedActions = localStorage.getItem(STORAGE_KEY);
  if (savedActions) {
    const parsedActions = JSON.parse(savedActions);
    // Add createdAt to any existing actions that don't have it
    return parsedActions.map((action: ActionItem) => ({
      ...action,
      createdAt: action.createdAt || action.id, // Use id as fallback since it was Date.now()
    }));
  }
  return [];
}

export function saveActions(actions: ActionItem[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(actions));
  }
}

export function createAction(text: string): ActionItem {
  const now = Date.now();
  return {
    id: now,
    text: text.trim(),
    completed: false,
    createdAt: now,
  };
}

export function toggleActionCompletion(
  actions: ActionItem[],
  id: number
): ActionItem[] {
  return actions.map((action) =>
    action.id === id ? { ...action, completed: !action.completed } : action
  );
}

export function deleteActionById(actions: ActionItem[], id: number): ActionItem[] {
  return actions.filter((action) => action.id !== id);
} 