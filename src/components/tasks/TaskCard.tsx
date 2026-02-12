"use client";

import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from "@/types";
import type { TaskPriority, TaskStatus } from "@/types";
import { updateTaskStatus, deleteTask } from "@/actions/task.actions";

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description: string | null;
    category: string | null;
    dueDate: Date | null;
    priority: string;
    status: string;
  };
  onEdit: () => void;
}

const priorityVariant: Record<string, "success" | "warning" | "danger"> = {
  LOW: "success",
  MEDIUM: "warning",
  HIGH: "danger",
};

export default function TaskCard({ task, onEdit }: TaskCardProps) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";
  const nextStatus = task.status === "DONE" ? "OPEN" : "DONE";

  return (
    <Card padding="sm" className={isOverdue ? "border-red-200 bg-red-50/30" : ""}>
      <div className="flex items-start gap-3 p-2">
        {/* Status checkbox */}
        <form action={updateTaskStatus} className="pt-0.5">
          <input type="hidden" name="id" value={task.id} />
          <input type="hidden" name="status" value={nextStatus} />
          <button type="submit" className="flex-shrink-0">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              task.status === "DONE" ? "border-green-500 bg-green-500" : "border-border hover:border-primary-400"
            }`}>
              {task.status === "DONE" && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </button>
        </form>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`font-medium ${task.status === "DONE" ? "line-through text-text-faint" : "text-text"}`}>
              {task.title}
            </h3>
            <Badge variant={priorityVariant[task.priority] || "default"}>
              {TASK_PRIORITY_LABELS[task.priority as TaskPriority] || task.priority}
            </Badge>
            {task.status === "IN_PROGRESS" && (
              <Badge variant="info">{TASK_STATUS_LABELS[task.status as TaskStatus]}</Badge>
            )}
            {task.category && (
              <span className="text-xs text-text-faint">{task.category}</span>
            )}
          </div>
          {task.description && (
            <p className="text-sm text-text-muted mt-1 truncate">{task.description}</p>
          )}
          <div className="flex items-center gap-3 mt-1">
            {task.dueDate && (
              <span className={`text-xs ${isOverdue ? "text-red-500 font-medium" : "text-text-faint"}`}>
                {isOverdue ? "Überfällig: " : "Fällig: "}{formatDate(task.dueDate)}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button onClick={onEdit} className="p-1.5 text-text-faint hover:text-primary-500 transition-colors rounded-lg hover:bg-surface-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <form action={deleteTask}>
            <input type="hidden" name="id" value={task.id} />
            <button type="submit" className="p-1.5 text-text-faint hover:text-red-500 transition-colors rounded-lg hover:bg-surface-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </Card>
  );
}
