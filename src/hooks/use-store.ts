"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { KanbanColumn, Task, ActivityLog, Notification, Project, NewProject, NewColumn, NewTask, NewActivityLog } from "@/lib/types";
import { api } from "@/lib/api";

let counter = 0;
const genId = () => `tak_${Date.now()}_${++counter}`;

interface KanbanState {
  projects: Project[];
  columns: KanbanColumn[];
  tasks: Task[];
  activityLogs: ActivityLog[];
  notifications: Notification[];
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
  deleteActivityLog: (id: string) => void;
  addNotification: (msg: string) => Promise<void>;
  clearNotifications: () => Promise<void>;
  setSelectedTask: (t: Task | null) => void;
  setIsSheetOpen: (o: boolean) => void;
  setSearchQuery: (q: string) => void;
  filteredTasks: (colId: string) => Task[];
  stats: (projectId?: string) => { total: number; todo: number; progress: number; done: number };
}

function getDefaultCols(projectId: string): KanbanColumn[] {
  return [
    { id: `td_${projectId}`, project_id: projectId, title: "To Do", position: 0 },
    { id: `pr_${projectId}`, project_id: projectId, title: "On Progress", position: 1 },
    { id: `dn_${projectId}`, project_id: projectId, title: "Success", position: 2 },
  ];
}

export const useKanbanStore = create<KanbanState>()(
  persist(
    (set, get) => ({
      projects: [],
      columns: [],
      tasks: [],
      activityLogs: [],
      notifications: [],
      selectedTask: null,
      isSheetOpen: false,
      searchQuery: "",
      currentProjectId: null,
      isLoading: false,

      fetchData: async () => {
        set({ isLoading: true });
        try {
          const [projects, columns, tasks, logs, notifications] = await Promise.all([
            api.getProjects(),
            api.getColumns(),
            api.getTasks(),
            api.getActivityLogs(),
            api.getNotifications(),
          ]);
          set({ projects, columns, tasks, activityLogs: logs, notifications, isLoading: false });
        } catch (e) {
          console.error("Failed to fetch data:", e);
          set({ isLoading: false });
        }
      },

      addProject: async (p) => {
        const id = genId();
        const project = { id, name: p.name };
        const cols = getDefaultCols(id);
        
        // Optimistic update
        set((s) => ({
          projects: [...s.projects, project],
          columns: [...s.columns, ...cols],
          currentProjectId: id,
        }));

        try {
          await api.addProject(project);
          for (const col of cols) {
            await api.addColumn(col);
          }
        } catch (e) {
          console.error(e);
          get().fetchData(); // Rollback on error
        }
        return id;
      },

      deleteProject: async (id) => {
        set((s) => ({
          projects: s.projects.filter((p) => p.id !== id),
          columns: s.columns.filter((c) => c.project_id !== id),
          tasks: s.tasks.filter((t) => t.project_id !== id),
          currentProjectId: s.currentProjectId === id ? null : s.currentProjectId,
        }));
        try {
          await api.deleteProject(id);
        } catch (e) {
          console.error(e);
          get().fetchData();
        }
      },

      setCurrentProjectId: (id) => set({ currentProjectId: id }),

      addColumn: async (c) => {
        const column = { id: genId(), project_id: c.project_id, title: c.title, position: c.position };
        set((s) => ({ columns: [...s.columns, column] }));
        try {
          await api.addColumn(column);
        } catch (e) {
          console.error(e);
          get().fetchData();
        }
      },

      updateColumn: async (id, title) => {
        set((s) => ({ columns: s.columns.map((c) => c.id === id ? { ...c, title } : c) }));
        try {
          await api.updateColumn(id, title);
        } catch (e) {
          console.error(e);
          get().fetchData();
        }
      },

      deleteColumn: async (id) => {
        set((s) => ({ columns: s.columns.filter((c) => c.id !== id), tasks: s.tasks.filter((t) => t.column_id !== id) }));
        try {
          await api.deleteColumn(id);
        } catch (e) {
          console.error(e);
          get().fetchData();
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
        set((s) => ({ tasks: [...s.tasks, task] }));
        try {
          await api.addTask(task);
        } catch (e) {
          console.error(e);
          get().fetchData();
        }
      },

      updateTask: async (id, d) => {
        set((s) => ({ tasks: s.tasks.map((t) => t.id === id ? { ...t, ...d, updated_at: new Date().toISOString() } : t) }));
        try {
          await api.updateTask(id, d);
        } catch (e) {
          console.error(e);
          get().fetchData();
        }
      },

      deleteTask: async (id) => {
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id), selectedTask: s.selectedTask?.id === id ? null : s.selectedTask }));
        try {
          await api.deleteTask(id);
        } catch (e) {
          console.error(e);
          get().fetchData();
        }
      },

      moveTask: async (taskId, colId, pos) => {
        set((s) => ({ tasks: s.tasks.map((t) => t.id === taskId ? { ...t, column_id: colId, position: pos, updated_at: new Date().toISOString() } : t) }));
        try {
          await api.updateTask(taskId, { column_id: colId, position: pos });
        } catch (e) {
          console.error(e);
          get().fetchData();
        }
      },

      addActivityLog: async (l) => {
        const log = { id: genId(), task_id: l.task_id, type: l.type, content: l.content, target_date: l.target_date || null, created_at: new Date().toISOString() };
        set((s) => ({ activityLogs: [...s.activityLogs, log] }));
        try {
          await api.addActivityLog(log);
        } catch (e) {
          console.error(e);
          get().fetchData();
        }
      },

      deleteActivityLog: (id) => set((s) => ({ activityLogs: s.activityLogs.filter((l) => l.id !== id) })),

      addNotification: async (msg) => {
        const n = { id: genId(), message: msg, created_at: new Date().toISOString() };
        set((s) => ({ notifications: [n, ...s.notifications] }));
        try {
          await api.addNotification(n);
        } catch (e) {
          console.error(e);
          get().fetchData();
        }
      },

      clearNotifications: async () => {
        set({ notifications: [] });
        try {
          await api.clearNotifications();
        } catch (e) {
          console.error(e);
          get().fetchData();
        }
      },

      setSelectedTask: (t) => set({ selectedTask: t }),
      setIsSheetOpen: (o) => set({ isSheetOpen: o }),
      setSearchQuery: (q) => set({ searchQuery: q }),

      filteredTasks: (colId) => {
        const s = get();
        const q = s.searchQuery.toLowerCase().trim();
        return s.tasks.filter((t) => t.column_id === colId).filter((t) => !q || t.title.toLowerCase().includes(q) || (t.assigned_by && t.assigned_by.toLowerCase().includes(q))).sort((a, b) => a.position - b.position);
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
    }),
    {
      name: "taka-storage",
    }
  )
);
