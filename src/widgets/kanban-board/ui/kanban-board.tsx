"use client";

import { useMemo, useState } from "react";
import {
  type CollisionDetection,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  pointerWithin,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useKanbanStore } from "@/shared/store/kanban-store";
import { KanbanCardItem } from "@/entities/card/ui/card";
import { KanbanColumn } from "@/entities/column";

export function KanbanBoard() {
  const columns = useKanbanStore((state) => state.columns);
  const cards = useKanbanStore((state) => state.cards);
  const hasHydrated = useKanbanStore((state) => state.hasHydrated);
  const moveCard = useKanbanStore((state) => state.moveCard);

  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const cardsList = useMemo(() => Object.values(cards), [cards]);
  const totalCardCount = cardsList.length;

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const getDropTarget = (overId: string, event?: DragOverEvent | DragEndEvent) => {
    if (overId.startsWith("column-")) {
      const targetColumnId = overId.replace("column-", "");
      const targetColumn = columns.find((col) => col.id === targetColumnId);
      if (!targetColumn) return null;
      return { targetColumnId, targetIndex: targetColumn.cardIds.length };
    }

    const overCard = cards[overId];
    if (!overCard) return null;
    const overColumn = columns.find((col) => col.id === overCard.columnId);
    if (!overColumn) return null;
    const baseIndex = overColumn.cardIds.indexOf(overCard.id);
    if (baseIndex === -1) return null;

    let targetIndex = baseIndex;
    const activeRect = event?.active.rect.current.translated;
    const overRect = event?.over?.rect;
    if (overRect) {
      const y = activeRect ? activeRect.top + activeRect.height / 2 : null;
      const overCenterY = overRect.top + overRect.height / 2;
      if (y !== null && y > overCenterY) targetIndex = baseIndex + 1;
    }

    return { targetColumnId: overCard.columnId, targetIndex };
  };

  const handleDragStart = (event: DragStartEvent) => {
    const id = String(event.active.id);
    if (!cards[id]) return;
    setActiveCardId(id);
    document.documentElement.classList.add("is-dragging");
  };

  const handleDragOver = (event: DragOverEvent) => {
    const activeId = String(event.active.id);
    const overId = event.over?.id ? String(event.over.id) : null;
    if (!overId || !cards[activeId]) return;
    const target = getDropTarget(overId, event);
    if (target) moveCard(activeId, target.targetColumnId, target.targetIndex);
  };

  const clearDragState = () => {
    setActiveCardId(null);
    document.documentElement.classList.remove("is-dragging");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const activeId = String(event.active.id);
    const overId = event.over?.id ? String(event.over.id) : null;
    if (!overId || !cards[activeId]) {
      clearDragState();
      return;
    }
    const target = getDropTarget(overId, event);
    if (target) moveCard(activeId, target.targetColumnId, target.targetIndex);
    clearDragState();
  };

  const activeCard = activeCardId ? cards[activeCardId] : null;

  const collisionDetectionStrategy: CollisionDetection = (args) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) return pointerCollisions;
    return closestCenter(args);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={clearDragState}
    >
      <div className="grid h-full grid-cols-3 gap-4">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            cards={cardsList}
            hasHydrated={hasHydrated}
            activeCardId={activeCardId}
            totalCardCount={totalCardCount}
          />
        ))}
      </div>

      <DragOverlay>
        {activeCard ? (
          <KanbanCardItem
            card={activeCard}
            isDragOverlay
            className="w-[calc((100vw-8rem)/3)] max-w-[360px] shadow-xl rotate-1"
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
