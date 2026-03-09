"use client";

import type { Card as KanbanCard } from "@/shared/store/kanban-store";
import {
  Card as ShadcnCard,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/shared/ui/card";
import { cn } from "@/shared/lib/utils";

interface KanbanCardProps {
  card: KanbanCard;
  onDragStart: (e: React.DragEvent, cardId: string, columnId: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
  className?: string;
}

export function KanbanCardItem({
  card,
  onDragStart,
  onDragEnd,
  className,
}: KanbanCardProps) {
  return (
    <ShadcnCard
      size="sm"
      draggable
      onDragStart={(e) => onDragStart(e, card.id, card.columnId)}
      onDragEnd={onDragEnd}
      className={cn(
        "cursor-grab active:cursor-grabbing transition-opacity",
        className
      )}
    >
      <CardHeader>
        <CardTitle>{card.title}</CardTitle>
        <CardDescription>
          {card.description?.trim() ? card.description : "내용 없음"}
        </CardDescription>
      </CardHeader>
    </ShadcnCard>
  );
}
