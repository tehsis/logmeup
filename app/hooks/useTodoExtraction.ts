import { useState, useEffect, useCallback, useRef } from "react";
import type { TodoCandidate } from "../models/Todo";

export function useTodoExtraction(
  currentContent: string,
  lastModified: number
) {
  const [candidates, setCandidates] = useState<TodoCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastProcessedContent = useRef<string | null>(null);
  const lastProcessedTimestamp = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const fetchCandidates = useCallback(
    async (contentToExtract: string) => {
      if (!contentToExtract.trim()) {
        setCandidates([]);
        lastProcessedContent.current = contentToExtract;
        lastProcessedTimestamp.current = lastModified;
        setError(null);
        return;
      }

      if (
        (contentToExtract === lastProcessedContent.current &&
          lastModified === lastProcessedTimestamp.current) ||
        isLoading
      ) {
        return;
      }

      setIsLoading(true);
      setError(null);
      lastProcessedContent.current = contentToExtract;
      lastProcessedTimestamp.current = lastModified;

      if (controllerRef.current) {
        controllerRef.current.abort();
      }
      controllerRef.current = new AbortController();
      const signal = controllerRef.current.signal;

      try {
        console.log(
          "Fetching candidates for:",
          contentToExtract.substring(0, 50) + "..."
        );
        const response = await fetch("/api/extract-todos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: contentToExtract }),
          signal,
        });

        if (signal.aborted) {
          console.log("Fetch aborted");
          return;
        }

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ error: "Failed to parse error response" }));
          throw new Error(
            errorData?.error ||
              `API request failed with status ${response.status}`
          );
        }

        const data = await response.json();

        if (contentToExtract === lastProcessedContent.current) {
          setCandidates(data.candidates || []);
        }
      } catch (err: any) {
        if (err.name === "AbortError") {
          console.log("Fetch request was aborted.");
        } else {
          console.error("Error fetching candidates:", err);
          if (contentToExtract === lastProcessedContent.current) {
            setError(err.message || "Failed to fetch suggestions.");
            setCandidates([]);
          }
        }
      } finally {
        if (contentToExtract === lastProcessedContent.current) {
          setIsLoading(false);
        }
        if (controllerRef.current?.signal === signal) {
          controllerRef.current = null;
        }
      }
    },
    [lastModified]
  );

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      fetchCandidates(currentContent);
    }, 500);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      controllerRef.current?.abort();
    };
  }, [currentContent, lastModified, fetchCandidates]);

  return {
    candidates,
    isLoading,
    error,
  };
}
