"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useKanbanStore } from "@/hooks/use-store";
import { useTheme } from "@/components/theme/theme-provider";
import { KanbanBoardProject } from "@/components/kanban/kanban-board-project";
import { ArrowLeft, Trash2, Kanban, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const { projects, deleteProject, fetchData } = useKanbanStore();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-2">
          <Kanban className="h-7 w-7 mx-auto text-muted-foreground/30" />
          <p className="text-xs font-medium text-muted-foreground">Project not found</p>
          <Button variant="link" size="sm" className="text-[11px]" onClick={() => router.push("/")}>Back to dashboard</Button>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    if (!confirm("Delete this project and all its tasks?")) return;
    deleteProject(id);
    toast.success("Project deleted");
    router.push("/");
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="flex items-center justify-between px-4 sm:px-6 h-11 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center">
            <Kanban className="h-3 w-3 text-primary" />
          </div>
          <h1 className="text-[13px] font-semibold">{project.name}</h1>
        </div>
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground" onClick={toggle}>
            {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-[10px] text-muted-foreground hover:text-destructive rounded-md" onClick={handleDelete}>
            <Trash2 className="h-3 w-3 mr-1" /> Delete
          </Button>
        </div>
      </header>
      <KanbanBoardProject projectId={id} />
    </div>
  );
}
