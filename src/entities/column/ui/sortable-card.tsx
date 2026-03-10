"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useKanbanStore } from "@/shared/store/kanban-store";
import { KanbanCardItem } from "@/entities/card/ui/card";
import { EditCardDialog } from "@/features/edit-card";
import { cn } from "@/shared/lib/utils";

interface SortableCardProps {
  cardId: string;
  isActive: boolean;
}

export function SortableCard({ cardId, isActive }: SortableCardProps) {
  const deleteCard = useKanbanStore((state) => state.deleteCard);
  const card = useKanbanStore((state) => state.cards[cardId]);
  const [editOpen, setEditOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: cardId,
    transition: { duration: 180, easing: "ease" },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (!card) return null;

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="relative will-change-transform touch-pan-y cursor-grab active:cursor-grabbing"
        {...listeners}
        {...attributes}
      >
        <KanbanCardItem
          card={card}
          className={cn((isDragging || isActive) && "opacity-0")}
          onEdit={() => setEditOpen(true)}
          onDelete={() => deleteCard(cardId)}
        />
      </div>
      <EditCardDialog card={card} open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}
