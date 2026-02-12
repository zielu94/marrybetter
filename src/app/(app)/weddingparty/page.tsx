import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getPartyData } from "@/actions/party.actions";
import PartyPageClient from "@/components/party/PartyPageClient";

export const metadata = { title: "Hochzeitsgesellschaft | MarryBetter.com" };

export default async function WeddingPartyPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const project = await getPartyData(session.user.id);
  if (!project) redirect("/onboarding");

  const members = project.partyMembers.map((m) => ({
    id: m.id,
    name: m.name,
    role: m.role,
    side: m.side,
    notes: m.notes,
    guestId: m.guestId,
    guest: m.guest
      ? {
          id: m.guest.id,
          firstName: m.guest.firstName,
          lastName: m.guest.lastName,
          email: m.guest.email,
          phone: m.guest.phone,
          status: m.guest.status,
          inviteSent: m.guest.inviteSent,
          diet: m.guest.diet,
          seatingTableName: m.guest.seatingTable?.name ?? null,
        }
      : null,
  }));

  const availableGuests = project.guests.map((g) => ({
    id: g.id,
    firstName: g.firstName,
    lastName: g.lastName,
    email: g.email,
    phone: g.phone,
    status: g.status,
    alreadyInParty: !!g.partyMember,
  }));

  return (
    <PartyPageClient
      members={members}
      availableGuests={availableGuests}
      projectId={project.id}
    />
  );
}
