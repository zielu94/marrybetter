"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { resolveProjectId } from "@/lib/project-context";

// ── Data Fetching ──────────────────────────────────

export async function getSeatingData(userId: string) {
  const projectId = await resolveProjectId(userId);
  if (!projectId) return null;
  return prisma.weddingProject.findUnique({
    where: { id: projectId },
    include: {
      seatingTables: {
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        include: {
          guests: {
            orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
          },
        },
      },
      guests: {
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      },
      roomItems: true,
    },
  });
}

// ── SeatingTable CRUD ──────────────────────────────

export async function createTable(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const name = formData.get("name") as string;
  if (!projectId || !name) return;

  const capacityStr = formData.get("capacity") as string;
  const shape = (formData.get("shape") as string) || "ROUND";
  const posXStr = formData.get("posX") as string;
  const posYStr = formData.get("posY") as string;

  const capacity = capacityStr ? parseInt(capacityStr) : 10;
  const posX = posXStr ? parseFloat(posXStr) : 100;
  const posY = posYStr ? parseFloat(posYStr) : 100;

  // Default dimensions based on shape
  const shapeDimensions: Record<string, { width: number; height: number }> = {
    ROUND: { width: 120, height: 120 },
    RECT: { width: 140, height: 100 },
    LONG: { width: 240, height: 80 },
  };
  const dims = shapeDimensions[shape] || shapeDimensions.ROUND;

  await prisma.seatingTable.create({
    data: {
      weddingProjectId: projectId,
      name,
      capacity,
      shape,
      posX,
      posY,
      width: dims.width,
      height: dims.height,
    },
  });
  revalidatePath("/seating");
}

export async function updateTable(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  const data: Record<string, unknown> = {};

  const name = formData.get("name") as string;
  const capacityStr = formData.get("capacity") as string;
  const shape = formData.get("shape") as string;
  const posXStr = formData.get("posX") as string;
  const posYStr = formData.get("posY") as string;
  const widthStr = formData.get("width") as string;
  const heightStr = formData.get("height") as string;
  const rotationStr = formData.get("rotation") as string;

  if (name) data.name = name;
  if (capacityStr) data.capacity = parseInt(capacityStr);
  if (shape) data.shape = shape;
  if (posXStr) data.posX = parseFloat(posXStr);
  if (posYStr) data.posY = parseFloat(posYStr);
  if (widthStr) data.width = parseFloat(widthStr);
  if (heightStr) data.height = parseFloat(heightStr);
  if (rotationStr !== null && rotationStr !== undefined && rotationStr !== "")
    data.rotation = parseFloat(rotationStr);

  await prisma.seatingTable.update({ where: { id }, data });
  revalidatePath("/seating");
}

export async function updateTablePosition(formData: FormData) {
  const id = formData.get("id") as string;
  const posX = parseFloat(formData.get("posX") as string);
  const posY = parseFloat(formData.get("posY") as string);
  if (!id || isNaN(posX) || isNaN(posY)) return;

  await prisma.seatingTable.update({
    where: { id },
    data: { posX, posY },
  });
  revalidatePath("/seating");
}

export async function batchUpdatePositions(formData: FormData) {
  const positionsJson = formData.get("positions") as string;
  if (!positionsJson) return;

  const positions = JSON.parse(positionsJson) as Array<{
    id: string;
    posX: number;
    posY: number;
    type: "table" | "roomItem";
  }>;

  const tableUpdates = positions
    .filter((p) => p.type === "table")
    .map((p) =>
      prisma.seatingTable.update({
        where: { id: p.id },
        data: { posX: p.posX, posY: p.posY },
      })
    );

  const roomItemUpdates = positions
    .filter((p) => p.type === "roomItem")
    .map((p) =>
      prisma.roomItem.update({
        where: { id: p.id },
        data: { posX: p.posX, posY: p.posY },
      })
    );

  await prisma.$transaction([...tableUpdates, ...roomItemUpdates]);
  revalidatePath("/seating");
}

export async function duplicateTable(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  const original = await prisma.seatingTable.findUnique({ where: { id } });
  if (!original) return;

  const count = await prisma.seatingTable.count({
    where: { weddingProjectId: original.weddingProjectId },
  });

  await prisma.seatingTable.create({
    data: {
      weddingProjectId: original.weddingProjectId,
      name: `${original.name} (Kopie)`,
      capacity: original.capacity,
      shape: original.shape,
      posX: original.posX + 40,
      posY: original.posY + 40,
      width: original.width,
      height: original.height,
      rotation: original.rotation,
      sortOrder: count,
    },
  });
  revalidatePath("/seating");
}

