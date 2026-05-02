"use client";

import { useState, useCallback } from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, GripVertical } from "lucide-react";
import { KanbanCard } from "./kanban-card";
import { useKanbanStore } from "@/hooks/use-store";
import type { KanbanColumn as ColType } from "@/lib/types";

export function KanbanColumnComponent({ column }: { column: ColType }) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);

  const { filteredTasks, updateColumn, deleteColumn, setSelectedTask, setIsSheetOpen } = useKanbanStore();
  const tasks = filteredTasks(column.id);
  const isDefault = ["To Do", "On Progress", "Success"].includes(column.title);

  const handleRename = useCallback(() => {
    if (editTitle.trim()) updateColumn(column.id, editTitle.trim());
    setEditing(false);
  }, [column.id, editTitle, updateColumn]);

  const openTask = useCallback((id: string) => {
    const t = useKanbanStore.getState().tasks.find((x) => x.id === id);
    if (t) { setSelectedTask(t); setIsSheetOpen(true); }
  }, [setSelectedTask, setIsSheetOpen]);

  return (
    <div className="flex flex-col w-[280px] min-w-[280px] max-w-[280px] shrink-0 h-full">
      <Card className="flex flex-col h-full bg-[var(--column-bg)] border-0 shadow-none rounded-lg overflow-hidden">
        <CardHeader className="pb-2 pt-3 px-3 flex-shrink-0">
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
              <GripVertical className="h-4 w-4 text-muted-foreground/30 shrink-0" />
              {editing ? (
                <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} onBlur={handleRename} onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename();
                  if (e.key === "Escape") setEditing(false);
                }} className="h-7 text-xs font-semibold rounded px-1.5" autoFocus />
              ) : (
                <CardTitle className="text-xs font-semibold text-foreground cursor-pointer hover:text-primary transition-colors truncate" onClick={() => { setEditTitle(column.title); setEditing(true); }}>
                  {column.title}
                </CardTitle>
              )}
              <span className="text-xs text-muted-foreground bg-background/50 dark:bg-muted/50 px-1.5 py-0.5 rounded font-medium tabular-nums shrink-0">{tasks.length}</span>
            </div>
            <div className="flex items-center gap-0.5 shrink-0">
              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground/40 hover:text-foreground" onClick={() => { setEditTitle(column.title); setEditing(true); }}>
                <Pencil className="h-3 w-3" />
              </Button>
              {!isDefault && (
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground/40 hover:text-destructive" onClick={() => deleteColumn(column.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 px-2 pb-2 overflow-y-auto min-h-0">
          <Droppable droppableId={column.id} type="TASK">
            {(provided, snapshot) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className={`flex flex-col gap-1.5 min-h-[40px] rounded-md p-1 transition-colors ${snapshot.isDraggingOver ? "bg-primary/[0.04] ring-1 ring-primary/20" : ""}`}>
                {tasks.map((task, i) => (
                  <Draggable key={task.id} draggableId={task.id} index={i}>
                    {(provided, snapshot) => (
                      <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} style={provided.draggableProps.style} onClick={() => openTask(task.id)} className={`cursor-pointer ${snapshot.isDragging ? "rotate-1 shadow-lg" : ""}`}>
                        <KanbanCard task={task} />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </CardContent>
      </Card>
    </div>
  );
}
