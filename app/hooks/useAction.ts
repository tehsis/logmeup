import { useState, useEffect } from "react";
import {
  type ActionItem,
  loadActions,
  saveActions,
  createAction,
  toggleActionCompletion,
  deleteActionById,
} from "../models/Action";

export function useAction() {
  const [actions, setActions] = useState<ActionItem[]>(() => loadActions());
  const [newAction, setNewAction] = useState("");

  // Save to localStorage whenever actions change
  useEffect(() => {
    saveActions(actions);
  }, [actions]);

  const addAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAction.trim() === "") return;

    setActions([...actions, createAction(newAction)]);
    setNewAction("");
  };

  const toggleAction = (id: number) => {
    setActions(toggleActionCompletion(actions, id));
  };

  const deleteAction = (id: number) => {
    setActions(deleteActionById(actions, id));
  };

  return {
    actions,
    newAction,
    setNewAction,
    addAction,
    toggleAction,
    deleteAction,
  };
} 