import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getCalendarData } from "@/actions/calendar.actions";
import CalendarPageClient from "@/components/calendar/CalendarPageClient";

export const metadata = { title: "Kalender | MarryBetter.com" };

export default async function CalendarPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const data = await getCalendarData(session.user.id);
  if (!data) redirect("/onboarding");

  return <CalendarPageClient weddingDate={data.weddingDate ? data.weddingDate.toISOString() : null} tasks={data.tasks} scheduleDays={data.scheduleDays} />;
}
