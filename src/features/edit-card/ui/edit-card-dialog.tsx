"use client";

import { useState, useEffect } from "react";
import { useKanbanStore } from "@/shared/store/kanban-store";
import type { Card as KanbanCard } from "@/shared/store/kanban-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Label } from "@/shared/ui/label";
import { Button } from "@/shared/ui/button";

interface EditCardDialogProps {
  card: KanbanCard;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCardDialog({ card, open, onOpenChange }: EditCardDialogProps) {
  const updateCard = useKanbanStore((state) => state.updateCard);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description ?? "");

  useEffect(() => {
    if (open) {
      setTitle(card.title);
      setDescription(card.description ?? "");
    }
  }, [open, card.id, card.title, card.description]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    updateCard(card.id, trimmedTitle, description.trim() || undefined);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>카드 편집</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-title">제목 *</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="카드 제목을 입력하세요"
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-desc">설명 (선택)</Label>
            <Textarea
              id="edit-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="내용 입력…"
              className="min-h-24 resize-none"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              저장
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
