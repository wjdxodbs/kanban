"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Layers } from "lucide-react";
import { useKanbanStore } from "@/shared/store/kanban-store";
import { KanbanCardItem } from "@/entities/card/ui/card";
import { EditCardDialog } from "@/features/edit-card";
import { cn } from "@/shared/lib/utils";
import { useShallow } from "zustand/react/shallow";

interface KanbanColumnProps {
  columnId: string;
  hasHydrated: boolean;
  activeCardId: string | null;
  totalCardCount: number;
  className?: string;
}

export function KanbanColumn({
  columnId,
  hasHydrated,
  activeCardId,
  totalCardCount,
  className,
}: KanbanColumnProps) {
  const columnView = useKanbanStore(
    useShallow((state) => {
      const item = state.columns.find((entry) => entry.id === columnId);
      if (!item) return null;
      const orderedCardIds = item.cardIds;
      return {
        title: item.title,
        color: item.color,
        orderedCardIds,
        count: orderedCardIds.length,
      };
    })
  );
  const { setNodeRef, isOver } = useDroppable({ id: `column-${columnId}` });

  if (!columnView) return null;

  const { title, color, orderedCardIds, count } = columnView;

  // Mini progress bar — fraction of total cards in this column
  const miniPct = totalCardCount > 0 ? Math.round((count / totalCardCount) * 100) : 0;
  const indicatorColor = color ?? "var(--muted-foreground)";

  return (
    <section
      aria-label={`${title} 컬럼, ${hasHydrated ? count : 0}개 카드`}
      aria-live="polite"
      className={cn(
        "flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-muted/20 transition-shadow",
        className
      )}
    >
      {/* Column header */}
      <div className="shrink-0 px-3 pt-3 pb-2 bg-muted/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* Color indicator */}
            <div
              className="w-0.5 h-4 rounded-full shrink-0"
              style={{ background: indicatorColor }}
              aria-hidden="true"
            />
            <h3 className="text-sm font-semibold truncate">{title}</h3>
            <span
              className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground"
              aria-label={`${hasHydrated ? count : 0}개 카드`}
            >
              {hasHydrated ? count : "—"}
            </span>
          </div>
        </div>

        {/* Mini progress bar */}
        <div
          className="h-0.5 rounded-full bg-border overflow-hidden"
          aria-hidden="true"
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${miniPct}%`, background: indicatorColor }}
          />
        </div>
      </div>

      {/* Cards area */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3 pr-2 transition-colors",
          isOver && "bg-primary/5"
        )}
      >
        {!hasHydrated && (
          <>
            <div className="h-16 animate-pulse rounded-lg bg-muted/60" />
            <div className="h-16 animate-pulse rounded-lg bg-muted/50" />
            <div className="h-16 animate-pulse rounded-lg bg-muted/40" />
          </>
        )}

        {hasHydrated && orderedCardIds.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border p-6 text-center text-muted-foreground">
            <Layers className="size-7 opacity-30" aria-hidden="true" />
            <p className="text-xs leading-relaxed">
              카드가 없습니다
              <br />
              드래그하거나 카드를 추가해 보세요
            </p>
          </div>
        )}

        {hasHydrated && (
          <SortableContext
            items={orderedCardIds}
            strategy={verticalListSortingStrategy}
          >
            {orderedCardIds.map((cardId) => (
              <SortableCard
                key={cardId}
                cardId={cardId}
                isActive={cardId === activeCardId}
              />
            ))}
          </SortableContext>
        )}
      </div>
    </section>
  );
}

function SortableCard({
  cardId,
  isActive,
}: {
  cardId: string;
  isActive: boolean;
}) {
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
