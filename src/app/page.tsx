"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useKanbanStore } from "@/hooks/use-store";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/components/theme/theme-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useNotificationEngine, type NotifPrefs } from "@/hooks/use-notifications";
import {
  Plus, Bell, Trash2, Search, Settings2,
  ListTodo, TrendingUp, CheckCircle,
  CheckCheck, AlertCircle, Clock, Kanban, Moon, Sun, LogOut,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const { user, loading: authLoading, signOut } = useAuth();
  const { projects, addProject, deleteProject, setCurrentProjectId, tasks, columns, notifications, clearNotifications, fetchData } = useKanbanStore();
  const { generateNotifications } = useNotificationEngine();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  const [projectName, setProjectName] = useState("");
  const [open, setOpen] = useState(false);
  const [searchT, setSearchT] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [prefs, setPrefs] = useState<NotifPrefs>({ dueDateDays: [0, 1, 3, 5], confirmingDays: [0], remindingDays: [0] });

  const handleCreateProject = useCallback(() => {
    if (!projectName.trim()) return;
    const id = addProject({ name: projectName.trim() });
    setProjectName("");
    setOpen(false);
    toast.success("Project created");
    router.push(`/project/${id}`);
  }, [projectName, addProject, router]);

  const goToProject = useCallback((id: string) => {
    setCurrentProjectId(id);
    router.push(`/project/${id}`);
  }, [router, setCurrentProjectId]);

  const projList = projects.filter((p) => p.name.toLowerCase().includes(searchT.toLowerCase()));

  const { totalTasks, todoTasks, progressTasks, doneTasks } = useMemo(() => {
    const colMap = new Map(columns.map((c) => [c.id, c.title]));
    return {
      totalTasks: tasks.length,
      todoTasks: tasks.filter((t) => colMap.get(t.column_id) === "To Do").length,
      progressTasks: tasks.filter((t) => colMap.get(t.column_id) === "On Progress").length,
      doneTasks: tasks.filter((t) => colMap.get(t.column_id) === "Success").length,
    };
  }, [tasks, columns]);

  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const stats = [
    { label: "Total", value: totalTasks, icon: Kanban, color: "" },
    { label: "To Do", value: todoTasks, icon: ListTodo, color: "text-yellow-600 dark:text-yellow-400" },
    { label: "In Progress", value: progressTasks, icon: TrendingUp, color: "text-blue-600 dark:text-blue-400" },
    { label: "Done", value: doneTasks, icon: CheckCircle, color: "text-green-600 dark:text-green-400", extra: completionRate > 0 && `${completionRate}%` },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  if (authLoading) return (
    <div className="h-screen flex items-center justify-center bg-background">
      <Kanban className="h-8 w-8 animate-pulse text-muted-foreground/30" />
    </div>
  );

  if (!user) return null;

  return (
    <div className="h-screen flex flex-col bg-[var(--board-bg)]">
      <header className="flex items-center justify-between px-4 sm:px-6 h-12 bg-[var(--header-bg)] border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Kanban className="h-5 w-5 text-primary" />
            <span className="text-sm font-bold text-foreground">TAKA</span>
          </div>
          {user && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
              {user.user_metadata?.full_name || user.email}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={toggle}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Popover open={notifOpen} onOpenChange={setNotifOpen}>
            <PopoverTrigger render={
              <Button variant="outline" size="icon" className="relative h-8 w-8 text-muted-foreground hover:text-foreground">
                <Bell className="h-4 w-4" />
                {notifications.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full h-3.5 min-w-[14px] flex items-center justify-center px-0.5 leading-none">
                    {notifications.length > 9 ? "9+" : notifications.length}
                  </span>
                )}
              </Button>
            } />
            <PopoverContent align="end" sideOffset={8} className="w-[calc(100vw-2rem)] sm:w-[340px] p-0 rounded-lg shadow-xl overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border bg-muted/30">
                <span className="text-xs font-semibold flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" />
                  Notifications
                </span>
                {notifications.length > 0 && (
                  <Button variant="ghost" size="xs" className="text-[10px] h-6 rounded text-muted-foreground hover:text-foreground px-1.5" onClick={() => { clearNotifications(); toast.success("Cleared"); }}>
                    <CheckCheck className="h-3 w-3 mr-0.5" />Clear
                  </Button>
                )}
              </div>
              
              <ScrollArea className="max-h-[240px]">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground opacity-40">
                    <Bell className="h-8 w-8 mb-2" />
                    <p className="text-[11px]">No notifications</p>
                  </div>
                ) : (
                  <div className="p-2 space-y-2">
                    {notifications.map((n) => (
                      <div key={n.id} className="px-3 py-2.5 rounded hover:bg-accent/50 transition-colors border border-transparent hover:border-border/40 text-[11px] text-foreground leading-relaxed group relative">
                        {n.message}
                        <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary" />
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              
              <div className="p-4 border-t border-border bg-muted/10 space-y-3">
                <span className="text-xs font-semibold flex items-center gap-2 mb-1">
                  <Settings2 className="h-4 w-4 text-primary" /> Reminder Settings
                </span>
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-muted-foreground">Due Date (days before)</label>
                  <Input value={prefs.dueDateDays.join(", ")} onChange={(e) => setPrefs((p) => ({ ...p, dueDateDays: e.target.value.split(",").map((s) => parseInt(s.trim())).filter((n) => !isNaN(n)) }))} placeholder="0, 1, 3, 5" className="h-8 text-xs bg-muted/50 border-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5"><Clock className="h-3 w-3" /> Confirming</label>
                    <Input value={prefs.confirmingDays.join(", ")} onChange={(e) => setPrefs((p) => ({ ...p, confirmingDays: e.target.value.split(",").map((s) => parseInt(s.trim())).filter((n) => !isNaN(n)) }))} placeholder="0" className="h-8 text-xs bg-muted/50 border-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5"><Bell className="h-3 w-3" /> Reminding</label>
                    <Input value={prefs.remindingDays.join(", ")} onChange={(e) => setPrefs((p) => ({ ...p, remindingDays: e.target.value.split(",").map((s) => parseInt(s.trim())).filter((n) => !isNaN(n)) }))} placeholder="0" className="h-8 text-xs bg-muted/50 border-none" />
                  </div>
                </div>
                <Button className="w-full h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-none" onClick={() => {
                  const gen = generateNotifications(prefs);
                  toast.success(gen.length > 0 ? `${gen.length} notification(s) generated` : "Saved settings");
                }}>Save & Generate</Button>
              </div>
            </PopoverContent>
          </Popover>

          <Button variant="outline" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map((s) => (
              <Card key={s.label} className="border-border shadow-none rounded-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
                    <s.icon className={`h-4 w-4 ${s.color || "text-muted-foreground"}`} />
                  </div>
                  <div className="flex items-end justify-between">
                    <span className={`text-2xl font-bold tracking-tight ${s.color}`}>{s.value}</span>
                    {s.extra && <span className="text-[11px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{s.extra}</span>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground">Projects</h2>
                <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{projects.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                  <Input placeholder="Search projects..." value={searchT} onChange={(e) => setSearchT(e.target.value)} className="pl-8 h-9 w-[160px] sm:w-[200px] text-sm border-border rounded-md" />
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger render={
                    <Button className="h-9 text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-none rounded-md px-4">
                      <Plus className="h-4 w-4 mr-1.5" /> New Project
                    </Button>
                  } />
                  <DialogContent className="rounded-lg shadow-xl">
                    <DialogTitle className="text-sm font-semibold">Create Project</DialogTitle>
                    <div className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Project Name</label>
                        <Input placeholder="e.g., Marketing Campaign" value={projectName} onChange={(e) => setProjectName(e.target.value)} className="h-9 text-sm" autoFocus onKeyDown={(e) => { if (e.key === "Enter") handleCreateProject(); }} />
                      </div>
                      <Button onClick={handleCreateProject} className="w-full h-9 text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-none" disabled={!projectName.trim()}>Create</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {projList.length === 0 ? (
              <div className="text-center py-16">
                <Kanban className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-sm font-medium text-muted-foreground">{searchT ? "No matches" : "No projects yet"}</p>
                <p className="text-xs text-muted-foreground/60 mt-1">{searchT ? "Try a different search" : "Create your first project to get started"}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {projList.map((proj) => (
                  <Card key={proj.id} className="group border-border hover:bg-accent/50 hover:border-border/80 transition-all cursor-pointer shadow-none rounded-lg" onClick={() => goToProject(proj.id)}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-sm font-semibold text-foreground leading-snug">{proj.name}</h3>
                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive -mt-0.5 -mr-1" onClick={(e) => { e.stopPropagation(); deleteProject(proj.id); toast.success("Deleted"); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><ListTodo className="h-3.5 w-3.5" />{tasks.filter((t) => t.project_id === proj.id).length} tasks</span>
                        <span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5 text-green-500" />{tasks.filter((t) => t.project_id === proj.id && columns.find((c) => c.id === t.column_id && c.title === "Success")).length} done</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
