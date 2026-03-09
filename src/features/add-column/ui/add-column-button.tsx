"use client";

import { useState } from "react";
import { useKanbanStore } from "@/shared/store/kanban-store";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Plus } from "lucide-react";

interface AddColumnButtonProps {
  className?: string;
}

export function AddColumnButton({ className }: AddColumnButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const addColumn = useKanbanStore((state) => state.addColumn);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (trimmed) {
      addColumn(trimmed);
      setTitle("");
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setTitle("");
    setIsAdding(false);
  };

  if (isAdding) {
    return (
      <form onSubmit={handleSubmit} className={className}>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="컬럼 제목"
          className="mb-2"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Escape") handleCancel();
          }}
        />
        <div className="flex gap-2">
          <Button type="submit" size="sm">
            추가
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCancel}
          >
            취소
          </Button>
        </div>
      </form>
    );
  }

  return (
    <Button
      variant="outline"
      className={className}
      onClick={() => setIsAdding(true)}
    >
      <Plus className="size-4" />
      컬럼 추가
    </Button>
  );
}
