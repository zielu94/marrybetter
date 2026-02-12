import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getTasksData } from "@/actions/task.actions";
import TaskPageClient from "@/components/tasks/TaskPageClient";

export const metadata = { title: "Aufgaben | MarryBetter.com" };

export default async function TasksPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const project = await getTasksData(session.user.id);
  if (!project) redirect("/onboarding");

  return <TaskPageClient tasks={project.tasks} projectId={project.id} />;
}
