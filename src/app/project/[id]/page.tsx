"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useKanbanStore } from "@/hooks/use-store";
import { useTheme } from "@/components/theme/theme-provider";
import { KanbanBoardProject } from "@/components/kanban/kanban-board-project";
import { ArrowLeft, Trash2, Kanban, Moon, Sun, Bell, Settings2, CheckCheck, Clock, Link, Plus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useNotificationEngine, type NotifPrefs } from "@/hooks/use-notifications";

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const { projects, deleteProject, notifications, clearNotifications, addRelatedDoc, deleteRelatedDoc, getProjectDocs } = useKanbanStore();
  const { generateNotifications } = useNotificationEngine();
  const [notifOpen, setNotifOpen] = useState(false);
  const [prefs, setPrefs] = useState<NotifPrefs>({ dueDateDays: [0, 1, 3, 5], confirmingDays: [0], remindingDays: [0] });
  const [docDialogOpen, setDocDialogOpen] = useState(false);
  const [docTitle, setDocTitle] = useState("");
  const [docUrl, setDocUrl] = useState("");

  const project = projects.find((p) => p.id === id);
  const docs = getProjectDocs(id);

  const handleAddDoc = () => {
    if (!docTitle.trim() || !docUrl.trim()) return toast.error("Fill all fields");
    addRelatedDoc({ project_id: id, title: docTitle.trim(), url: docUrl.trim() });
    setDocTitle(""); setDocUrl(""); setDocDialogOpen(false);
    toast.success("Doc added");
  };

  const handleDelete = () => {
    if (!confirm("Delete this project and all its contents?")) return;
    deleteProject(id);
    toast.success("Project deleted");
    router.push("/");
  };

  if (!project) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-2">
          <Kanban className="h-7 w-7 mx-auto text-muted-foreground/30" />
          <p className="text-sm font-medium text-muted-foreground">Project not found</p>
          <Button variant="link" size="sm" className="text-[11px]" onClick={() => router.push("/")}>Back to dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="flex items-center justify-between px-4 sm:px-6 h-12 bg-[var(--header-bg)] border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="h-7 w-7 rounded bg-primary/10 flex items-center justify-center">
            <Kanban className="h-3.5 w-3.5 text-primary" />
          </div>
          <h1 className="text-sm font-semibold">{project.name}</h1>
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
                <div className="space-y-3">
                  <label className="text-[11px] font-medium text-muted-foreground">Due Date (days before)</label>
                  <Input value={prefs.dueDateDays.join(", ")} onChange={(e) => setPrefs((p) => ({ ...p, dueDateDays: e.target.value.split(",").map((s) => parseInt(s.trim())).filter((n) => !isNaN(n)) }))} placeholder="0, 1, 3, 5" className="h-8 text-xs bg-muted/50 border-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-3">
                    <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5"><Clock className="h-3 w-3" /> Confirming</label>
                    <Input value={prefs.confirmingDays.join(", ")} onChange={(e) => setPrefs((p) => ({ ...p, confirmingDays: e.target.value.split(",").map((s) => parseInt(s.trim())).filter((n) => !isNaN(n)) }))} placeholder="0" className="h-8 text-xs bg-muted/50 border-none" />
                  </div>
                  <div className="space-y-3">
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

          {/* Related Docs */}
          <Popover>
            <PopoverTrigger render={
              <Button variant="outline" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <Link className="h-4 w-4" />
              </Button>
            } />
            <PopoverContent align="end" sideOffset={8} className="w-[300px] p-0 rounded-lg shadow-xl">
              <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border">
                <span className="text-xs font-semibold flex items-center gap-2">
                  <Link className="h-4 w-4 text-primary" />
                  Related Docs
                </span>
                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{docs.length}</span>
              </div>
              <div className="p-2 max-h-[260px] overflow-y-auto space-y-1">
                {docs.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground text-center py-6">No docs yet</p>
                ) : (
                  docs.map((d) => (
                    <div key={d.id} className="flex items-center gap-2 px-3 py-2 rounded hover:bg-accent/50 transition-colors group">
                      <a href={d.url} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-0 text-xs text-foreground hover:text-primary truncate flex items-center gap-1.5">
                        <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
                        <span className="truncate">{d.title}</span>
                      </a>
                      <button onClick={() => { deleteRelatedDoc(d.id); toast.success("Deleted"); }} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
              <div className="p-3 border-t border-border">
                <Dialog open={docDialogOpen} onOpenChange={setDocDialogOpen}>
                  <DialogTrigger render={
                    <Button variant="outline" size="sm" className="w-full h-8 text-xs border-border shadow-none">
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Doc
                    </Button>
                  } />
                  <DialogContent className="rounded-lg shadow-xl">
                    <DialogTitle className="text-sm font-semibold">Add Related Doc</DialogTitle>
                    <div className="space-y-3 pt-2">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Title</label>
                        <Input placeholder="e.g., Design Spec" value={docTitle} onChange={(e) => setDocTitle(e.target.value)} className="h-9 text-sm" autoFocus />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">URL</label>
                        <Input placeholder="https://docs.google.com/..." value={docUrl} onChange={(e) => setDocUrl(e.target.value)} className="h-9 text-sm" onKeyDown={(e) => { if (e.key === "Enter") handleAddDoc(); }} />
                      </div>
                      <Button onClick={handleAddDoc} className="w-full h-9 text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-none" disabled={!docTitle.trim() || !docUrl.trim()}>Add</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </PopoverContent>
          </Popover>

          <Button variant="outline" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </header>
      <KanbanBoardProject projectId={id} />
    </div>
  );
}
