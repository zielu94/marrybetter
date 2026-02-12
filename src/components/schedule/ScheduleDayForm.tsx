"use client";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { createScheduleDay, updateScheduleDay, deleteScheduleDay } from "@/actions/schedule.actions";

interface ScheduleDayData {
  id: string;
  name: string;
  date: string | null;
}

interface ScheduleDayFormProps {
  projectId: string;
  day?: ScheduleDayData | null;
  onClose: () => void;
}

export default function ScheduleDayForm({ projectId, day, onClose }: ScheduleDayFormProps) {
  async function handleSubmit(formData: FormData) {
    if (day) {
      formData.set("id", day.id);
      await updateScheduleDay(formData);
    } else {
      formData.set("projectId", projectId);
      await createScheduleDay(formData);
    }
    onClose();
  }

  async function handleDelete() {
    if (!day) return;
    const fd = new FormData();
    fd.set("id", day.id);
    await deleteScheduleDay(fd);
    onClose();
  }

  // Format date for input[type=date]
  const dateValue = day?.date ? new Date(day.date).toISOString().split("T")[0] : "";

  return (
    <form action={handleSubmit} className="space-y-5">
      <Input
        name="name"
        label="Name"
        placeholder="z.B. Hochzeitstag"
        defaultValue={day?.name || ""}
        required
      />

      <Input
        name="date"
        label="Datum"
        type="date"
        defaultValue={dateValue}
      />

      <div className="flex flex-col items-center gap-3 pt-2">
        <Button type="submit" variant="primary" size="lg" fullWidth>
          {day ? "Speichern" : "Hinzufügen"}
        </Button>
        {day && (
          <button type="button" onClick={handleDelete} className="text-red-500 text-sm font-medium hover:text-red-600">
            Tag löschen
          </button>
        )}
      </div>
    </form>
  );
}
