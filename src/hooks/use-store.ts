"use client";

import { create } from "zustand";
import { api } from "@/lib/api";
import type { KanbanColumn, Task, ActivityLog, Notification, Project, RelatedDoc, NewProject, NewColumn, NewTask, NewActivityLog, NewDoc } from "@/lib/types";

let counter = 0;
const genId = () => `tak_${Date.now()}_${++counter}`;

function getDefaultCols(projectId: string): Omit<KanbanColumn, "id">[] {
  return [
    { project_id: projectId, title: "To Do", position: 0 },
    { project_id: projectId, title: "On Progress", position: 1 },
    { project_id: projectId, title: "Success", position: 2 },
  ];
}

interface KanbanState {
  projects: Project[];
  columns: KanbanColumn[];
  tasks: Task[];
  activityLogs: ActivityLog[];
  notifications: Notification[];
  relatedDocs: RelatedDoc[];
  selectedTask: Task | null;
  isSheetOpen: boolean;
  searchQuery: string;
  currentProjectId: string | null;
  isLoading: boolean;

  fetchData: () => Promise<void>;
  addProject: (p: NewProject) => Promise<string>;
  deleteProject: (id: string) => Promise<void>;
  setCurrentProjectId: (id: string | null) => void;
  addColumn: (c: NewColumn) => Promise<void>;
  updateColumn: (id: string, title: string) => Promise<void>;
  deleteColumn: (id: string) => Promise<void>;
  addTask: (t: NewTask) => Promise<void>;
  updateTask: (id: string, d: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (taskId: string, colId: string, pos: number) => Promise<void>;
  addActivityLog: (l: NewActivityLog) => Promise<void>;
  deleteActivityLog: (id: string) => Promise<void>;
  addNotification: (msg: string) => Promise<void>;
  clearNotifications: () => Promise<void>;
  setSelectedTask: (t: Task | null) => void;
  setIsSheetOpen: (o: boolean) => void;
  setSearchQuery: (q: string) => void;
  filteredTasks: (colId: string) => Task[];
  stats: (projectId?: string) => { total: number; todo: number; progress: number; done: number };

  // Related Docs
  addRelatedDoc: (d: NewDoc) => Promise<void>;
  deleteRelatedDoc: (id: string) => Promise<void>;
  getProjectDocs: (projectId: string) => RelatedDoc[];
}

export const useKanbanStore = create<KanbanState>()(
  (set, get) => ({
    projects: [],
    columns: [],
    tasks: [],
    activityLogs: [],
    notifications: [],
    relatedDocs: [],
    selectedTask: null,
    isSheetOpen: false,
    searchQuery: "",
    currentProjectId: null,
    isLoading: false,

    fetchData: async () => {
      set({ isLoading: true });
      try {
        const [projects, columns, tasks, activityLogs, notifications, relatedDocs] = await Promise.all([
          api.getProjects(),
          api.getColumns(),
          api.getTasks(),
          api.getActivityLogs(),
          api.getNotifications(),
          api.getRelatedDocs(),
        ]);
        set({ projects, columns, tasks, activityLogs, notifications, relatedDocs, isLoading: false });
      } catch (error) {
        console.error("Failed to fetch data:", error);
        set({ isLoading: false });
      }
    },

    addProject: async (p) => {
      const id = genId();
      const project: Project = { id, name: p.name };
      const cols = getDefaultCols(id).map(() => ({ ...getDefaultCols(id)[0], id: genId() }));

      try {
        await api.addProject(project);
        const newCols = getDefaultCols(id).map((c) => ({ ...c, id: genId() }));
        await Promise.all(newCols.map((col) => api.addColumn(col)));

        set((s) => ({
          projects: [...s.projects, project],
          columns: [...s.columns, ...newCols],
          currentProjectId: id,
        }));
        return id;
      } catch (error) {
        console.error("Failed to add project:", error);
        throw error;
      }
    },

    deleteProject: async (id) => {
      try {
        await api.deleteProject(id);
        set((s) => ({
          projects: s.projects.filter((p) => p.id !== id),
          columns: s.columns.filter((c) => c.project_id !== id),
          tasks: s.tasks.filter((t) => t.project_id !== id),
          relatedDocs: s.relatedDocs.filter((d) => d.project_id !== id),
          currentProjectId: s.currentProjectId === id ? null : s.currentProjectId,
        }));
      } catch (error) {
        console.error("Failed to delete project:", error);
        throw error;
      }
    },

    setCurrentProjectId: (id) => set({ currentProjectId: id }),

    addColumn: async (c) => {
      const column: KanbanColumn = { id: genId(), project_id: c.project_id, title: c.title, position: c.position };
      try {
        await api.addColumn(column);
        set((s) => ({ columns: [...s.columns, column] }));
      } catch (error) {
        console.error("Failed to add column:", error);
        throw error;
      }
    },

    updateColumn: async (id, title) => {
      try {
        await api.updateColumn(id, title);
        set((s) => ({ columns: s.columns.map((c) => c.id === id ? { ...c, title } : c) }));
      } catch (error) {
        console.error("Failed to update column:", error);
        throw error;
      }
    },

    deleteColumn: async (id) => {
      try {
        await api.deleteColumn(id);
        set((s) => ({
          columns: s.columns.filter((c) => c.id !== id),
          tasks: s.tasks.filter((t) => t.column_id !== id),
        }));
      } catch (error) {
        console.error("Failed to delete column:", error);
        throw error;
      }
    },

    addTask: async (t) => {
      const task: Task = {
        id: genId(), project_id: t.project_id, column_id: t.column_id,
        title: t.title, description: t.description || null,
        due_date: t.due_date || null, assigned_by: t.assigned_by || null,
        priority: t.priority || "medium",
        position: t.position, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      };
      try {
        await api.addTask(task);
        set((s) => ({ tasks: [...s.tasks, task] }));
      } catch (error) {
        console.error("Failed to add task:", error);
        throw error;
      }
    },

    updateTask: async (id, d) => {
      try {
        await api.updateTask(id, d);
        set((s) => ({
          tasks: s.tasks.map((t) => t.id === id ? { ...t, ...d, updated_at: new Date().toISOString() } : t),
        }));
      } catch (error) {
        console.error("Failed to update task:", error);
        throw error;
      }
    },

    deleteTask: async (id) => {
      try {
        await api.deleteTask(id);
        set((s) => ({
          tasks: s.tasks.filter((t) => t.id !== id),
          selectedTask: s.selectedTask?.id === id ? null : s.selectedTask,
        }));
      } catch (error) {
        console.error("Failed to delete task:", error);
        throw error;
      }
    },

    moveTask: async (taskId, colId, pos) => {
      try {
        await api.updateTask(taskId, { column_id: colId, position: pos });
        set((s) => ({
          tasks: s.tasks.map((t) => t.id === taskId ? { ...t, column_id: colId, position: pos, updated_at: new Date().toISOString() } : t),
        }));
      } catch (error) {
        console.error("Failed to move task:", error);
        throw error;
      }
    },

    addActivityLog: async (l) => {
      const log: ActivityLog = {
        id: genId(), task_id: l.task_id, type: l.type, content: l.content,
        target_date: l.target_date || null, created_at: new Date().toISOString(),
      };
      try {
        await api.addActivityLog(log);
        set((s) => ({ activityLogs: [...s.activityLogs, log] }));
      } catch (error) {
        console.error("Failed to add activity log:", error);
        throw error;
      }
    },

    deleteActivityLog: async (id) => {
      try {
        await api.deleteActivityLog(id);
        set((s) => ({ activityLogs: s.activityLogs.filter((l) => l.id !== id) }));
      } catch (error) {
        console.error("Failed to delete activity log:", error);
      }
    },

    addNotification: async (msg) => {
      const n: Notification = { id: genId(), message: msg, created_at: new Date().toISOString() };
      try {
        await api.addNotification(n);
        set((s) => ({ notifications: [n, ...s.notifications] }));
      } catch (error) {
        console.error("Failed to add notification:", error);
        throw error;
      }
    },

    clearNotifications: async () => {
      try {
        await api.clearNotifications();
        set({ notifications: [] });
      } catch (error) {
        console.error("Failed to clear notifications:", error);
        throw error;
      }
    },

    setSelectedTask: (t) => set({ selectedTask: t }),
    setIsSheetOpen: (o) => set({ isSheetOpen: o }),
    setSearchQuery: (q) => set({ searchQuery: q }),

    filteredTasks: (colId) => {
      const s = get();
      const q = s.searchQuery.toLowerCase().trim();
      return s.tasks
        .filter((t) => t.column_id === colId)
        .filter((t) => !q || t.title.toLowerCase().includes(q) || (t.assigned_by && t.assigned_by.toLowerCase().includes(q)))
        .sort((a, b) => a.position - b.position);
    },

    stats: (projectId) => {
      const { tasks, columns } = get();
      const t = projectId ? tasks.filter((tk) => tk.project_id === projectId) : tasks;
      return {
        total: t.length,
        todo: t.filter((tk) => columns.find((c) => c.id === tk.column_id && c.title === "To Do")).length,
        progress: t.filter((tk) => columns.find((c) => c.id === tk.column_id && c.title === "On Progress")).length,
        done: t.filter((tk) => columns.find((c) => c.id === tk.column_id && c.title === "Success")).length,
      };
    },

    // Related Docs
    addRelatedDoc: async (d) => {
      const doc: RelatedDoc = {
        id: genId(), project_id: d.project_id, title: d.title, url: d.url,
        created_at: new Date().toISOString(),
      };
      try {
        await api.addRelatedDoc(doc);
        set((s) => ({ relatedDocs: [...s.relatedDocs, doc] }));
      } catch (error) {
        console.error("Failed to add related doc:", error);
        throw error;
      }
    },

    deleteRelatedDoc: async (id) => {
      try {
        await api.deleteRelatedDoc(id);
        set((s) => ({ relatedDocs: s.relatedDocs.filter((d) => d.id !== id) }));
      } catch (error) {
        console.error("Failed to delete related doc:", error);
      }
    },

    getProjectDocs: (projectId) => {
      return get().relatedDocs.filter((d) => d.project_id === projectId);
    },
  })
);