export async function deleteTable(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  await prisma.guest.updateMany({
    where: { seatingTableId: id },
    data: { seatingTableId: null },
  });

  await prisma.seatingTable.delete({ where: { id } });
  revalidatePath("/seating");
}

// ── Guest Assignment ───────────────────────────────

export async function assignGuest(formData: FormData) {
  const guestId = formData.get("guestId") as string;
  const tableId = formData.get("tableId") as string;
  if (!guestId || !tableId) return;

  const seatNumberStr = formData.get("seatNumber") as string;
  const seatNumber = seatNumberStr ? parseInt(seatNumberStr) : null;

  await prisma.guest.update({
    where: { id: guestId },
    data: { seatingTableId: tableId, seatNumber },
  });
  revalidatePath("/seating");
}

export async function updateGuestSeat(formData: FormData) {
  const guestId = formData.get("guestId") as string;
  const seatNumberStr = formData.get("seatNumber") as string;
  if (!guestId) return;

  const seatNumber = seatNumberStr ? parseInt(seatNumberStr) : null;

  await prisma.guest.update({
    where: { id: guestId },
    data: { seatNumber },
  });
  revalidatePath("/seating");
}

export async function unassignGuest(formData: FormData) {
  const guestId = formData.get("guestId") as string;
  if (!guestId) return;

  await prisma.guest.update({
    where: { id: guestId },
    data: { seatingTableId: null, seatNumber: null },
  });
  revalidatePath("/seating");
}

// ── RoomItem CRUD ──────────────────────────────────

export async function createRoomItem(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const itemType = (formData.get("itemType") as string) || "OTHER";
  if (!projectId) return;

  const defaults: Record<string, { width: number; height: number }> = {
    BAR: { width: 140, height: 60 },
    DANCE_FLOOR: { width: 200, height: 200 },
    CAKE_TABLE: { width: 80, height: 80 },
    STAGE: { width: 200, height: 100 },
    DJ_BOOTH: { width: 100, height: 60 },
    ENTRANCE: { width: 80, height: 40 },
    BUFFET: { width: 180, height: 80 },
    TOILET: { width: 80, height: 60 },
    GARDEN: { width: 160, height: 160 },
    SEATING_AREA: { width: 120, height: 80 },
    PARKING: { width: 160, height: 120 },
    WALL: { width: 200, height: 20 },
    DOOR: { width: 60, height: 20 },
    WARDROBE: { width: 120, height: 60 },
    OTHER: { width: 100, height: 100 },
  };
  const dims = defaults[itemType] || defaults.OTHER;

  const posXStr = formData.get("posX") as string;
  const posYStr = formData.get("posY") as string;

  await prisma.roomItem.create({
    data: {
      weddingProjectId: projectId,
      itemType,
      label: (formData.get("label") as string) || null,
      posX: posXStr ? parseFloat(posXStr) : 200,
      posY: posYStr ? parseFloat(posYStr) : 200,
      width: dims.width,
      height: dims.height,
    },
  });
  revalidatePath("/seating");
}

export async function updateRoomItem(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  const data: Record<string, unknown> = {};
  const label = formData.get("label") as string;
  const itemType = formData.get("itemType") as string;
  const posXStr = formData.get("posX") as string;
  const posYStr = formData.get("posY") as string;
  const widthStr = formData.get("width") as string;
  const heightStr = formData.get("height") as string;
  const rotationStr = formData.get("rotation") as string;

  if (label !== null && label !== undefined) data.label = label || null;
  if (itemType) data.itemType = itemType;
  if (posXStr) data.posX = parseFloat(posXStr);
  if (posYStr) data.posY = parseFloat(posYStr);
  if (widthStr) data.width = parseFloat(widthStr);
  if (heightStr) data.height = parseFloat(heightStr);
  if (rotationStr !== null && rotationStr !== undefined && rotationStr !== "")
    data.rotation = parseFloat(rotationStr);

  await prisma.roomItem.update({ where: { id }, data });
  revalidatePath("/seating");
}

export async function deleteRoomItem(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;
  await prisma.roomItem.delete({ where: { id } });
  revalidatePath("/seating");
}
