import { AddCardButton } from "@/features/add-card";
import { KanbanBoard } from "@/widgets/kanban-board";
import { BoardProgressContainer } from "@/widgets/board-progress";

export function KanbanPage() {
  return (
    <main
      id="main-content"
      className="flex h-screen flex-col overflow-hidden bg-background"
    >
      {/* Top header */}
      <header className="flex items-center justify-between border-b px-6 py-3 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold leading-tight">칸반 보드</h1>
        </div>
        <AddCardButton />
      </header>

      {/* Progress strip */}
      <BoardProgressContainer />

      {/* Board */}
      <section
        aria-label="칸반 작업 영역"
        className="min-h-0 flex-1 overflow-hidden p-4"
      >
        <KanbanBoard />
      </section>
    </main>
  );
}
