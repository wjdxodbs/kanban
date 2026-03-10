"use client";

import { useEffect, useRef, useState } from "react";
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
import { useShallow } from "zustand/react/shallow";

export function KanbanBoard() {
  const columnIds = useKanbanStore(
    useShallow((state) => state.columns.map((column) => column.id))
  );
  const hasHydrated = useKanbanStore((state) => state.hasHydrated);
  const totalCardCount = useKanbanStore((state) => Object.keys(state.cards).length);
  const moveCard = useKanbanStore((state) => state.moveCard);
  const checkAndResetDaily = useKanbanStore((state) => state.checkAndResetDaily);

  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [activeCardWidth, setActiveCardWidth] = useState<number | null>(null);
  const lastMoveTargetKeyRef = useRef<string | null>(null);
  const activeCard = useKanbanStore((state) =>
    activeCardId ? state.cards[activeCardId] : null
  );

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const getDropTarget = (
    overId: string,
    activeId: string,
    event?: DragOverEvent | DragEndEvent
  ) => {
    const { columns, cards } = useKanbanStore.getState();
    if (!cards[activeId]) return null;

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
    const { cards } = useKanbanStore.getState();
    if (!cards[id]) return;
    lastMoveTargetKeyRef.current = null;
    setActiveCardWidth(
      event.active.rect.current.initial?.width ??
        event.active.rect.current.translated?.width ??
        null
    );
    setActiveCardId(id);
    document.documentElement.classList.add("is-dragging");
  };

  const handleDragOver = (event: DragOverEvent) => {
    const activeId = String(event.active.id);
    const overId = event.over?.id ? String(event.over.id) : null;
    if (!overId) return;
    const target = getDropTarget(overId, activeId, event);
    if (!target) return;

    const nextTargetKey = `${activeId}:${target.targetColumnId}:${target.targetIndex}`;
    if (lastMoveTargetKeyRef.current === nextTargetKey) return;

    lastMoveTargetKeyRef.current = nextTargetKey;
    moveCard(activeId, target.targetColumnId, target.targetIndex);
  };

  const clearDragState = () => {
    setActiveCardId(null);
    setActiveCardWidth(null);
    lastMoveTargetKeyRef.current = null;
    document.documentElement.classList.remove("is-dragging");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const activeId = String(event.active.id);
    const overId = event.over?.id ? String(event.over.id) : null;
    if (!overId) {
      clearDragState();
      return;
    }
    const target = getDropTarget(overId, activeId, event);
    if (target) moveCard(activeId, target.targetColumnId, target.targetIndex);
    clearDragState();
  };

  const collisionDetectionStrategy: CollisionDetection = (args) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) return pointerCollisions;
    return closestCenter(args);
  };

  useEffect(() => {
    if (!hasHydrated) return;

    checkAndResetDaily();

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkAndResetDaily();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [hasHydrated, checkAndResetDaily]);

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
        {columnIds.map((columnId) => (
          <KanbanColumn
            key={columnId}
            columnId={columnId}
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
            className="shadow-xl rotate-1"
            style={
              activeCardWidth
                ? { width: `${activeCardWidth}px`, maxWidth: `${activeCardWidth}px` }
                : undefined
            }
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
