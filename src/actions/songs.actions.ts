"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ── Data Fetching ──────────────────────────────────

export async function getSongsData(userId: string) {
  return prisma.weddingProject.findUnique({
    where: { userId },
    select: {
      id: true,
      songs: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      },
      spotifyPlaylists: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      },
    },
  });
}

// ── Song CRUD ──────────────────────────────────────

export async function createSong(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const title = (formData.get("title") as string)?.trim();
  if (!projectId || !title) return;

  const artist = (formData.get("artist") as string)?.trim() || null;
  const spotifyUrl = (formData.get("spotifyUrl") as string)?.trim() || null;
  const category = (formData.get("category") as string) || "OTHER";
  const notes = (formData.get("notes") as string)?.trim() || null;

  const count = await prisma.song.count({ where: { weddingProjectId: projectId } });

  await prisma.song.create({
    data: {
      weddingProjectId: projectId,
      title,
      artist,
      spotifyUrl,
      category,
      notes,
      sortOrder: count,
    },
  });
  revalidatePath("/songs");
}

export async function updateSong(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  const title = (formData.get("title") as string)?.trim();
  const artist = formData.get("artist") as string;
  const spotifyUrl = formData.get("spotifyUrl") as string;
  const category = formData.get("category") as string;
  const notes = formData.get("notes") as string;

  await prisma.song.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(artist !== undefined && { artist: artist?.trim() || null }),
      ...(spotifyUrl !== undefined && { spotifyUrl: spotifyUrl?.trim() || null }),
      ...(category && { category }),
      ...(notes !== undefined && { notes: notes?.trim() || null }),
    },
  });
  revalidatePath("/songs");
}

export async function deleteSong(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;
  await prisma.song.delete({ where: { id } });
  revalidatePath("/songs");
}

// ── Spotify Playlist CRUD ──────────────────────────

export async function createSpotifyPlaylist(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const name = (formData.get("name") as string)?.trim();
  const spotifyUrl = (formData.get("spotifyUrl") as string)?.trim();
  if (!projectId || !name || !spotifyUrl) return;

  const description = (formData.get("description") as string)?.trim() || null;

  const count = await prisma.spotifyPlaylist.count({ where: { weddingProjectId: projectId } });

  await prisma.spotifyPlaylist.create({
    data: {
      weddingProjectId: projectId,
      name,
      spotifyUrl,
      description,
      sortOrder: count,
    },
  });
  revalidatePath("/songs");
}

export async function updateSpotifyPlaylist(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  const name = (formData.get("name") as string)?.trim();
  const spotifyUrl = (formData.get("spotifyUrl") as string)?.trim();
  const description = formData.get("description") as string;

  await prisma.spotifyPlaylist.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(spotifyUrl && { spotifyUrl }),
      ...(description !== undefined && { description: description?.trim() || null }),
    },
  });
  revalidatePath("/songs");
}

export async function deleteSpotifyPlaylist(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;
  await prisma.spotifyPlaylist.delete({ where: { id } });
  revalidatePath("/songs");
}
