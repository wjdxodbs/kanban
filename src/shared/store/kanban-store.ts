import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";

export interface Card {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  cardNumber: number;
}

export interface Column {
  id: string;
  title: string;
  cardIds: string[];
  color: string;
}

interface KanbanState {
  columns: Column[];
  cards: Record<string, Card>;
  nextCardNumber: number;
  hasHydrated: boolean;
  addCard: (columnId: string, title: string, description?: string) => void;
  deleteCard: (cardId: string) => void;
  updateCard: (cardId: string, title: string, description?: string) => void;
  moveCard: (cardId: string, targetColumnId: string, targetIndex?: number) => void;
  reorderCards: (columnId: string, fromIndex: number, toIndex: number) => void;
  setHasHydrated: (value: boolean) => void;
}

const initialState = {
  columns: [
    { id: "col-1", title: "To Do", cardIds: [], color: "oklch(0.623 0.182 254)" },
    { id: "col-2", title: "In Progress", cardIds: [], color: "oklch(0.714 0.165 68)" },
    { id: "col-3", title: "Done", cardIds: [], color: "oklch(0.648 0.17 155)" },
  ] as Column[],
  cards: {} as Record<string, Card>,
  nextCardNumber: 1,
};

export const useKanbanStore = create<KanbanState>()(
  persist(
    (set) => ({
      ...initialState,
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      addCard: (columnId, title, description) =>
        set((state) => {
          const id = nanoid();
          const column = state.columns.find((c) => c.id === columnId);
          if (!column) return state;
          return {
            cards: {
              ...state.cards,
              [id]: { id, title, description, columnId, cardNumber: state.nextCardNumber },
            },
            columns: state.columns.map((c) =>
              c.id === columnId ? { ...c, cardIds: [...c.cardIds, id] } : c
            ),
            nextCardNumber: state.nextCardNumber + 1,
          };
        }),

      deleteCard: (cardId) =>
        set((state) => {
          const card = state.cards[cardId];
          if (!card) return state;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [cardId]: _removed, ...remainingCards } = state.cards;
          return {
            cards: remainingCards,
            columns: state.columns.map((c) =>
              c.id === card.columnId
                ? { ...c, cardIds: c.cardIds.filter((id) => id !== cardId) }
                : c
            ),
          };
        }),

      updateCard: (cardId, title, description) =>
        set((state) => {
          const card = state.cards[cardId];
          if (!card) return state;
          return {
            cards: {
              ...state.cards,
              [cardId]: { ...card, title, description },
            },
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
            if (fromIndex < toIndex) toIndex -= 1;
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
              return { ...col, cardIds: col.cardIds.filter((id) => id !== cardId) };
            }
            if (col.id === targetColumnId) {
              const index = targetIndex !== undefined ? targetIndex : col.cardIds.length;
              const inserted = [...col.cardIds];
              inserted.splice(index, 0, cardId);
              return { ...col, cardIds: inserted };
            }
            return col;
          });

          return {
            columns: newColumns,
            cards: { ...state.cards, [cardId]: { ...card, columnId: targetColumnId } },
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
      version: 1,
      migrate: (persistedState, version) => {
        const state = persistedState as {
          columns: Array<{ id: string; title: string; cardIds: string[]; color?: string }>;
          cards: Record<string, { id: string; title: string; description?: string; columnId: string; cardNumber?: number }>;
          nextCardNumber?: number;
        };

        if (version === 0) {
          const colorMap: Record<string, string> = {
            "col-1": "oklch(0.623 0.182 254)",
            "col-2": "oklch(0.714 0.165 68)",
            "col-3": "oklch(0.648 0.17 155)",
          };
          let nextNum = 1;
          const migratedCards = Object.fromEntries(
            Object.entries(state.cards).map(([id, card]) => [
              id,
              { ...card, cardNumber: card.cardNumber ?? nextNum++ },
            ])
          );
          return {
            ...state,
            columns: state.columns.map((col) => ({
              ...col,
              color: colorMap[col.id] ?? "oklch(0.708 0 0)",
            })),
            cards: migratedCards,
            nextCardNumber: nextNum,
          };
        }

        return state;
      },
      partialize: (state) => ({
        columns: state.columns,
        cards: state.cards,
        nextCardNumber: state.nextCardNumber,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
