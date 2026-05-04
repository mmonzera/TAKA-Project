import { supabase } from "./supabase";
import type { Project, KanbanColumn, Task, ActivityLog, Notification, RelatedDoc, NewProject, NewColumn, NewTask, NewActivityLog, NewDoc } from "./types";

export const api = {
  // Projects
  getProjects: async () => {
    const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: true });
    if (error) throw error;
    return data as Project[];
  },
  addProject: async (p: Project) => {
    const { error } = await supabase.from("projects").insert(p);
    if (error) throw error;
  },
  deleteProject: async (id: string) => {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) throw error;
  },

  // Columns
  getColumns: async () => {
    const { data, error } = await supabase.from("columns").select("*").order("position", { ascending: true });
    if (error) throw error;
    return data as KanbanColumn[];
  },
  addColumn: async (c: KanbanColumn) => {
    const { error } = await supabase.from("columns").insert(c);
    if (error) throw error;
  },
  updateColumn: async (id: string, title: string) => {
    const { error } = await supabase.from("columns").update({ title }).eq("id", id);
    if (error) throw error;
  },
  deleteColumn: async (id: string) => {
    const { error } = await supabase.from("columns").delete().eq("id", id);
    if (error) throw error;
  },

  // Tasks
  getTasks: async () => {
    const { data, error } = await supabase.from("tasks").select("*").order("position", { ascending: true });
    if (error) throw error;
    return data as Task[];
  },
  addTask: async (t: Task) => {
    const { error } = await supabase.from("tasks").insert(t);
    if (error) throw error;
  },
  updateTask: async (id: string, d: Partial<Task>) => {
    const { error } = await supabase.from("tasks").update(d).eq("id", id);
    if (error) throw error;
  },
  deleteTask: async (id: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) throw error;
  },

  // Activity Logs
  getActivityLogs: async () => {
    const { data, error } = await supabase.from("activity_logs").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data as ActivityLog[];
  },
  addActivityLog: async (l: ActivityLog) => {
    const { error } = await supabase.from("activity_logs").insert(l);
    if (error) throw error;
  },
  deleteActivityLog: async (id: string) => {
    const { error } = await supabase.from("activity_logs").delete().eq("id", id);
    if (error) throw error;
  },

  // Notifications
  getNotifications: async () => {
    const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data as Notification[];
  },
  addNotification: async (n: Notification) => {
    const { error } = await supabase.from("notifications").insert(n);
    if (error) throw error;
  },
  clearNotifications: async () => {
    const { error } = await supabase.from("notifications").delete().neq("id", "");
    if (error) throw error;
  },

  // Related Docs
  getRelatedDocs: async () => {
    const { data, error } = await supabase.from("related_docs").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data as RelatedDoc[];
  },
  addRelatedDoc: async (d: RelatedDoc) => {
    const { error } = await supabase.from("related_docs").insert(d);
    if (error) throw error;
  },
  deleteRelatedDoc: async (id: string) => {
    const { error } = await supabase.from("related_docs").delete().eq("id", id);
    if (error) throw error;
  },
};
