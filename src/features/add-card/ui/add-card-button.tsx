"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useKanbanStore } from "@/shared/store/kanban-store";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Label } from "@/shared/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog";

interface AddCardButtonProps {
  className?: string;
}

export function AddCardButton({ className }: AddCardButtonProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const addCard = useKanbanStore((state) => state.addCard);
  const columns = useKanbanStore((state) => state.columns);
  // Always adds to "To Do" (col-1), fallback to first column
  const todoColumn = columns.find((c) => c.id === "col-1") ?? columns[0];

  const reset = () => {
    setTitle("");
    setDescription("");
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    setOpen(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle || !todoColumn) return;
    addCard(todoColumn.id, trimmedTitle, description.trim() || undefined);
    reset();
    setOpen(false);
  };

  return (
    <>
      <Button size="sm" className={className} onClick={() => setOpen(true)}>
        <Plus className="size-3.5" />
        카드 추가
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>카드 추가</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="add-title">제목 *</Label>
              <Input
                id="add-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="카드 제목을 입력하세요"
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="add-desc">설명 (선택)</Label>
              <Textarea
                id="add-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="내용 입력…"
                className="min-h-24 resize-none"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
                취소
              </Button>
              <Button type="submit" disabled={!title.trim()}>
                추가
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
