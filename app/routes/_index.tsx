import { useState } from "react";
import { Action } from "../components/Action";
import { Notes } from "../components/Notes";
import { useActionExtraction } from "../hooks/useActionExtraction";
import { useAction } from "../hooks/useAction";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";
import { getThemeClasses, getTabClasses } from "../utils/theme";

type Tab = "notes" | "todos";

function NotesPageContent() {
  const [activeTab, setActiveTab] = useState<Tab>("notes");
  const [content, setContent] = useState<string>("");
  const [lastModified, setLastModified] = useState<number>(Date.now());
  
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);

  const { 
    actions, 
    newAction, 
    setNewAction, 
    addAction, 
    toggleAction, 
    deleteAction,
    syncStatus,
    manualSync
  } = useAction();
  const { candidates, isLoading, error } = useActionExtraction(content || "");

  const handleContentChange = (newContent: string, newLastModified: number) => {
    setContent(newContent);
    setLastModified(newLastModified);
  };

  const handleAddCandidate = (candidateText: string) => {
    setNewAction(candidateText);
  };

  return (
    <div className={`h-screen flex flex-col ${theme.bg.primary}`}>
      <div className={`md:hidden border-b ${theme.border.primary} ${theme.bg.primary}`}>
        <div className="flex">
          <button
            onClick={() => setActiveTab("notes")}
            className={getTabClasses(isDark, activeTab === "notes")}
          >
            Notes
          </button>
          <button
            onClick={() => setActiveTab("todos")}
            className={getTabClasses(isDark, activeTab === "todos")}
          >
            Todo List
          </button>
        </div>
      </div>

      <div className="flex-1 flex md:flex-row overflow-hidden">
        <div
          className={`
            md:flex-1 flex flex-col overflow-hidden
            ${activeTab === "notes" ? "flex-1" : "hidden"}
            md:block
          `}
        >
          <Notes onContentChange={handleContentChange} />
        </div>

        <div
          className={`
            md:border-r ${theme.border.primary} md:block overflow-y-auto
            ${activeTab === "todos" ? "flex-1" : "hidden"}
          `}
        >
          <Action
            actions={actions}
            newAction={newAction}
            setNewAction={setNewAction}
            addAction={addAction}
            toggleAction={toggleAction}
            deleteAction={deleteAction}
            candidates={candidates}
            isLoading={isLoading}
            error={error}
            onAddCandidate={handleAddCandidate}
            syncStatus={syncStatus}
          />
        </div>
      </div>
    </div>
  );
}

export default function NotesPage() {
  return (
    <ThemeProvider>
      <NotesPageContent />
    </ThemeProvider>
  );
}
