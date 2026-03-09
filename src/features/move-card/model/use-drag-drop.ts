"use client";

import { useCallback } from "react";
import { useKanbanStore } from "@/shared/store/kanban-store";

interface DragData {
  cardId: string;
  columnId: string;
}

export function useDragDrop() {
  const moveCard = useKanbanStore((state) => state.moveCard);

  const getDragData = useCallback((e: React.DragEvent): DragData | null => {
    const data = e.dataTransfer.getData("application/json");
    if (!data) return null;
    try {
      return JSON.parse(data) as DragData;
    } catch {
      return null;
    }
  }, []);

  const handleDragStart = useCallback(
    (e: React.DragEvent, cardId: string, columnId: string) => {
      e.dataTransfer.setData(
        "application/json",
        JSON.stringify({ cardId, columnId } satisfies DragData)
      );
      e.dataTransfer.effectAllowed = "move";
      (e.target as HTMLElement).classList.add("opacity-50");
    },
    []
  );

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    (e.target as HTMLElement).classList.remove("opacity-50");
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    (e.currentTarget as HTMLElement).classList.add("ring-2", "ring-primary/50");
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).classList.remove(
      "ring-2",
      "ring-primary/50"
    );
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetColumnId: string, targetIndex?: number) => {
      e.preventDefault();
      (e.currentTarget as HTMLElement).classList.remove(
        "ring-2",
        "ring-primary/50"
      );

      const dragData = getDragData(e);
      if (!dragData) return;
      moveCard(dragData.cardId, targetColumnId, targetIndex);
    },
    [getDragData, moveCard]
  );

  const handleCardHover = useCallback(
    (e: React.DragEvent, targetColumnId: string, targetIndex: number) => {
      e.preventDefault();
      e.stopPropagation();

      const dragData = getDragData(e);
      if (!dragData) return;

      const state = useKanbanStore.getState();
      const draggingCard = state.cards[dragData.cardId];
      if (!draggingCard) return;

      if (draggingCard.columnId === targetColumnId) {
        const column = state.columns.find((c) => c.id === targetColumnId);
        if (!column) return;
        const fromIndex = column.cardIds.indexOf(dragData.cardId);
        if (fromIndex === -1) return;
        let normalizedTargetIndex = targetIndex;
        if (fromIndex < normalizedTargetIndex) {
          normalizedTargetIndex -= 1;
        }
        if (fromIndex === normalizedTargetIndex) return;
      }

      moveCard(dragData.cardId, targetColumnId, targetIndex);
    },
    [getDragData, moveCard]
  );

  return {
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleCardHover,
  };
}
