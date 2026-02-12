"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ── Data Fetching ──────────────────────────────────

export async function getFoodData(userId: string) {
  return prisma.weddingProject.findUnique({
    where: { userId },
    include: {
      guests: {
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        select: {
          id: true,
          firstName: true,
          lastName: true,
          status: true,
          diet: true,
          mealType: true,
          allergiesNote: true,
          age: true,
          seatingTable: { select: { name: true } },
        },
      },
      foodCategories: {
        orderBy: { sortOrder: "asc" },
        include: { items: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });
}

// ── Guest Meal Updates ──────────────────────────────

export async function updateGuestMeal(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  const mealType = formData.get("mealType") as string;
  const diet = formData.get("diet") as string;
  const allergiesNote = formData.get("allergiesNote") as string;

  await prisma.guest.update({
    where: { id },
    data: {
      ...(mealType !== undefined && { mealType: mealType || "STANDARD" }),
      ...(diet !== undefined && { diet: diet || null }),
      ...(allergiesNote !== undefined && { allergiesNote: allergiesNote || null }),
    },
  });
  revalidatePath("/food");
  revalidatePath("/guests");
}

export async function bulkUpdateMealType(formData: FormData) {
  const ids = (formData.get("ids") as string)?.split(",").filter(Boolean);
  const mealType = formData.get("mealType") as string;
  if (!ids?.length || !mealType) return;

  await prisma.guest.updateMany({
    where: { id: { in: ids } },
    data: { mealType },
  });
  revalidatePath("/food");
  revalidatePath("/guests");
}

// ── Drink Category CRUD (lightweight) ───────────────

export async function createFoodCategory(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const name = formData.get("name") as string;
  if (!projectId || !name) return;

  const count = await prisma.foodCategory.count({ where: { weddingProjectId: projectId } });
  await prisma.foodCategory.create({
    data: { weddingProjectId: projectId, name, sortOrder: count },
  });
  revalidatePath("/food");
}

export async function updateFoodCategory(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  if (!id) return;

  await prisma.foodCategory.update({
    where: { id },
    data: { ...(name && { name }) },
  });
  revalidatePath("/food");
}

export async function deleteFoodCategory(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;
  await prisma.foodCategory.delete({ where: { id } });
  revalidatePath("/food");
}

// ── Drink Item CRUD ──────────────────────────────

export async function createFoodItem(formData: FormData) {
  const foodCategoryId = formData.get("foodCategoryId") as string;
  const name = formData.get("name") as string;
  if (!foodCategoryId || !name) return;

  const quantityStr = formData.get("quantity") as string;
  const notes = (formData.get("notes") as string) || undefined;
  const quantity = quantityStr ? parseInt(quantityStr) : undefined;

  const count = await prisma.foodItem.count({ where: { foodCategoryId } });

  await prisma.foodItem.create({
    data: {
      foodCategoryId,
      name,
      quantity: quantity && !isNaN(quantity) ? quantity : undefined,
      notes,
      sortOrder: count,
    },
  });
  revalidatePath("/food");
}

export async function updateFoodItem(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  const name = formData.get("name") as string;
  const quantityStr = formData.get("quantity") as string;
  const notes = formData.get("notes") as string;

  const quantity = quantityStr ? parseInt(quantityStr) : null;

  await prisma.foodItem.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(quantityStr !== undefined && { quantity: quantity && !isNaN(quantity) ? quantity : null }),
      ...(notes !== undefined && { notes: notes || null }),
    },
  });
  revalidatePath("/food");
}

export async function deleteFoodItem(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;
  await prisma.foodItem.delete({ where: { id } });
  revalidatePath("/food");
}
