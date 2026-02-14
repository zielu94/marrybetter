import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getProjectList } from "@/actions/planner.actions";
import PlannerDashboard from "@/components/planner/PlannerDashboard";

export default async function PlannerPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const projects = await getProjectList(session.user.id);

  return <PlannerDashboard projects={projects} userId={session.user.id} />;
}
