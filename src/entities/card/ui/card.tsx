import type { CSSProperties } from "react";
import type { Card as KanbanCard } from "@/shared/store/kanban-store";
import {
  Card as ShadcnCard,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { GripVertical, Pencil, Trash2 } from "lucide-react";

interface KanbanCardProps {
  card: KanbanCard;
  className?: string;
  style?: CSSProperties;
  onEdit?: () => void;
  onDelete?: () => void;
  isDragOverlay?: boolean;
}

export function KanbanCardItem({
  card,
  className,
  style,
  onEdit,
  onDelete,
  isDragOverlay = false,
}: KanbanCardProps) {
  const cardNum = String(card.cardNumber ?? 0).padStart(3, "0");

  return (
    <ShadcnCard
      size="sm"
      style={style}
      className={cn(
        "group/card relative transition-opacity select-none",
        "hover:ring-foreground/20 hover:shadow-sm",
        className,
      )}
    >
      {/* Drag handle */}
      {!isDragOverlay && (
        <div
          aria-hidden="true"
          className="absolute left-1.5 top-1/2 -translate-y-1/2 opacity-0 transition-opacity text-muted-foreground pointer-events-none group-hover/card:opacity-50 group-focus-within/card:opacity-50"
        >
          <GripVertical className="size-3.5" />
        </div>
      )}

      <CardHeader className={cn(!isDragOverlay && "pl-6")}>
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <span className="font-mono text-[10px] text-muted-foreground/60 leading-none block mb-1">
              KAN-{cardNum}
            </span>
            <CardTitle className="leading-snug">{card.title}</CardTitle>
            {card.description?.trim() && (
              <CardDescription className="mt-1 line-clamp-3">
                {card.description}
              </CardDescription>
            )}
          </div>

          {/* Edit / Delete — appear on hover */}
          {(onEdit || onDelete) && (
            <div className="flex gap-0.5 opacity-0 transition-opacity shrink-0 -mt-0.5 -mr-0.5 pointer-events-none group-hover/card:opacity-100 group-hover/card:pointer-events-auto group-focus-within/card:opacity-100 group-focus-within/card:pointer-events-auto">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  aria-label="카드 편집"
                  className="focus-visible:ring-2 focus-visible:ring-primary/60"
                >
                  <Pencil className="size-3" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  aria-label="카드 삭제"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-destructive/60"
                >
                  <Trash2 className="size-3" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
    </ShadcnCard>
  );
}
