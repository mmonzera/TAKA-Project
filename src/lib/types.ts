export interface Project {
  id: string;
  name: string;
}

export interface KanbanColumn {
  id: string;
  project_id: string;
  title: string;
  position: number;
}

export type Priority = "low" | "medium" | "high" | "urgent";

export interface Task {
  id: string;
  project_id: string;
  column_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  assigned_by: string | null;
  priority: Priority;
  position: number;
  created_at: string;
  updated_at: string;
}

export type ActivityType = "normal" | "confirming" | "reminding";

export interface ActivityLog {
  id: string;
  task_id: string;
  type: ActivityType;
  content: string;
  target_date: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  message: string;
  created_at: string;
}

export type NewProject = Pick<Project, "name">;
export type NewColumn = Pick<KanbanColumn, "title" | "position" | "project_id">;
export type NewTask = Pick<Task, "title" | "column_id" | "project_id" | "position"> & {
  description?: string;
  due_date?: string;
  assigned_by?: string;
  priority?: Priority;
};
export type NewActivityLog = Pick<ActivityLog, "task_id" | "type" | "content"> & {
  target_date?: string;
};
