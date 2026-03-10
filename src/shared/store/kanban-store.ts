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
  lastResetDate?: string;
  hasHydrated: boolean;
  addCard: (columnId: string, title: string, description?: string) => void;
  deleteCard: (cardId: string) => void;
  updateCard: (cardId: string, title: string, description?: string) => void;
  moveCard: (cardId: string, targetColumnId: string, targetIndex?: number) => void;
  setHasHydrated: (value: boolean) => void;
  checkAndResetDaily: () => void;
}

const initialState = {
  columns: [
    { id: "col-1", title: "To Do", cardIds: [], color: "oklch(0.623 0.182 254)" },
    { id: "col-2", title: "In Progress", cardIds: [], color: "oklch(0.714 0.165 68)" },
    { id: "col-3", title: "Done", cardIds: [], color: "oklch(0.648 0.17 155)" },
  ] as Column[],
  cards: {} as Record<string, Card>,
  nextCardNumber: 1,
  lastResetDate: undefined as string | undefined,
};

const TO_DO_COLUMN_ID = "col-1";
const RESET_TIME_ZONE = process.env.NEXT_PUBLIC_RESET_TIME_ZONE ?? "Asia/Seoul";

function getTodayKey(date = new Date(), timeZone = RESET_TIME_ZONE) {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(date);

    const year = parts.find((part) => part.type === "year")?.value;
    const month = parts.find((part) => part.type === "month")?.value;
    const day = parts.find((part) => part.type === "day")?.value;

    if (!year || !month || !day) {
      return new Date().toISOString().slice(0, 10);
    }

    return `${year}-${month}-${day}`;
  } catch {
    // Invalid time zone or Intl failure fallback.
    return new Date().toISOString().slice(0, 10);
  }
}

export const useKanbanStore = create<KanbanState>()(
  persist(
    (set) => ({
      ...initialState,
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      checkAndResetDaily: () =>
        set((state) => {
          const today = getTodayKey();

          // First run (or migrated data without date): set baseline only.
          if (!state.lastResetDate) {
            return { lastResetDate: today };
          }

          if (state.lastResetDate === today) {
            return state;
          }

          const todoColumn = state.columns.find((c) => c.id === TO_DO_COLUMN_ID);
          if (!todoColumn) {
            return { lastResetDate: today };
          }

          const movedCardIds = state.columns
            .filter((c) => c.id !== TO_DO_COLUMN_ID)
            .flatMap((c) => c.cardIds);

          const nextColumns = state.columns.map((c) => {
            if (c.id === TO_DO_COLUMN_ID) {
              return {
                ...c,
                cardIds: [...c.cardIds, ...movedCardIds],
              };
            }
            return { ...c, cardIds: [] };
          });

          const nextCards = { ...state.cards };
          for (const cardId of movedCardIds) {
            const card = nextCards[cardId];
            if (!card) continue;
            nextCards[cardId] = {
              ...card,
              columnId: TO_DO_COLUMN_ID,
            };
          }

          return {
            columns: nextColumns,
            cards: nextCards,
            lastResetDate: today,
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

    }),
    {
      name: "kanban-storage",
      version: 1,
      migrate: (persistedState, version) => {
        const state = persistedState as {
          columns: Array<{ id: string; title: string; cardIds: string[]; color?: string }>;
          cards: Record<string, { id: string; title: string; description?: string; columnId: string; cardNumber?: number }>;
          nextCardNumber?: number;
          lastResetDate?: string;
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
            lastResetDate: state.lastResetDate,
          };
        }

        return state;
      },
      partialize: (state) => ({
        columns: state.columns,
        cards: state.cards,
        nextCardNumber: state.nextCardNumber,
        lastResetDate: state.lastResetDate,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
