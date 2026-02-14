"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { seedNewProject } from "./auth.actions";

// ── Data Fetching ──────────────────────────────────

export async function getProjectList(userId: string) {
  const projects = await prisma.weddingProject.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      guests: { select: { id: true, status: true } },
      tasks: { select: { id: true, status: true } },
      budgetCategories: {
        include: { budgetItems: { select: { actualAmount: true } } },
      },
      vendors: { select: { id: true, status: true } },
    },
  });

  return projects.map((p) => ({
    id: p.id,
    coupleName: p.coupleName || "Unbenanntes Paar",
    coupleEmail: p.coupleEmail,
    weddingDate: p.weddingDate?.toISOString() ?? null,
    hasNoDate: p.hasNoDate,
    location: p.location,
    notes: p.notes,
    createdAt: p.createdAt.toISOString(),
    // KPIs
    guestCount: p.guests.length,
    guestsConfirmed: p.guests.filter((g) => g.status === "CONFIRMED").length,
    taskCount: p.tasks.length,
    tasksDone: p.tasks.filter((t) => t.status === "DONE").length,
    vendorCount: p.vendors.length,
    vendorsBooked: p.vendors.filter((v) => v.status === "BOOKED").length,
    totalSpent: p.budgetCategories.reduce(
      (sum, cat) => sum + cat.budgetItems.reduce((s, item) => s + item.actualAmount, 0),
      0
    ),
    totalBudget: p.totalBudget,
  }));
}

// ── Project Switching ────────────────────────────────

export async function switchProject(userId: string, projectId: string) {
  // Verify the project belongs to the user
  const project = await prisma.weddingProject.findFirst({
    where: { id: projectId, userId },
    select: { id: true },
  });
  if (!project) return { error: "Projekt nicht gefunden" };

  await prisma.user.update({
    where: { id: userId },
    data: { activeProjectId: projectId },
  });

  revalidatePath("/", "layout");
  return { success: true };
}

// ── Project CRUD ─────────────────────────────────────

export async function createProject(formData: FormData) {
  const userId = formData.get("userId") as string;
  const coupleName = formData.get("coupleName") as string;
  const coupleEmail = (formData.get("coupleEmail") as string) || undefined;
  const weddingDateStr = formData.get("weddingDate") as string;
  const hasNoDate = formData.get("hasNoDate") === "true";
  const location = (formData.get("location") as string) || undefined;

  if (!userId || !coupleName) return { error: "Paarname ist erforderlich" };

  // Parse couple name into two names
  const names = coupleName.split(/\s*&\s*|\s+und\s+/i);
  const name1 = names[0]?.trim() || coupleName;
  const name2 = names[1]?.trim() || "";

  const weddingDate = weddingDateStr && !hasNoDate ? new Date(weddingDateStr) : null;

  const project = await seedNewProject({
    userId,
    name: name1,
    partnerName: name2,
    weddingDate,
    hasNoDate,
    coupleName,
    coupleEmail,
  });

  // Update location if provided
  if (location) {
    await prisma.weddingProject.update({
      where: { id: project.id },
      data: { location },
    });
  }

  // Set as active project
  await prisma.user.update({
    where: { id: userId },
    data: { activeProjectId: project.id },
  });

  revalidatePath("/planner");
  return { success: true, projectId: project.id };
}

export async function updateProjectNotes(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const notes = formData.get("notes") as string;
  if (!projectId) return;

  await prisma.weddingProject.update({
    where: { id: projectId },
    data: { notes: notes || null },
  });

  revalidatePath("/planner");
}
