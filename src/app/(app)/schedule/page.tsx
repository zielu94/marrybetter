import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getScheduleData } from "@/actions/schedule.actions";
import SchedulePageClient from "@/components/schedule/SchedulePageClient";

export const metadata = { title: "Zeitplan | MarryBetter.com" };

export default async function SchedulePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const project = await getScheduleData(session.user.id);
  if (!project) redirect("/onboarding");

  // Serialize dates for client component
  const days = project.scheduleDays.map((day) => ({
    id: day.id,
    name: day.name,
    date: day.date?.toISOString() ?? null,
    events: day.events.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      location: e.location,
      startTime: e.startTime,
      endTime: e.endTime,
      owner: e.owner,
      visibility: e.visibility,
    })),
  }));

  return <SchedulePageClient days={days} projectId={project.id} />;
}
