"use client";

import { useState, useCallback, useMemo } from "react";
import { DragDropContext, Droppable, type DropResult } from "@hello-pangea/dnd";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Columns3 } from "lucide-react";
import { useKanbanStore } from "@/hooks/use-store";
import { KanbanColumnComponent } from "./kanban-column";
import { TaskDetailSheet } from "./task-detail-sheet";
import { toast } from "sonner";
import type { Priority } from "@/lib/types";

export function KanbanBoardProject({ projectId }: { projectId: string }) {
  const { columns, searchQuery, setSearchQuery, addColumn, addTask, moveTask, tasks, filteredTasks } = useKanbanStore();
  const [addOpen, setAddOpen] = useState(false);
  const [addColOpen, setAddColOpen] = useState(false);
  const [newColTitle, setNewColTitle] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskAssigned, setNewTaskAssigned] = useState("");
  const [newTaskDue, setNewTaskDue] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>("medium");
  const [newTaskCol, setNewTaskCol] = useState("");

  const projColumns = useMemo(
    () => columns.filter((c) => c.project_id === projectId).sort((a, b) => a.position - b.position),
    [columns, projectId]
  );

  const firstColId = projColumns[0]?.id || "";

  const { todo, progress, done, total } = useMemo(() => {
    const colMap = new Map(columns.map((c) => [c.id, c.title]));
    const pt = tasks.filter((t) => t.project_id === projectId);
    return {
      total: pt.length,
      todo: pt.filter((t) => colMap.get(t.column_id) === "To Do").length,
      progress: pt.filter((t) => colMap.get(t.column_id) === "On Progress").length,
      done: pt.filter((t) => colMap.get(t.column_id) === "Success").length,
    };
  }, [tasks, columns, projectId]);

  const onDragEnd = useCallback((r: DropResult) => {
    if (!r.destination) return;
    if (r.source.droppableId === r.destination.droppableId && r.source.index === r.destination.index) return;
    moveTask(r.draggableId, r.destination.droppableId, r.destination.index);
  }, [moveTask]);

  const addCol = useCallback(() => {
    if (!newColTitle.trim()) return;
    if (projColumns.length >= 10) { toast.error("Max 10 columns"); return; }
    addColumn({ title: newColTitle.trim(), position: projColumns.length, project_id: projectId });
    setNewColTitle(""); setAddColOpen(false);
  }, [newColTitle, projColumns.length, projectId, addColumn]);

  const handleAddTask = useCallback(() => {
    if (!newTaskTitle.trim() || !newTaskCol) return;
    addTask({
      title: newTaskTitle.trim(),
      column_id: newTaskCol,
      project_id: projectId,
      position: filteredTasks(newTaskCol).length,
      assigned_by: newTaskAssigned.trim() || undefined,
      due_date: newTaskDue || undefined,
      priority: newTaskPriority,
    });
    setNewTaskTitle(""); setNewTaskAssigned(""); setNewTaskDue(""); setNewTaskPriority("medium"); setNewTaskCol(firstColId);
    setAddOpen(false);
  }, [newTaskTitle, newTaskAssigned, newTaskDue, newTaskPriority, newTaskCol, projectId, firstColId, addTask, filteredTasks]);

  const priorityOptions: Priority[] = ["low", "medium", "high", "urgent"];

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-[var(--board-bg)]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-2 border-b border-border bg-[var(--header-bg)] shrink-0">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="font-semibold text-foreground">{todo}</span> To Do</span>
          <span className="flex items-center gap-1"><span className="font-semibold text-foreground">{progress}</span> In Progress</span>
          <span className="flex items-center gap-1"><span className="font-semibold text-foreground">{done}</span> Done</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <Input placeholder="Search tasks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 h-8 w-[180px] sm:w-[240px] text-sm bg-muted/50 border-border rounded-md" />
          </div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger render={
              <Button className="h-8 text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-none rounded-md px-3" disabled={!firstColId}>
                <Plus className="h-4 w-4 mr-1.5" /> Add Task
              </Button>
            } />
            <DialogContent className="rounded-lg shadow-xl">
              <DialogTitle className="text-sm font-semibold">Create Task</DialogTitle>
              <div className="space-y-3 pt-2">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Title *</label>
                  <Input placeholder="e.g., Design signup flow" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} className="h-9 text-sm" autoFocus onKeyDown={(e) => { if (e.key === "Enter") handleAddTask(); }} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Column</label>
                  <select value={newTaskCol} onChange={(e) => setNewTaskCol(e.target.value)} className="h-9 text-sm rounded-md bg-background border border-input w-full px-3 text-foreground">
                    {projColumns.map((c) => (<option key={c.id} value={c.id}>{c.title}</option>))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Priority</label>
                  <select value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value as Priority)} className="h-9 text-sm rounded-md bg-background border border-input w-full px-3 text-foreground">
                    {priorityOptions.map((p) => (<option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Assigned By</label>
                  <Input placeholder="e.g., CEO" value={newTaskAssigned} onChange={(e) => setNewTaskAssigned(e.target.value)} className="h-9 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Due Date</label>
                  <Input type="date" value={newTaskDue} onChange={(e) => setNewTaskDue(e.target.value)} className="h-9 text-sm" />
                </div>
                <Button onClick={handleAddTask} className="w-full h-9 text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-none" disabled={!newTaskTitle.trim()}>Create</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={addColOpen} onOpenChange={setAddColOpen}>
            <DialogTrigger render={
              <Button variant="ghost" size="sm" className="h-8 text-sm text-muted-foreground hover:text-foreground rounded-md px-2" disabled={projColumns.length >= 10}>
                <Columns3 className="h-4 w-4 mr-1" /> Column
              </Button>
            } />
            <DialogContent className="rounded-lg shadow-xl">
              <DialogTitle className="text-sm font-semibold">New Column</DialogTitle>
              <div className="space-y-3 pt-2">
                <Input placeholder="Column name..." value={newColTitle} onChange={(e) => setNewColTitle(e.target.value)} className="h-9 text-sm" autoFocus onKeyDown={(e) => { if (e.key === "Enter") addCol(); }} />
                <Button onClick={addCol} className="w-full h-9 text-sm bg-primary hover:bg-primary/90 shadow-none">Add</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {projColumns.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Columns3 className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm font-medium text-muted-foreground mb-3">No columns yet</p>
              <Button variant="outline" size="sm" className="h-8 text-sm border-border" onClick={() => setAddColOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> Add Column
              </Button>
            </div>
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="board" direction="horizontal" type="COLUMN">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="flex gap-4 h-full px-4 sm:px-6 py-4 kanban-scroll">
                  {projColumns.map((col) => (
                    <KanbanColumnComponent key={col.id} column={col} />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      <TaskDetailSheet />
    </div>
  );
}
