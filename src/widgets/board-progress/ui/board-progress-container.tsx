"use client";

import { useKanbanStore } from "@/shared/store/kanban-store";

export function BoardProgressContainer() {
  const hasHydrated = useKanbanStore((state) => state.hasHydrated);
  const columns = useKanbanStore((state) => state.columns);
  const total = useKanbanStore((state) => Object.keys(state.cards).length);
  const doneCount = useKanbanStore(
    (state) => state.columns.find((column) => column.id === "col-3")?.cardIds.length ?? 0
  );
  const doneColor = useKanbanStore(
    (state) => state.columns.find((column) => column.id === "col-3")?.color ?? "oklch(0.648 0.17 155)"
  );
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  return (
    <section
      aria-label="보드 진행 현황"
      aria-live="polite"
      className="flex shrink-0 items-center gap-4 border-b px-6 py-4 text-xs text-muted-foreground"
    >
      {columns.map((column) => (
        <div key={column.id} className="flex items-center gap-1.5">
          <div
            className="size-2 shrink-0 rounded-full"
            style={{ background: column.color ?? "var(--muted-foreground)" }}
          />
          <span>{column.title}</span>
          <span className="font-semibold tabular-nums text-foreground">
            {hasHydrated ? column.cardIds.length : "—"}
          </span>
        </div>
      ))}

      <div className="ml-2 flex flex-1 items-center gap-2">
        <div
          role="progressbar"
          aria-label="완료 진행률"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={hasHydrated ? pct : 0}
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: doneColor }}
          />
        </div>
        <span className="shrink-0 tabular-nums">
          {hasHydrated ? `${pct}% 완료` : "—"}
        </span>
      </div>
    </section>
  );
}
