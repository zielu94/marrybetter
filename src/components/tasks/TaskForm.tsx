"use client";

import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { createTask, updateTask } from "@/actions/task.actions";
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from "@/types";
import type { TaskPriority, TaskStatus } from "@/types";

interface TaskFormProps {
  projectId: string;
  task?: {
    id: string;
    title: string;
    description: string | null;
    category: string | null;
    dueDate: Date | null;
    priority: string;
    status: string;
  } | null;
  onClose: () => void;
}

const priorityOptions = Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => ({ value, label }));
const statusOptions = Object.entries(TASK_STATUS_LABELS).map(([value, label]) => ({ value, label }));

export default function TaskForm({ projectId, task, onClose }: TaskFormProps) {
  const dueDateValue = task?.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "";

  return (
    <form
      action={async (formData) => {
        if (task) {
          await updateTask(formData);
        } else {
          await createTask(formData);
        }
        onClose();
      }}
      className="space-y-4"
    >
      {task ? (
        <input type="hidden" name="id" value={task.id} />
      ) : (
        <input type="hidden" name="projectId" value={projectId} />
      )}

      <Input name="title" label="Titel" defaultValue={task?.title} required />

      <div className="w-full">
        <label className="block text-sm font-medium text-text-muted mb-1.5">Beschreibung</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={task?.description || ""}
          className="w-full px-4 py-3 rounded-xl border border-border bg-surface-1 text-text focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all duration-200"
          placeholder="Optionale Beschreibung..."
        />
      </div>

      <Input name="category" label="Kategorie" defaultValue={task?.category || ""} placeholder="z.B. Location, Catering" />
      <Input name="dueDate" label="Fällig am" type="date" defaultValue={dueDateValue} />

      <div className="grid grid-cols-2 gap-4">
        <Select name="priority" label="Prioritaet" options={priorityOptions} defaultValue={task?.priority || "MEDIUM"} />
        {task && <Select name="status" label="Status" options={statusOptions} defaultValue={task.status} />}
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" onClick={onClose}>Abbrechen</Button>
        <Button type="submit">{task ? "Speichern" : "Hinzufügen"}</Button>
      </div>
    </form>
  );
}
