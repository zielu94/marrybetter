import { prisma } from "@/lib/prisma";

/**
 * Resolves the active projectId for a given user.
 * - If user has an activeProjectId set, uses that.
 * - Otherwise falls back to the first (or only) project.
 * - Returns null if user has no projects.
 */
export async function resolveProjectId(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, activeProjectId: true },
  });
  if (!user) return null;

  // If activeProjectId is set, verify it still exists and belongs to user
  if (user.activeProjectId) {
    const project = await prisma.weddingProject.findFirst({
      where: { id: user.activeProjectId, userId },
      select: { id: true },
    });
    if (project) return project.id;
  }

  // Fallback: first project of the user
  const project = await prisma.weddingProject.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  return project?.id ?? null;
}
