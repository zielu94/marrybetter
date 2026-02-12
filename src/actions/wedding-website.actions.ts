"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ── Public Data Fetching (no auth required) ──────────

export async function getPublicWeddingData(slug: string) {
  if (!slug) return null;

  const project = await prisma.weddingProject.findUnique({
    where: { slug },
    include: {
      user: { select: { name: true, partnerName: true, image: true } },
      scheduleDays: {
        orderBy: { sortOrder: "asc" },
        include: {
          events: { orderBy: { sortOrder: "asc" } },
        },
      },
      photos: { orderBy: { sortOrder: "asc" }, take: 20 },
      moodItems: { orderBy: { sortOrder: "asc" }, take: 20 },
    },
  });

  if (!project || !project.isPublicWebsite) return null;

  return project;
}

// ── Settings (auth required) ──────────────────────────

export async function generateSlug(name: string, partnerName: string): Promise<string> {
  const base = `${name}-${partnerName}`
    .toLowerCase()
    .replace(/[äÄ]/g, "ae")
    .replace(/[öÖ]/g, "oe")
    .replace(/[üÜ]/g, "ue")
    .replace(/[ß]/g, "ss")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  // Check uniqueness
  const existing = await prisma.weddingProject.findUnique({ where: { slug: base } });
  if (!existing) return base;

  // Add random suffix if taken
  const suffix = Math.random().toString(36).substring(2, 6);
  return `${base}-${suffix}`;
}

export async function updateWebsiteSettings(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  if (!projectId) return { error: "Projekt nicht gefunden." };

  const slug = (formData.get("slug") as string)?.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  const isPublicWebsite = formData.get("isPublicWebsite") === "on";
  const websiteStory = formData.get("websiteStory") as string;
  const websiteAccommodation = formData.get("websiteAccommodation") as string;
  const websiteHeroImage = formData.get("websiteHeroImage") as string;

  if (!slug || slug.length < 3) {
    return { error: "Der Slug muss mindestens 3 Zeichen lang sein." };
  }

  // Check uniqueness (not own project)
  const existing = await prisma.weddingProject.findUnique({ where: { slug } });
  if (existing && existing.id !== projectId) {
    return { error: "Dieser Slug ist bereits vergeben. Bitte wähle einen anderen." };
  }

  await prisma.weddingProject.update({
    where: { id: projectId },
    data: {
      slug,
      isPublicWebsite,
      websiteStory: websiteStory || null,
      websiteAccommodation: websiteAccommodation || null,
      websiteHeroImage: websiteHeroImage || null,
    },
  });

  revalidatePath("/settings");
  return { success: true };
}
