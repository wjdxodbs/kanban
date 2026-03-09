"use client";

import { useKanbanStore } from "@/shared/store/kanban-store";
import { useDragDrop } from "@/features/move-card";
import { KanbanColumn } from "@/entities/column";

export function KanbanBoard() {
  const columns = useKanbanStore((state) => state.columns);
  const cards = useKanbanStore((state) => state.cards);
  const cardsList = Object.values(cards);
  const {
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleCardHover,
  } = useDragDrop();

  return (
    <div className="grid h-full grid-cols-3 gap-4">
      {columns.map((column) => (
        <KanbanColumn
          key={column.id}
          column={column}
          cards={cardsList}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onCardHover={handleCardHover}
        />
      ))}
    </div>
  );
}
