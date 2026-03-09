"use client";

import { useLayoutEffect, useRef } from "react";
import type { Column as KanbanColumn } from "@/shared/store/kanban-store";
import type { Card as KanbanCard } from "@/shared/store/kanban-store";
import { KanbanCardItem } from "@/entities/card/ui/card";
import { cn } from "@/shared/lib/utils";

interface KanbanColumnProps {
  column: KanbanColumn;
  cards: KanbanCard[];
  onDragStart: (e: React.DragEvent, cardId: string, columnId: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, columnId: string, index?: number) => void;
  onCardHover: (e: React.DragEvent, columnId: string, index: number) => void;
  hasHydrated: boolean;
  className?: string;
}

function getHeaderColorClass(title: string) {
  const normalized = title.toLowerCase();
  if (normalized.includes("to do") || normalized.includes("할 일")) {
    return "bg-blue-500/15 text-blue-200";
  }
  if (normalized.includes("progress") || normalized.includes("진행")) {
    return "bg-amber-500/15 text-amber-200";
  }
  if (normalized.includes("done") || normalized.includes("완료")) {
    return "bg-emerald-500/15 text-emerald-200";
  }
  return "bg-muted text-foreground";
}

export function KanbanColumn({
  column,
  cards,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onCardHover,
  hasHydrated,
  className,
}: KanbanColumnProps) {
  const count = column.cardIds.length;
  const cardElementsRef = useRef<Record<string, HTMLDivElement | null>>({});
  const previousTopRef = useRef<Record<string, number>>({});

  useLayoutEffect(() => {
    const nextTopMap: Record<string, number> = {};

    for (const cardId of column.cardIds) {
      const element = cardElementsRef.current[cardId];
      if (!element) continue;

      const currentTop = element.getBoundingClientRect().top;
      nextTopMap[cardId] = currentTop;

      const previousTop = previousTopRef.current[cardId];
      if (previousTop === undefined) continue;

      const deltaY = previousTop - currentTop;
      if (deltaY === 0) continue;

      element.style.transition = "none";
      element.style.transform = `translateY(${deltaY}px)`;

      requestAnimationFrame(() => {
        element.style.transition = "transform 180ms ease";
        element.style.transform = "translateY(0)";
      });
    }

    previousTopRef.current = nextTopMap;
  }, [column.cardIds]);

  return (
    <div
      className={cn(
        "flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-muted/30 transition-shadow",
        className,
      )}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(e);
      }}
      onDragLeave={onDragLeave}
      onDrop={(e) => {
        e.preventDefault();
        onDrop(e, column.id, column.cardIds.length);
      }}
    >
      <div
        className={cn(
          "flex items-center justify-between px-4 py-6",
          getHeaderColorClass(column.title),
        )}
      >
        <h3 className="text-sm font-semibold">{column.title}</h3>
        <span className="rounded-full bg-background/70 px-2 py-0.5 text-xs font-medium">
          {hasHydrated ? count : "-"}
        </span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3 pr-2">
        {!hasHydrated && (
          <>
            <div className="h-20 animate-pulse rounded-md bg-muted/60" />
            <div className="h-20 animate-pulse rounded-md bg-muted/50" />
            <div className="h-20 animate-pulse rounded-md bg-muted/40" />
          </>
        )}
        {hasHydrated && column.cardIds.length === 0 && (
          <p className="p-3 text-sm text-muted-foreground">
            내용 없음
          </p>
        )}
        {hasHydrated &&
          column.cardIds.map((cardId, index) => {
          const card = cards.find((c) => c.id === cardId);
          if (!card) return null;
          return (
            <div
              key={card.id}
              ref={(element) => {
                cardElementsRef.current[card.id] = element;
              }}
              className="will-change-transform"
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                const isLowerHalf = e.clientY > rect.top + rect.height / 2;
                const targetIndex = isLowerHalf ? index + 1 : index;
                onCardHover(e, column.id, targetIndex);
              }}
              onDragLeave={onDragLeave}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                const isLowerHalf = e.clientY > rect.top + rect.height / 2;
                const targetIndex = isLowerHalf ? index + 1 : index;
                onDrop(e, column.id, targetIndex);
              }}
            >
              <KanbanCardItem
                card={card}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
