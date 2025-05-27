import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth0 } from "@auth0/auth0-react";
import { Action } from "../components/Action";
import { Notes } from "../components/Notes";
import { useActionExtraction } from "../hooks/useActionExtraction";
import { useAction } from "../hooks/useAction";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";
import { getThemeClasses, getTabClasses } from "../utils/theme";

type Tab = "notes" | "todos";

function LandingPage() {
  const { loginWithRedirect } = useAuth0();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-20 pb-16 text-center lg:pt-32">
          <h1 className="mx-auto max-w-4xl font-display text-5xl font-medium tracking-tight text-slate-900 sm:text-7xl">
            Your notes,{" "}
            <span className="relative whitespace-nowrap text-blue-600">
              <span className="relative">organized</span>
            </span>{" "}
            automatically
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg tracking-tight text-slate-700">
            LogMeUp helps you capture thoughts and automatically identifies action items from your daily logs. 
            Stay organized and never miss a task again.
          </p>
          <div className="mt-10 flex justify-center gap-x-6">
            <button
              onClick={() => loginWithRedirect()}
              className="group inline-flex items-center justify-center rounded-full py-2 px-4 text-sm font-semibold focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-800 focus-visible:outline-blue-600"
            >
              Get started for free
            </button>
            <button
              onClick={() => loginWithRedirect()}
              className="group inline-flex ring-1 items-center justify-center rounded-full py-2 px-4 text-sm focus:outline-none ring-slate-200 text-slate-700 hover:text-slate-900 hover:ring-slate-300 active:bg-slate-100 active:text-slate-600 focus-visible:outline-blue-600 focus-visible:ring-slate-300"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  const { isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return (
    <ThemeProvider>
      <NotesPageContent />
    </ThemeProvider>
  );
}
