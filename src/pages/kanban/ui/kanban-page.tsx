"use client";

import { AddCardButton } from "@/features/add-card";
import { KanbanBoard } from "@/widgets/kanban-board";

export function KanbanPage() {
  return (
    <main className="min-h-screen px-4 py-6">
      <section className="mx-auto flex h-[calc(100vh-3rem)] w-full max-w-6xl flex-col">
        <h1 className="text-2xl font-bold text-foreground">칸반 보드</h1>
        <AddCardButton className="mt-3 mb-4 self-start" />
        <div className="min-h-0 flex-1">
          <KanbanBoard />
        </div>
      </section>
    </main>
  );
}
