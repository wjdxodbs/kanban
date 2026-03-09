import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";

export interface Card {
  id: string;
  title: string;
  description?: string;
  columnId: string;
}

export interface Column {
  id: string;
  title: string;
  cardIds: string[];
}

interface KanbanState {
  columns: Column[];
  cards: Record<string, Card>;
  hasHydrated: boolean;
  addColumn: (title: string) => void;
  addCard: (columnId: string, title: string, description?: string) => void;
  moveCard: (cardId: string, targetColumnId: string, targetIndex?: number) => void;
  reorderCards: (columnId: string, fromIndex: number, toIndex: number) => void;
  setHasHydrated: (value: boolean) => void;
}

const initialState = {
  columns: [
    { id: "col-1", title: "To Do", cardIds: [] },
    { id: "col-2", title: "In Progress", cardIds: [] },
    { id: "col-3", title: "Done", cardIds: [] },
  ] as Column[],
  cards: {} as Record<string, Card>,
};

export const useKanbanStore = create<KanbanState>()(
  persist(
    (set) => ({
      ...initialState,
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      addColumn: (title) =>
        set((state) => {
          const id = nanoid();
          return {
            columns: [...state.columns, { id, title, cardIds: [] }],
          };
        }),

      addCard: (columnId, title, description) =>
        set((state) => {
          const id = nanoid();
          const column = state.columns.find((c) => c.id === columnId);
          if (!column) return state;
          return {
            cards: {
              ...state.cards,
              [id]: { id, title, description, columnId },
            },
            columns: state.columns.map((c) =>
              c.id === columnId ? { ...c, cardIds: [...c.cardIds, id] } : c
            ),
          };
        }),

      moveCard: (cardId, targetColumnId, targetIndex) =>
        set((state) => {
          const card = state.cards[cardId];
          if (!card) return state;

          if (card.columnId === targetColumnId) {
            const column = state.columns.find((c) => c.id === targetColumnId);
            if (!column) return state;
            const fromIndex = column.cardIds.indexOf(cardId);
            if (fromIndex === -1) return state;
            const rawToIndex =
              targetIndex !== undefined ? targetIndex : column.cardIds.length;
            let toIndex = rawToIndex;
            if (fromIndex < toIndex) {
              toIndex -= 1;
            }
            if (fromIndex === toIndex) return state;
            const newCardIds = [...column.cardIds];
            const [removed] = newCardIds.splice(fromIndex, 1);
            newCardIds.splice(toIndex, 0, removed);
            return {
              columns: state.columns.map((c) =>
                c.id === targetColumnId ? { ...c, cardIds: newCardIds } : c
              ),
            };
          }

          const newColumns = state.columns.map((col) => {
            if (col.id === card.columnId) {
              return {
                ...col,
                cardIds: col.cardIds.filter((id) => id !== cardId),
              };
            }
            if (col.id === targetColumnId) {
              const index =
                targetIndex !== undefined ? targetIndex : col.cardIds.length;
              const inserted = [...col.cardIds];
              inserted.splice(index, 0, cardId);
              return { ...col, cardIds: inserted };
            }
            return col;
          });

          return {
            columns: newColumns,
            cards: {
              ...state.cards,
              [cardId]: { ...card, columnId: targetColumnId },
            },
          };
        }),

      reorderCards: (columnId, fromIndex, toIndex) =>
        set((state) => {
          const column = state.columns.find((c) => c.id === columnId);
          if (!column || fromIndex === toIndex) return state;

          const newCardIds = [...column.cardIds];
          const [removed] = newCardIds.splice(fromIndex, 1);
          newCardIds.splice(toIndex, 0, removed);

          return {
            columns: state.columns.map((c) =>
              c.id === columnId ? { ...c, cardIds: newCardIds } : c
            ),
          };
        }),
    }),
    {
      name: "kanban-storage",
      partialize: (state) => ({
        columns: state.columns,
        cards: state.cards,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
