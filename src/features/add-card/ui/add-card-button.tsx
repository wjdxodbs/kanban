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
  const [description, setDescription] = useState("");
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
        setDescription("");
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    if (trimmedTitle && todoColumn) {
      addCard(
        todoColumn.id,
        trimmedTitle,
        trimmedDescription.length > 0 ? trimmedDescription : undefined,
      );
      setTitle("");
      setDescription("");
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setTitle("");
    setDescription("");
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        size="lg"
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
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="할 일 내용을 입력하세요 (선택)"
                  className="mb-4 min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
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
