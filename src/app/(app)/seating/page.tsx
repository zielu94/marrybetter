import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getSeatingData } from "@/actions/seating.actions";
import SeatingBuilder from "@/components/seating/SeatingBuilder";

export const metadata = { title: "Sitzplan | MarryBetter.com" };

export default async function SeatingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const project = await getSeatingData(session.user.id);
  if (!project) redirect("/onboarding");

  // Serialize for client component
  const tables = project.seatingTables.map((table) => ({
    id: table.id,
    name: table.name,
    capacity: table.capacity,
    shape: table.shape,
    posX: table.posX,
    posY: table.posY,
    width: table.width,
    height: table.height,
    rotation: table.rotation,
    guests: table.guests.map((g) => ({
      id: g.id,
      firstName: g.firstName,
      lastName: g.lastName,
      status: g.status,
      seatingTableId: g.seatingTableId,
      seatNumber: g.seatNumber,
    })),
  }));

  const allGuests = project.guests.map((g) => ({
    id: g.id,
    firstName: g.firstName,
    lastName: g.lastName,
    status: g.status,
    seatingTableId: g.seatingTableId,
    seatNumber: g.seatNumber,
  }));

  const roomItems = project.roomItems.map((item) => ({
    id: item.id,
    itemType: item.itemType,
    label: item.label,
    posX: item.posX,
    posY: item.posY,
    width: item.width,
    height: item.height,
    rotation: item.rotation,
  }));

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8 h-[calc(100vh-4rem)] overflow-hidden">
      <SeatingBuilder
        projectId={project.id}
        initialTables={tables}
        initialGuests={allGuests}
        initialRoomItems={roomItems}
      />
    </div>
  );
}
