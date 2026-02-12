import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getSchedulePrintData } from "@/actions/schedule.actions";
import SchedulePrintView from "@/components/schedule/SchedulePrintView";

export const metadata = { title: "Ablaufplan | MarryBetter.com" };

export default async function SchedulePrintPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;

  // Parse query parameters
  const dayIdsParam = typeof params.days === "string" ? params.days : undefined;
  const dayIds = dayIdsParam ? dayIdsParam.split(",").filter(Boolean) : undefined;
  const detail = params.detail === "true";
  const contacts = params.contacts === "true";
  const conflicts = params.conflicts !== "false"; // default true

  const project = await getSchedulePrintData(session.user.id, dayIds);
  if (!project) redirect("/onboarding");

  // Serialize for client component
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

  const vendors = contacts
    ? project.vendors.map((v) => ({
        name: v.name,
        category: v.category,
        contactName: v.contactName,
        email: v.email,
        phone: v.phone,
      }))
    : [];

  const coupleName = [project.user.name, project.user.partnerName]
    .filter(Boolean)
    .join(" & ");

  const meta = {
    coupleName,
    weddingDate: project.weddingDate?.toISOString() ?? null,
    location: project.location,
  };

  return (
    <SchedulePrintView
      days={days}
      vendors={vendors}
      meta={meta}
      options={{ detail, contacts, conflicts }}
    />
  );
}
