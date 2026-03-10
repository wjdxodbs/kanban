"use client";

import { useKanbanStore } from "@/shared/store/kanban-store";

export function BoardProgressStrip() {
  const columns = useKanbanStore((state) => state.columns);
  const cards = useKanbanStore((state) => state.cards);
  const hasHydrated = useKanbanStore((state) => state.hasHydrated);

  const total = Object.keys(cards).length;
  const doneColumn = columns.find((c) => c.id === "col-3");
  const doneCount = doneColumn?.cardIds.length ?? 0;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const doneColor = doneColumn?.color ?? "oklch(0.648 0.17 155)";

  return (
    <div
      aria-label="보드 진행 현황"
      className="flex items-center gap-4 border-b px-6 py-4 text-xs text-muted-foreground shrink-0"
    >
      {columns.map((col) => (
        <div key={col.id} className="flex items-center gap-1.5">
          <div
            className="size-2 rounded-full shrink-0"
            style={{ background: col.color ?? "var(--muted-foreground)" }}
          />
          <span>{col.title}</span>
          <span className="font-semibold tabular-nums text-foreground">
            {hasHydrated ? col.cardIds.length : "—"}
          </span>
        </div>
      ))}

      <div className="flex flex-1 items-center gap-2 ml-2">
        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: doneColor }}
          />
        </div>
        <span className="tabular-nums shrink-0">
          {hasHydrated ? `${pct}% 완료` : "—"}
        </span>
      </div>
    </div>
  );
}
