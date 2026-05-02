import { Card } from "@/components/ui/card";
import { Calendar, User, ArrowUp } from "lucide-react";
import type { Task, Priority } from "@/lib/types";

const priorityConfig: Record<Priority, { label: string; color: string; dot: string }> = {
  low: { label: "Low", color: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20", dot: "bg-green-500" },
  medium: { label: "Medium", color: "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/20", dot: "bg-yellow-500" },
  high: { label: "High", color: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20", dot: "bg-orange-500" },
  urgent: { label: "Urgent", color: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20", dot: "bg-red-500" },
};

export function KanbanCard({ task }: { task: Task }) {
  const hasDue = !!task.due_date;
  const hasAssigned = !!task.assigned_by;
  const p = priorityConfig[task.priority] || priorityConfig.medium;

  return (
    <Card className="p-3 bg-card border-border/60 hover:border-border hover:shadow-sm transition-all duration-100 rounded-lg shadow-sm group">
      <div className="flex items-start gap-2 mb-2.5">
        <span className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${p.dot}`} />
        <p className="text-xs font-medium text-foreground leading-snug line-clamp-2">{task.title}</p>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className={`inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded border ${p.color}`}>
          <ArrowUp className="h-2.5 w-2.5" />
          {p.label}
        </span>
        {hasDue && (
          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
            <Calendar className="h-3 w-3" />
            {new Date(task.due_date!).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
          </span>
        )}
        {hasAssigned && (
          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
            <User className="h-3 w-3" />
            {task.assigned_by}
          </span>
        )}
      </div>
    </Card>
  );
}
