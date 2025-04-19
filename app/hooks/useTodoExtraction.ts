import { useState, useEffect, useCallback, useRef } from 'react';
import { LLMService } from '../services/llmService';
import type { TodoCandidate } from '../services/llmService';
import { useTodo } from './useTodo';

export function useTodoExtraction(initialText: string = '') {
  const [text, setText] = useState(initialText);
  const [candidates, setCandidates] = useState<TodoCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { addTodo } = useTodo();
  const llmService = new LLMService();
  const lastText = useRef(text);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const extractTodos = useCallback(async (text: string) => {
    if (!text.trim()) {
      setCandidates([]);
      return;
    }
    
    // Don't extract if text hasn't changed
    if (text === lastText.current) return;
    
    setIsLoading(true);
    try {
      const newCandidates = await llmService.extractTodos(text);
      setCandidates(newCandidates);
      lastText.current = text;
    } catch (error) {
      console.error('Error extracting todos:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      extractTodos(text);
    }, 500);

    // Cleanup timeout on unmount or text change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, extractTodos]);

  const addCandidate = (candidate: TodoCandidate) => {
    addTodo({ preventDefault: () => {} } as React.FormEvent);
    setCandidates(prev => prev.filter(c => c.text !== candidate.text));
  };

  return {
    text,
    setText,
    candidates,
    addCandidate,
    isLoading,
    extractTodos
  };
} 