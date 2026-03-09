import { create } from "zustand";
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
  addColumn: (title: string) => void;
  addCard: (columnId: string, title: string, description?: string) => void;
  moveCard: (cardId: string, targetColumnId: string, targetIndex?: number) => void;
  reorderCards: (columnId: string, fromIndex: number, toIndex: number) => void;
}

const initialState = {
  columns: [
    { id: "col-1", title: "To Do", cardIds: ["card-1", "card-2"] },
    { id: "col-2", title: "In Progress", cardIds: ["card-3"] },
    { id: "col-3", title: "Done", cardIds: ["card-4"] },
  ] as Column[],
  cards: {
    "card-1": {
      id: "card-1",
      title: "칸반 보드 구현",
      description: "FSD 구조 및 드래그앤드롭",
      columnId: "col-1",
    },
    "card-2": {
      id: "card-2",
      title: "다크 테마 적용",
      columnId: "col-1",
    },
    "card-3": {
      id: "card-3",
      title: "Zustand store 구성",
      columnId: "col-2",
    },
    "card-4": {
      id: "card-4",
      title: "초기 설정 완료",
      columnId: "col-3",
    },
  } as Record<string, Card>,
};

export const useKanbanStore = create<KanbanState>((set) => ({
  ...initialState,

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
          c.id === columnId
            ? { ...c, cardIds: [...c.cardIds, id] }
            : c
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
}));
