"use client";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { createScheduleEvent, updateScheduleEvent, deleteScheduleEvent } from "@/actions/schedule.actions";

interface ScheduleEventData {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startTime: string;
  endTime: string | null;
}

interface ScheduleEventFormProps {
  dayId: string;
  event?: ScheduleEventData | null;
  onClose: () => void;
}

export default function ScheduleEventForm({ dayId, event, onClose }: ScheduleEventFormProps) {
  async function handleSubmit(formData: FormData) {
    if (event) {
      formData.set("id", event.id);
      await updateScheduleEvent(formData);
    } else {
      formData.set("dayId", dayId);
      await createScheduleEvent(formData);
    }
    onClose();
  }

  async function handleDelete() {
    if (!event) return;
    const fd = new FormData();
    fd.set("id", event.id);
    await deleteScheduleEvent(fd);
    onClose();
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <Input
        name="title"
        label="Titel"
        placeholder="z.B. Standesamtliche Trauung"
        defaultValue={event?.title || ""}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          name="startTime"
          label="Startzeit"
          type="time"
          defaultValue={event?.startTime || ""}
          required
        />
        <Input
          name="endTime"
          label="Endzeit (optional)"
          type="time"
          defaultValue={event?.endTime || ""}
        />
      </div>

      <Input
        name="location"
        label="Ort (optional)"
        placeholder="z.B. Schlosspark"
        defaultValue={event?.location || ""}
      />

      <div className="w-full">
        <label className="block text-sm font-medium text-text-muted mb-1.5">Beschreibung (optional)</label>
        <textarea
          name="description"
          rows={2}
          defaultValue={event?.description || ""}
          placeholder="Details zum Programmpunkt..."
          className="w-full px-4 py-3 rounded-xl border border-border bg-surface-1 text-text focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all duration-200 placeholder:text-text-faint"
        />
      </div>

      <div className="flex flex-col items-center gap-3 pt-2">
        <Button type="submit" variant="primary" size="lg" fullWidth>
          {event ? "Speichern" : "Hinzufügen"}
        </Button>
        {event && (
          <button type="button" onClick={handleDelete} className="text-red-500 text-sm font-medium hover:text-red-600">
            Löschen
          </button>
        )}
      </div>
    </form>
  );
}
