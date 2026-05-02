"use client";

import { useCallback } from "react";
import { useKanbanStore } from "@/hooks/use-store";
import { parseISO, differenceInDays, startOfToday } from "date-fns";

export interface NotifPrefs {
  dueDateDays: number[];
  confirmingDays: number[];
  remindingDays: number[];
}

export function useNotificationEngine() {
  const tasks = useKanbanStore((s) => s.tasks);
  const activityLogs = useKanbanStore((s) => s.activityLogs);
  const addNotification = useKanbanStore((s) => s.addNotification);

  const generateNotifications = useCallback((prefs: NotifPrefs = { dueDateDays: [0, 1, 3, 5], confirmingDays: [0], remindingDays: [0] }) => {
    const today = startOfToday();
    const generated: string[] = [];

    tasks.forEach((task) => {
      if (task.due_date) {
        const d = parseISO(task.due_date);
        const diff = differenceInDays(d, today);
        if (prefs.dueDateDays.includes(diff)) {
          const msg = diff === 0 ? `"${task.title}" jatuh tempo HARI INI!` : `"${task.title}" jatuh tempo ${diff} hari lagi`;
          addNotification(msg);
          generated.push(msg);
        }
      }
    });

    activityLogs.forEach((log) => {
      if (log.target_date) {
        const d = parseISO(log.target_date);
        const diff = differenceInDays(d, today);
        const days = log.type === "confirming" ? prefs.confirmingDays : prefs.remindingDays;
        if (days.includes(diff)) {
          const task = tasks.find((t) => t.id === log.task_id);
          if (task) {
            const label = log.type === "confirming" ? "Confirming" : "Reminding";
            const suffix = diff === 0 ? "HARI INI!" : `${diff} hari lagi`;
            const msg = `${label}: "${task.title}" - ${suffix}`;
            addNotification(msg);
            generated.push(msg);
          }
        }
      }
    });

    return generated;
  }, [tasks, activityLogs, addNotification]);

  return { generateNotifications };
}
