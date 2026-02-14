import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { resolveProjectId } from "@/lib/project-context";
import AppLayoutClient from "./AppLayoutClient";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { image: true, role: true, name: true, partnerName: true },
  });

  const role = user?.role || "COUPLE";
  const projectId = await resolveProjectId(session.user.id);

  // Planners without a selected project see the planner dashboard
  // (but still render the layout so /planner page works)
  let sidebarConfig = "{}";
  let theme = "light";
  let projectCoupleName: string | null = null;

  if (projectId) {
    const project = await prisma.weddingProject.findUnique({
      where: { id: projectId },
      select: {
        sidebarConfig: true,
        theme: true,
        coupleName: true,
      },
    });
    sidebarConfig = project?.sidebarConfig ?? "{}";
    theme = project?.theme ?? "light";
    projectCoupleName = project?.coupleName ?? null;
  }

  return (
    <AppLayoutClient
      sidebarConfigRaw={sidebarConfig}
      theme={theme}
      userImage={user?.image ?? null}
      userRole={role}
      projectCoupleName={projectCoupleName}
    >
      {children}
    </AppLayoutClient>
  );
}
