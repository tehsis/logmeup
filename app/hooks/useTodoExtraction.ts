import { useState, useEffect, useCallback, useRef } from 'react';
import { LLMService } from '../services/llmService';
import type { TodoCandidate } from '../services/llmService';

export function useTodoExtraction(currentContent: string) {
  const [candidates, setCandidates] = useState<TodoCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const llmService = useRef(new LLMService());
  const lastProcessedContent = useRef<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const extractTodos = useCallback(async (contentToExtract: string) => {
    if (!contentToExtract.trim()) {
      setCandidates([]);
      lastProcessedContent.current = contentToExtract;
      return;
    }

    if (contentToExtract === lastProcessedContent.current || isLoading) {
      return;
    }

    setIsLoading(true);
    lastProcessedContent.current = contentToExtract;

    try {
      console.log("Extracting todos for:", contentToExtract.substring(0, 50) + "...");
      const newCandidates = await llmService.current.extractTodos(contentToExtract);
      if (contentToExtract === lastProcessedContent.current) {
        setCandidates(newCandidates);
      }
    } catch (error) {
      console.error('Error extracting todos:', error);
      if (contentToExtract === lastProcessedContent.current) {
        lastProcessedContent.current = null;
      }
    } finally {
      if (contentToExtract === lastProcessedContent.current) {
        setIsLoading(false);
      }
    }
  }, [isLoading]);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      extractTodos(currentContent);
    }, 500);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentContent, extractTodos]);

  return {
    candidates,
    isLoading,
  };
} 