"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useKanbanStore } from "@/shared/store/kanban-store";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Plus } from "lucide-react";

interface AddCardButtonProps {
  className?: string;
}

export function AddCardButton({ className }: AddCardButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState("");
  const addCard = useKanbanStore((state) => state.addCard);
  const columns = useKanbanStore((state) => state.columns);
  const todoColumn =
    columns.find((column) => column.title === "할 일") ||
    columns.find((column) => column.title === "To Do") ||
    columns[0];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setTitle("");
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (trimmed && todoColumn) {
      addCard(todoColumn.id, trimmed);
      setTitle("");
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setTitle("");
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className={className}
        disabled={!todoColumn}
        onClick={() => setIsOpen(true)}
      >
        <Plus className="size-4" />할 일 추가
      </Button>

      {mounted &&
        isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
            onClick={handleCancel}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="할 일 추가 모달"
              className="w-full max-w-md rounded-lg border border-border bg-card p-5 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="mb-3 text-lg font-semibold text-card-foreground">
                할 일 추가
              </h2>
              <form onSubmit={handleSubmit}>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="할 일 제목을 입력하세요"
                  className="mb-3"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={handleCancel}>
                    취소
                  </Button>
                  <Button type="submit">추가</Button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
