import { useState } from "react";
import { Action } from "../components/Action";
import { Notes } from "../components/Notes";
import { useActionExtraction } from "../hooks/useActionExtraction";
import { useAction } from "../hooks/useAction";

type Tab = "notes" | "todos";

export default function NotesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("notes");
  const [content, setContent] = useState<string>("");
  const [lastModified, setLastModified] = useState<number>(Date.now());

  const { actions, newAction, setNewAction, addAction, toggleAction, deleteAction } =
    useAction();
  const { candidates, isLoading, error } = useActionExtraction(content || "");

  const handleContentChange = (newContent: string, newLastModified: number) => {
    setContent(newContent);
    setLastModified(newLastModified);
  };

  const handleAddCandidate = (candidateText: string) => {
    setNewAction(candidateText);
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="md:hidden border-b">
        <div className="flex">
          <button
            onClick={() => setActiveTab("notes")}
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeTab === "notes"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500"
            }`}
          >
            Notes
          </button>
          <button
            onClick={() => setActiveTab("todos")}
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeTab === "todos"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500"
            }`}
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
            md:border-r md:block overflow-y-auto
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
          />
        </div>
      </div>
    </div>
  );
}
