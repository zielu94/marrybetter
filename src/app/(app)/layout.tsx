import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AppLayoutClient from "./AppLayoutClient";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const project = await prisma.weddingProject.findFirst({
    where: { userId: session.user.id },
    select: {
      sidebarConfig: true,
      theme: true,
    },
  });

  return (
    <AppLayoutClient
      sidebarConfigRaw={project?.sidebarConfig ?? "{}"}
      theme={project?.theme ?? "light"}
    >
      {children}
    </AppLayoutClient>
  );
}
