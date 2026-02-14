"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { resolveProjectId } from "@/lib/project-context";

export async function getBudgetData(userId: string) {
  const projectId = await resolveProjectId(userId);
  if (!projectId) return null;
  return prisma.weddingProject.findUnique({
    where: { id: projectId },
    include: {
      budgetCategories: {
        orderBy: { sortOrder: "asc" },
        include: { budgetItems: { orderBy: { createdAt: "asc" } } },
      },
      vendors: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          name: true,
          category: true,
          status: true,
          estimatedCost: true,
          actualCost: true,
        },
      },
    },
  });
}

export async function updateTotalBudget(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const amount = parseFloat(formData.get("amount") as string);
  if (!projectId || isNaN(amount)) return;

  await prisma.weddingProject.update({ where: { id: projectId }, data: { totalBudget: amount } });
  revalidatePath("/budget");
}

export async function createBudgetCategory(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const name = formData.get("name") as string;
  const plannedAmount = parseFloat(formData.get("plannedAmount") as string) || 0;
  if (!projectId || !name) return;

  const count = await prisma.budgetCategory.count({ where: { weddingProjectId: projectId } });
  await prisma.budgetCategory.create({ data: { weddingProjectId: projectId, name, plannedAmount, sortOrder: count } });
  revalidatePath("/budget");
}

export async function updateBudgetCategory(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const plannedAmount = parseFloat(formData.get("plannedAmount") as string);
  if (!id) return;

  await prisma.budgetCategory.update({
    where: { id },
    data: { ...(name && { name }), ...(!isNaN(plannedAmount) && { plannedAmount }) },
  });
  revalidatePath("/budget");
}

export async function deleteBudgetCategory(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;
  await prisma.budgetCategory.delete({ where: { id } });
  revalidatePath("/budget");
}

export async function createBudgetItem(formData: FormData) {
  const categoryId = formData.get("categoryId") as string;
  const name = formData.get("name") as string;
  const plannedAmount = parseFloat(formData.get("plannedAmount") as string) || 0;
  const actualAmount = parseFloat(formData.get("actualAmount") as string) || 0;
  const paymentStatus = (formData.get("paymentStatus") as string) || "UNPAID";
  const notes = (formData.get("notes") as string) || undefined;
  if (!categoryId || !name) return;

  await prisma.budgetItem.create({ data: { budgetCategoryId: categoryId, name, plannedAmount, actualAmount, paymentStatus, notes } });
  revalidatePath("/budget");
}

export async function updateBudgetItem(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  const name = formData.get("name") as string;
  const plannedAmount = parseFloat(formData.get("plannedAmount") as string);
  const actualAmount = parseFloat(formData.get("actualAmount") as string);
  const paymentStatus = formData.get("paymentStatus") as string;
  const notes = formData.get("notes") as string;

  await prisma.budgetItem.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(!isNaN(plannedAmount) && { plannedAmount }),
      ...(!isNaN(actualAmount) && { actualAmount }),
      ...(paymentStatus && { paymentStatus }),
      ...(notes !== null && { notes: notes || undefined }),
    },
  });
  revalidatePath("/budget");
}

export async function deleteBudgetItem(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;
  await prisma.budgetItem.delete({ where: { id } });
  revalidatePath("/budget");
}
