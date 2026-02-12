"use server";

import { prisma } from "@/lib/prisma";

export async function getDashboardData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, partnerName: true },
  });

  const project = await prisma.weddingProject.findUnique({
    where: { userId },
    include: {
      guests: true,
      vendors: true,
      tasks: { orderBy: [{ dueDate: "asc" }, { sortOrder: "asc" }] },
      budgetCategories: {
        orderBy: { sortOrder: "asc" },
        include: { budgetItems: true },
      },
    },
  });

  if (!project || !user) return null;

  return {
    userName: user.name,
    partnerName: user.partnerName,
    weddingDate: project.weddingDate?.toISOString() ?? null,
    guests: project.guests,
    vendors: project.vendors,
    tasks: project.tasks.map((t) => ({
      ...t,
      dueDate: t.dueDate?.toISOString() ?? null,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    })),
    budgetCategories: project.budgetCategories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      plannedAmount: cat.plannedAmount,
      items: cat.budgetItems,
    })),
    totalBudget: project.totalBudget,
  };
}
