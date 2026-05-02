"use client";

import { useState, useEffect, useCallback } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Calendar, User, MessageSquare, Plus, Trash2, CheckCircle, Clock, Bell, ArrowUp } from "lucide-react";
import { useKanbanStore } from "@/hooks/use-store";
import type { ActivityType, Priority } from "@/lib/types";

const priorityOptions: { value: Priority; label: string; color: string }[] = [
  { value: "low", label: "Low", color: "text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/20 bg-green-50 dark:bg-green-500/10" },
  { value: "medium", label: "Medium", color: "text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20 bg-yellow-50 dark:bg-yellow-500/10" },
  { value: "high", label: "High", color: "text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/20 bg-orange-50 dark:bg-orange-500/10" },
  { value: "urgent", label: "Urgent", color: "text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10" },
];

export function TaskDetailSheet() {
  const { selectedTask, isSheetOpen, setIsSheetOpen, setSelectedTask, updateTask, deleteTask, activityLogs, addActivityLog, deleteActivityLog } = useKanbanStore();
  const [t, setT] = useState("");
  const [d, setD] = useState("");
  const [a, setA] = useState("");
  const [dd, setDd] = useState("");
  const [p, setP] = useState<Priority>("medium");
  const [lc, setLc] = useState("");
  const [lt, setLt] = useState<ActivityType>("normal");
  const [ltd, setLtd] = useState("");

  const logs = activityLogs.filter((l) => l.task_id === selectedTask?.id);

  useEffect(() => {
    if (selectedTask) {
      setT(selectedTask.title);
      setD(selectedTask.description || "");
      setA(selectedTask.assigned_by || "");
      setDd(selectedTask.due_date ? selectedTask.due_date.split("T")[0] : "");
      setP(selectedTask.priority);
    }
  }, [selectedTask]);

  const save = useCallback(() => {
    if (!selectedTask) return;
    updateTask(selectedTask.id, { title: t, description: d || null, assigned_by: a || null, due_date: dd ? new Date(dd).toISOString() : null, priority: p });
    toast.success("Saved");
  }, [selectedTask, t, d, a, dd, p, updateTask]);

  const del = useCallback(() => {
    if (!selectedTask) return;
    deleteTask(selectedTask.id);
    setIsSheetOpen(false);
    setSelectedTask(null);
    toast.success("Deleted");
  }, [selectedTask, deleteTask, setIsSheetOpen, setSelectedTask]);

  const addLog = useCallback(() => {
    if (!selectedTask || !lc.trim()) return;
    addActivityLog({ task_id: selectedTask.id, type: lt, content: lc.trim(), target_date: ltd || undefined });
    setLc(""); setLtd("");
  }, [selectedTask, lc, lt, ltd, addActivityLog]);

  if (!selectedTask) return null;

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col border-l border-border" showCloseButton={false}>
        <SheetHeader className="px-4 sm:px-5 pt-5 pb-0 shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <input value={t} onChange={(e) => setT(e.target.value)} className="w-full text-sm font-semibold bg-transparent border-none outline-none focus:ring-0 p-0" placeholder="Task title..." />
            </div>
            <div className="flex items-center gap-1 ml-3 shrink-0">
              <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground rounded-md px-2" onClick={save}>
                <CheckCircle className="h-3.5 w-3.5 mr-1" />Save
              </Button>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-destructive rounded-md px-2" onClick={del}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </SheetHeader>
        <ScrollArea className="flex-1 px-6 py-6">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <label className="text-[13px] font-semibold text-foreground/80 flex items-center gap-1.5 ml-0.5"><ArrowUp className="h-3.5 w-3.5 text-primary/70" />Priority</label>
              <div className="flex flex-wrap gap-2">
                {priorityOptions.map((op) => (
                  <Button
                    key={op.value}
                    variant="outline"
                    size="sm"
                    className={`h-8 text-xs rounded-lg px-4 border ${p === op.value ? op.color + " ring-1 ring-inset ring-current font-bold" : "border-border text-muted-foreground bg-muted/20"}`}
                    onClick={() => setP(op.value)}
                  >
                    {op.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2.5">
                <label className="text-[13px] font-semibold text-foreground/80 flex items-center gap-1.5 ml-0.5"><User className="h-3.5 w-3.5 text-primary/70" />Assigned By</label>
                <Input value={a} onChange={(e) => setA(e.target.value)} placeholder="Who assigned this?" className="h-10 text-sm bg-muted/30 border-muted-foreground/20" />
              </div>
              <div className="flex flex-col gap-2.5">
                <label className="text-[13px] font-semibold text-foreground/80 flex items-center gap-1.5 ml-0.5"><Calendar className="h-3.5 w-3.5 text-primary/70" />Due Date</label>
                <Input type="date" value={dd} onChange={(e) => setDd(e.target.value)} className="h-10 text-sm bg-muted/30 border-muted-foreground/20" />
              </div>
            </div>
            <div className="flex flex-col gap-2.5">
              <label className="text-[13px] font-semibold text-foreground/80 ml-0.5">Description</label>
              <Textarea value={d} onChange={(e) => setD(e.target.value)} placeholder="Add details, references..." className="min-h-[140px] text-sm bg-muted/30 border-muted-foreground/20 leading-relaxed p-4" />
            </div>
          </div>
          <Separator className="my-5" />
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" /> Activity Log
            </h3>
            <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border">
              <Textarea value={lc} onChange={(e) => setLc(e.target.value)} placeholder="What's the latest update?" className="min-h-[60px] text-sm" />
              <div className="flex flex-wrap gap-1">
                {(["normal", "confirming", "reminding"] as const).map((type) => (
                  <Button key={type} variant={lt === type ? "default" : "outline"} size="sm" className="h-7 text-xs rounded-md shadow-none" onClick={() => setLt(type)}>
                    {type === "confirming" ? <Clock className="h-3 w-3 mr-1" /> : type === "reminding" ? <Bell className="h-3 w-3 mr-1" /> : <MessageSquare className="h-3 w-3 mr-1" />}
                    {type}
                  </Button>
                ))}
              </div>
              {(lt === "confirming" || lt === "reminding") && (
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground whitespace-nowrap">Target:</label>
                  <Input type="date" value={ltd} onChange={(e) => setLtd(e.target.value)} className="h-8 text-sm" />
                </div>
              )}
              <Button onClick={addLog} size="sm" className="w-full h-8 text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-none" disabled={!lc.trim()}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Log
              </Button>
            </div>
            <div className="space-y-3">
              {logs.length === 0 ? (
                <p className="text-xs text-muted-foreground/60 text-center py-4">No activity logs yet.</p>
              ) : (
                logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((log) => (
                  <div key={log.id} className="flex gap-2.5 p-3 rounded-lg bg-muted/20 border border-border/40 group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Badge variant="outline" className={`text-[10px] h-5 px-1.5 rounded ${log.type === "confirming" ? "border-amber-400/40 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400" : log.type === "reminding" ? "border-blue-400/40 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400" : "text-muted-foreground"}`}>
                          {log.type}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground/60">{new Date(log.created_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</span>
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{log.content}</p>
                      {log.target_date && (
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground/60">
                          <Calendar className="h-3 w-3" />
                          {log.type === "confirming" ? "Confirm by: " : "Remind by: "}
                          {new Date(log.target_date).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                        </div>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive shrink-0" onClick={() => { deleteActivityLog(log.id); toast.success("Log deleted"); }}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
