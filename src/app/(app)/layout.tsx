import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AppLayoutClient from "./AppLayoutClient";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { image: true },
  });

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
      userImage={user?.image ?? null}
    >
      {children}
    </AppLayoutClient>
  );
}
