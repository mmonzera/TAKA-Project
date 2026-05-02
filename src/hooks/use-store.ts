"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { KanbanColumn, Task, ActivityLog, Notification, Project, NewProject, NewColumn, NewTask, NewActivityLog } from "@/lib/types";

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

  addProject: (p: NewProject) => string;
  deleteProject: (id: string) => void;
  setCurrentProjectId: (id: string | null) => void;
  addColumn: (c: NewColumn) => void;
  updateColumn: (id: string, title: string) => void;
  deleteColumn: (id: string) => void;
  addTask: (t: NewTask) => void;
  updateTask: (id: string, d: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, colId: string, pos: number) => void;
  addActivityLog: (l: NewActivityLog) => void;
  deleteActivityLog: (id: string) => void;
  addNotification: (msg: string) => void;
  clearNotifications: () => void;
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

      addProject: (p) => {
        const id = genId();
        set((s) => ({
          projects: [...s.projects, { id, name: p.name }],
          columns: [...s.columns, ...getDefaultCols(id)],
          currentProjectId: id,
        }));
        return id;
      },

      deleteProject: (id) => set((s) => ({
        projects: s.projects.filter((p) => p.id !== id),
        columns: s.columns.filter((c) => c.project_id !== id),
        tasks: s.tasks.filter((t) => t.project_id !== id),
        activityLogs: s.activityLogs.filter((l) => !s.tasks.find((t) => t.id === l.task_id && t.project_id === id)),
        currentProjectId: s.currentProjectId === id ? null : s.currentProjectId,
      })),

      setCurrentProjectId: (id) => set({ currentProjectId: id }),

      addColumn: (c) => set((s) => ({ columns: [...s.columns, { id: genId(), project_id: c.project_id, title: c.title, position: c.position }] })),
      updateColumn: (id, title) => set((s) => ({ columns: s.columns.map((c) => c.id === id ? { ...c, title } : c) })),
      deleteColumn: (id) => set((s) => ({ columns: s.columns.filter((c) => c.id !== id), tasks: s.tasks.filter((t) => t.column_id !== id) })),

      addTask: (t) => set((s) => ({
        tasks: [...s.tasks, {
          id: genId(), project_id: t.project_id, column_id: t.column_id,
          title: t.title, description: t.description || null,
          due_date: t.due_date || null, assigned_by: t.assigned_by || null,
          priority: t.priority || "medium",
          position: t.position, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        }],
      })),

      updateTask: (id, d) => set((s) => ({ tasks: s.tasks.map((t) => t.id === id ? { ...t, ...d, updated_at: new Date().toISOString() } : t) })),
      deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id), activityLogs: s.activityLogs.filter((l) => l.task_id !== id), selectedTask: s.selectedTask?.id === id ? null : s.selectedTask })),

      moveTask: (taskId, colId, pos) => set((s) => ({ tasks: s.tasks.map((t) => t.id === taskId ? { ...t, column_id: colId, position: pos, updated_at: new Date().toISOString() } : t) })),

      addActivityLog: (l) => set((s) => ({
        activityLogs: [...s.activityLogs, { id: genId(), task_id: l.task_id, type: l.type, content: l.content, target_date: l.target_date || null, created_at: new Date().toISOString() }],
      })),

      deleteActivityLog: (id) => set((s) => ({ activityLogs: s.activityLogs.filter((l) => l.id !== id) })),

      addNotification: (msg) => set((s) => ({ notifications: [{ id: genId(), message: msg, created_at: new Date().toISOString() }, ...s.notifications] })),
      clearNotifications: () => set({ notifications: [] }),

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
